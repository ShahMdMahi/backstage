"use client";

import Papa from "papaparse";
import {
  REPORTING_CURRENCY,
  REPORTING_TYPE,
  REPORTING_DELIMITER,
} from "@/lib/prisma/enums";

/* ----------------------------- Types ----------------------------- */

type Distributor = "BELIEVE" | "ANS";

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
 * Robustly cleans Believe/ANS fields by removing outer quotes,
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

  // Use PapaParse for ANS format
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

  /* -------- Detect Format (BELIEVE vs ANS) -------- */

  const firstLineRaw = lines[0].toLowerCase();
  const isBelieve =
    firstLineRaw.includes("reporting month") || firstLineRaw.includes(";");

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;
  const delimiter = isBelieve
    ? REPORTING_DELIMITER.SEMICOLON
    : REPORTING_DELIMITER.COMMA;
  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  /* -------- Parse Header -------- */

  // Header keys (cleaned versions)
  const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";
  const monthKey = isBelieve ? "reporting month" : "statement period";

  // Parse Header with aggressive sanitization
  const distributor: Distributor = isBelieve ? "BELIEVE" : "ANS";
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
        // ANS Format: yyyy-mm
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
