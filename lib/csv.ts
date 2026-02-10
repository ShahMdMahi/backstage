// "use client";

import Papa from "papaparse";
import {
  REPORTING_CURRENCY,
  REPORTING_TYPE,
  REPORTING_DELIMITER,
} from "@/lib/prisma/enums";

/* ----------------------------- Types ----------------------------- */

type Distributor = "BELIEVE" | "REVELATOR";

type RowValidationError = {
  rowNumber: number;
  reason: string;
  row: string[];
};

/* ----------------------------- Hash ----------------------------- */
/** Browser-safe SHA-256 */
export async function getCSVHash(csvContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(csvContent);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ----------------------------- Utils ----------------------------- */

/**
 * Robustly cleans Believe/Revelator fields by removing outer quotes,
 * unescaping double quotes, and trimming whitespace.
 */
function sanitizeField(field: string): string {
  let f = field.trim();
  // Remove outer quotes if they exist
  if (f.startsWith('"') && f.endsWith('"')) {
    f = f.slice(1, -1);
  }
  // Remove internal double-double quotes (Believe format)
  return f.replace(/""/g, '"').trim();
}

/* -------------------------- BELIEVE PARSER ------------------------ */
/**
 * Specialized parser for Believe lines.
 * Handles the "Wrapped Quote" issue and semicolon logic.
 */
function parseBelieveRow(line: string): string[] {
  let cleanedLine = line.trim();

  // 1. Remove trailing comma after the closing quote if present
  if (cleanedLine.endsWith(",")) {
    cleanedLine = cleanedLine.slice(0, -1);
  }

  // 2. Remove the "Whole Line" wrapping quotes
  if (cleanedLine.startsWith('"') && cleanedLine.endsWith('"')) {
    cleanedLine = cleanedLine.slice(1, -1);
  }

  // 3. Split by semicolon ONLY (Artist names might contain commas)
  const parts = cleanedLine.split(";");

  return parts.map(sanitizeField);
}

/* ----------------------------- Parsing ---------------------------- */

function parseLine(
  line: string,
  distributor: Distributor,
  delimiter: REPORTING_DELIMITER
): string[] {
  if (distributor === "BELIEVE") {
    return parseBelieveRow(line);
  }

  // Use PapaParse for REVELATOR format
  const parsed = Papa.parse<string[]>(line, {
    delimiter: delimiter === REPORTING_DELIMITER.COMMA ? "," : ";",
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
  });

  return parsed.data[0]?.map(sanitizeField) ?? [];
}

/* ----------------------- Financial Precision ---------------------- */

/**
 * Convert decimal string to integer millionths for perfect precision
 * Handles negative values correctly
 */
function decimalStringToMillionths(decimalStr: string): number {
  if (!decimalStr) return NaN;

  // Check if value is negative
  const isNegative =
    decimalStr.includes("-") ||
    (decimalStr.startsWith("(") && decimalStr.endsWith(")"));

  // Remove non-numeric characters except decimal point
  const cleaned = decimalStr.replace(/[^\d.]/g, "");

  if (!cleaned) return NaN;

  // Split by decimal point
  const parts = cleaned.split(".");
  const intPart = parseInt(parts[0] || "0");
  const decimalPart = parts[1] || "0";

  // Pad decimal part to 6 digits (for millionths precision)
  const paddedDecimal = decimalPart.padEnd(6, "0").slice(0, 6);

  // Combine: intPart * 1000000 + decimal part
  let result = intPart * 1_000_000 + parseInt(paddedDecimal);

  // Apply negative sign if needed
  if (isNegative) {
    result = -result;
  }

  return result;
}

/* ----------------------------- Main ------------------------------- */

export function getCSVFormat(csvContent: string): {
  type: REPORTING_TYPE;
  delimiter: REPORTING_DELIMITER;
  currency: REPORTING_CURRENCY;
  netRevenue: number;
  reportingMonth: Date;
  rowErrors: RowValidationError[];
} {
  // Use a regex to handle both \n and \r\n line endings
  const lines = csvContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  /* -------- Detect Format (BELIEVE vs REVELATOR) -------- */

  const firstLineRaw = lines[0].toLowerCase();
  const isBelieve =
    firstLineRaw.includes("reporting month") || firstLineRaw.includes(";");

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.REVELATOR;
  const delimiter = isBelieve
    ? REPORTING_DELIMITER.SEMICOLON
    : REPORTING_DELIMITER.COMMA;
  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  /* -------- Parse Header -------- */

  // Header keys (cleaned versions)
  const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";
  const monthKey = isBelieve ? "reporting month" : "statement period";

  // Parse Header with aggressive sanitization
  const distributor: Distributor = isBelieve ? "BELIEVE" : "REVELATOR";
  const headerRow = parseLine(lines[0], distributor, delimiter);
  const header = headerRow.map(
    (h) => h.toLowerCase().replace(/["']/g, "").trim() // Remove ALL quotes for comparison
  );

  const revIdx = header.findIndex(
    (h) => h === netRevenueKey || h.includes(netRevenueKey)
  );
  const dateIdx = header.findIndex(
    (h) => h === monthKey || h.includes(monthKey)
  );

  if (revIdx === -1 || dateIdx === -1) {
    throw new Error(
      `Required columns not found. Revenue index: ${revIdx}, Date index: ${dateIdx}. Headers: ${header.join(" | ")}`
    );
  }

  /* -------- Process Data Rows -------- */

  // Accumulate revenue as number (in millionths) for perfect precision
  let totalNetRevenueMillionths = 0;
  let reportingMonth: Date | null = null;
  const rowErrors: RowValidationError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i], distributor, delimiter);

    // Skip empty rows
    if (row.length === 0 || row.every((cell) => !cell)) {
      continue;
    }

    // Ensure row has enough columns
    if (row.length <= Math.max(revIdx, dateIdx)) {
      rowErrors.push({
        rowNumber: i + 1,
        reason: "Insufficient columns",
        row,
      });
      continue;
    }

    // 1. Calculate Revenue with perfect precision
    const revStr = row[revIdx];
    const revInMillionths = decimalStringToMillionths(revStr);

    if (Number.isNaN(revInMillionths)) {
      rowErrors.push({
        rowNumber: i + 1,
        reason: "Invalid revenue value",
        row,
      });
      continue;
    }

    totalNetRevenueMillionths += revInMillionths;

    // 2. Parse Date (only from the first valid row)
    if (!reportingMonth && row[dateIdx]) {
      const dateStr = row[dateIdx];

      if (isBelieve) {
        // Believe Format: dd/mm/yyyy
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          reportingMonth = new Date(
            Date.UTC(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            )
          );
        }
      } else {
        // REVELATOR Format: yyyy-mm
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          reportingMonth = new Date(
            Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, 1)
          );
        }
      }
    }
  }

  if (!reportingMonth || isNaN(reportingMonth.getTime())) {
    throw new Error("Could not parse reporting month from the CSV data.");
  }

  // Convert from millionths to decimal, then round to 3 decimal places
  const netRevenueDecimal = totalNetRevenueMillionths / 1_000_000;
  const netRevenue = Math.round(netRevenueDecimal * 1000) / 1000;

  return {
    type,
    delimiter,
    currency,
    netRevenue,
    reportingMonth,
    rowErrors,
  };
}

/* ----------------------- CSV Header Mapping ----------------------- */

/**
 * Header mapping configuration for both CSV formats
 */
const HEADER_MAP = {
  reportingMonth: {
    revelator: "Statement Period",
    believe: "Reporting Month",
  },
  salesMonth: {
    revelator: "Transaction Month",
    believe: "Sales Month",
  },
  label: {
    revelator: "Label",
    believe: "Label Name",
  },
  artist: {
    revelator: "Artist",
    believe: "Artist Name",
  },
  releaseTitle: {
    revelator: "Release Title",
    believe: "Release title",
  },
  trackTitle: {
    revelator: "Track Title",
    believe: "Track title",
  },
  upc: {
    revelator: "UPC",
    believe: "UPC",
  },
  isrc: {
    revelator: "ISRC",
    believe: "ISRC",
  },
  releaseCatalogId: {
    revelator: "Release Catalog ID",
    believe: "Release Catalog nb",
  },
  service: {
    revelator: "Service",
    believe: "Platform",
  },
  channel: {
    revelator: "Channel",
    believe: "Sales Type",
  },
  territory: {
    revelator: "Territory",
    believe: "Country/Region",
  },
  quantity: {
    revelator: "Quantity",
    believe: "Quantity",
  },
  netRevenue: {
    revelator: "Net Revenue in USD",
    believe: "Net Revenue",
  },
} as const;

/**
 * Mapped CSV row data with standardized headers
 * Dates are formatted as YYYY-MM-DD strings
 */
export type MappedCSVRow = {
  reportingMonth: string;
  salesMonth: string;
  label: string;
  artist: string;
  releaseTitle: string;
  trackTitle: string;
  upc: string;
  isrc: string;
  releaseCatalogId: string;
  service: string;
  channel: string;
  territory: string;
  quantity: string;
  netRevenue: string;
};

/**
 * Result of CSV mapping operation
 */
export type MappedCSVResult = {
  type: REPORTING_TYPE;
  delimiter: REPORTING_DELIMITER;
  currency: REPORTING_CURRENCY;
  rows: MappedCSVRow[];
  skippedRows: RowValidationError[];
};

/**
 * Maps CSV headers to codebase standard headers
 * Handles both Believe and Revelator CSV formats
 * Dates are automatically formatted to YYYY-MM-DD
 */
export function mapCSVHeaders(csvContent: string): MappedCSVResult {
  // Use a regex to handle both \n and \r\n line endings
  const lines = csvContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  /* -------- Detect Format (BELIEVE vs REVELATOR) -------- */

  const firstLineRaw = lines[0].toLowerCase();
  const isBelieve =
    firstLineRaw.includes("reporting month") || firstLineRaw.includes(";");

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.REVELATOR;
  const delimiter = isBelieve
    ? REPORTING_DELIMITER.SEMICOLON
    : REPORTING_DELIMITER.COMMA;
  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  /* -------- Parse Header and Create Index Map -------- */

  const distributor: Distributor = isBelieve ? "BELIEVE" : "REVELATOR";
  const headerRow = parseLine(lines[0], distributor, delimiter);
  const header = headerRow.map((h) => sanitizeField(h));

  // Create a map from codebase field name to CSV column index
  const columnIndexMap: Record<string, number> = {};
  const distributorKey = isBelieve ? "believe" : "revelator";

  for (const [codebaseField, mapping] of Object.entries(HEADER_MAP)) {
    const csvHeaderName = mapping[distributorKey];
    const columnIndex = header.findIndex(
      (h) => h.toLowerCase() === csvHeaderName.toLowerCase()
    );

    if (columnIndex !== -1) {
      columnIndexMap[codebaseField] = columnIndex;
    }
  }

  /* -------- Process Data Rows -------- */

  const rows: MappedCSVRow[] = [];
  const skippedRows: RowValidationError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i], distributor, delimiter);

    // Skip empty rows
    if (row.length === 0 || row.every((cell) => !cell)) {
      continue;
    }

    // Ensure row has enough columns
    if (row.length < header.length) {
      skippedRows.push({
        rowNumber: i + 1,
        reason: "Insufficient columns",
        row,
      });
      continue;
    }

    // Map the row data using the column index map
    // Dates are automatically formatted to YYYY-MM-DD
    const mappedRow: MappedCSVRow = {
      reportingMonth: parseCSVDate(
        row[columnIndexMap.reportingMonth] || "",
        distributor
      ),
      salesMonth: parseCSVDate(
        row[columnIndexMap.salesMonth] || "",
        distributor
      ),
      label: row[columnIndexMap.label] || "",
      artist: row[columnIndexMap.artist] || "",
      releaseTitle: row[columnIndexMap.releaseTitle] || "",
      trackTitle: row[columnIndexMap.trackTitle] || "",
      upc: row[columnIndexMap.upc] || "",
      isrc: isBelieve
        ? (row[columnIndexMap.isrc] || "").replace(/-/g, "")
        : row[columnIndexMap.isrc] || "",
      releaseCatalogId: row[columnIndexMap.releaseCatalogId] || "",
      service: row[columnIndexMap.service] || "",
      channel: row[columnIndexMap.channel] || "",
      territory: row[columnIndexMap.territory] || "",
      quantity: row[columnIndexMap.quantity] || "",
      netRevenue: row[columnIndexMap.netRevenue] || "",
    };

    rows.push(mappedRow);
  }

  return {
    type,
    delimiter,
    currency,
    rows,
    skippedRows,
  };
}

/**
 * Parses and formats dates from CSV based on distributor format
 * Returns dates in YYYY-MM-DD format to match codebase standard
 *
 * @param dateStr - Date string from CSV
 * @param distributor - Type of CSV distributor
 * @returns Formatted date string in YYYY-MM-DD format or empty string if parsing fails
 */
export function parseCSVDate(
  dateStr: string,
  distributor: Distributor
): string {
  if (!dateStr) return "";

  let date: Date | null = null;

  if (distributor === "BELIEVE") {
    // Believe Format: dd/mm/yyyy
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      date = new Date(
        Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      );
    }
  } else {
    // REVELATOR Format: yyyy-mm
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
    }
  }

  // Format as YYYY-MM-DD using toISOString().split("T")[0] pattern
  return date && !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
}

/**
 * Converts a mapped CSV row with date parsing
 * @deprecated Use MappedCSVRow instead - dates are now formatted by default
 */
export type MappedCSVRowWithDates = Omit<
  MappedCSVRow,
  "reportingMonth" | "salesMonth"
> & {
  reportingMonth: string;
  salesMonth: string;
};

/**
 * Maps CSV with parsed dates
 * @deprecated Use mapCSVHeaders instead - dates are now formatted by default
 */
export function mapCSVHeadersWithDates(csvContent: string): {
  type: REPORTING_TYPE;
  delimiter: REPORTING_DELIMITER;
  currency: REPORTING_CURRENCY;
  rows: MappedCSVRowWithDates[];
  skippedRows: RowValidationError[];
} {
  // Dates are now formatted by default in mapCSVHeaders
  return mapCSVHeaders(csvContent);
}
