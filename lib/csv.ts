// "use client";

// import Papa from "papaparse";
// import {
//   REPORTING_CURRENCY,
//   REPORTING_TYPE,
//   REPORTING_DELIMITER,
// } from "@/lib/prisma/enums";

// /* ----------------------------- Types ----------------------------- */

// type Distributor = "BELIEVE" | "ANS";

// type RowValidationError = {
//   rowNumber: number;
//   reason: string;
//   row: string[];
// };

// /* ----------------------------- Hash ----------------------------- */
// /** Browser-safe SHA-256 */
// export async function getCSVHash(csvContent: string): Promise<string> {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(csvContent);
//   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//   return Array.from(new Uint8Array(hashBuffer))
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("");
// }

// /* ----------------------------- Utils ----------------------------- */

// function sanitizeField(field: string): string {
//   return field
//     .trim()
//     .replace(/^"(.*)"$/, "$1")
//     .replace(/""/g, '"')
//     .trim();
// }

// /* ---------------------- Distributor Detection --------------------- */

// function detectDistributor(header: string[]): Distributor {
//   let believeScore = 0;
//   let ansScore = 0;

//   for (const h of header) {
//     if (h.includes("reporting month")) believeScore += 3;
//     if (h === "net revenue") believeScore += 2;

//     if (h.includes("statement period")) ansScore += 3;
//     if (h.includes("net revenue in usd")) ansScore += 4;
//   }

//   return believeScore >= ansScore ? "BELIEVE" : "ANS";
// }

// /* -------------------------- BELIEVE PARSER ------------------------ */
// /**
//  * Custom parser for BELIEVE CSV format.
//  * Handles malformed lines with missing closing quotes.
//  */
// function parseBelieveLine(line: string): string[] {
//   let cleanedLine = line.trim();

//   if (!cleanedLine) return [];

//   // 1. Remove trailing comma if present
//   if (cleanedLine.endsWith(",")) {
//     cleanedLine = cleanedLine.slice(0, -1).trim();
//   }

//   // 2. Check if line starts with quote
//   let hasOuterQuotes = false;
//   if (cleanedLine.startsWith('"')) {
//     hasOuterQuotes = true;

//     // Only remove opening quote if there's a matching closing quote
//     // This handles the malformed case where closing quote is missing
//     if (cleanedLine.endsWith('"') && cleanedLine.length > 1) {
//       // Properly wrapped line
//       cleanedLine = cleanedLine.slice(1, -1);
//     } else {
//       // Malformed: has opening quote but no closing quote
//       // Just remove the opening quote
//       cleanedLine = cleanedLine.slice(1);
//     }
//   }

//   // 3. Remove trailing comma again after quote processing
//   if (cleanedLine.endsWith(",")) {
//     cleanedLine = cleanedLine.slice(0, -1).trim();
//   }

//   // 4. Split by semicolon ONLY (not comma, as artist names contain commas)
//   const parts = cleanedLine.split(";");

//   // 5. Sanitize each field
//   return parts.map((field) => {
//     let f = field.trim();
//     // Remove outer quotes if they exist
//     if (f.startsWith('"') && f.endsWith('"') && f.length > 1) {
//       f = f.slice(1, -1);
//     }
//     // Remove internal double-double quotes (Believe format)
//     return f.replace(/""/g, '"').trim();
//   });
// }

// /* ----------------------------- Parsing ---------------------------- */

// function parseLine(
//   line: string,
//   distributor: Distributor,
//   delimiter: REPORTING_DELIMITER
// ): string[] {
//   if (distributor === "BELIEVE") {
//     return parseBelieveLine(line);
//   }

//   const parsed = Papa.parse<string[]>(line, {
//     delimiter: delimiter === REPORTING_DELIMITER.COMMA ? "," : ";",
//     quoteChar: '"',
//     escapeChar: '"',
//     skipEmptyLines: true,
//   });

//   return parsed.data[0]?.map(sanitizeField) ?? [];
// }

// /* ----------------------- Financial Precision ---------------------- */

// function decimalStringToMillionths(value: string): number {
//   if (!value) return NaN;

//   // Check if value is negative
//   const isNegative =
//     value.includes("-") || (value.startsWith("(") && value.endsWith(")"));

//   // Remove non-numeric characters except decimal point
//   const cleaned = value.replace(/[^\d.]/g, "");

//   if (!cleaned) return NaN;

//   // Split by decimal point
//   const parts = cleaned.split(".");
//   const intPart = parseInt(parts[0] || "0");
//   const decimalPart = parts[1] || "0";

//   // Pad decimal part to 6 digits (for millionths precision)
//   const paddedDecimal = decimalPart.padEnd(6, "0").slice(0, 6);

//   // Combine: intPart * 1000000 + decimal part
//   let result = intPart * 1_000_000 + parseInt(paddedDecimal);

//   // Apply negative sign if needed
//   if (isNegative) {
//     result = -result;
//   }

//   return result;
// }

// /* ----------------------------- Main ------------------------------- */

// export function getCSVFormat(csvContent: string): {
//   type: REPORTING_TYPE;
//   delimiter: REPORTING_DELIMITER;
//   currency: REPORTING_CURRENCY;
//   netRevenue: number;
//   reportingMonth: Date;
//   rowErrors: RowValidationError[];
// } {
//   const lines = csvContent.split(/\r?\n/).filter(Boolean);

//   if (lines.length < 2) {
//     throw new Error("CSV must contain header and data rows");
//   }

//   /* -------- Header detection (BELIEVE vs ANS) -------- */

//   const headerLine = lines[0];

//   // Parse header with both delimiters to detect format
//   const commaHeader =
//     Papa.parse<string[]>(headerLine, { delimiter: "," }).data[0] ?? [];

//   const semiHeader =
//     Papa.parse<string[]>(headerLine, { delimiter: ";" }).data[0] ?? [];

//   const header =
//     semiHeader.length > commaHeader.length ? semiHeader : commaHeader;

//   const normalizedHeader = header.map((h) =>
//     h.toLowerCase().replace(/["']/g, "").trim()
//   );

//   const distributor = detectDistributor(normalizedHeader);
//   const isBelieve = distributor === "BELIEVE";

//   const delimiter = isBelieve
//     ? REPORTING_DELIMITER.SEMICOLON
//     : REPORTING_DELIMITER.COMMA;

//   const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;
//   const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

//   const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";
//   const dateKey = isBelieve ? "reporting month" : "statement period";

//   const revIdx = normalizedHeader.findIndex((h) => h.includes(netRevenueKey));
//   const dateIdx = normalizedHeader.findIndex((h) => h.includes(dateKey));

//   if (revIdx === -1 || dateIdx === -1) {
//     throw new Error("Required columns not found");
//   }

//   /* ---------------- Row Processing ---------------- */

//   let totalMillionths = 0;
//   let reportingMonth: Date | null = null;
//   const rowErrors: RowValidationError[] = [];

//   // Process data rows (skip header)
//   for (let i = 1; i < lines.length; i++) {
//     const row = parseLine(lines[i], distributor, delimiter);

//     // Skip empty rows
//     if (row.length === 0 || row.every((cell) => !cell)) {
//       continue;
//     }

//     // Ensure row has enough columns
//     if (row.length <= Math.max(revIdx, dateIdx)) {
//       rowErrors.push({
//         rowNumber: i + 1,
//         reason: "Insufficient columns",
//         row,
//       });
//       continue;
//     }

//     const revenue = decimalStringToMillionths(row[revIdx]);
//     if (Number.isNaN(revenue)) {
//       rowErrors.push({
//         rowNumber: i + 1,
//         reason: "Invalid revenue value",
//         row,
//       });
//       continue;
//     }

//     totalMillionths += revenue;

//     if (!reportingMonth && row[dateIdx]) {
//       const raw = row[dateIdx];

//       if (isBelieve) {
//         // dd/mm/yyyy
//         const parts = raw.split("/");
//         if (parts.length === 3) {
//           reportingMonth = new Date(
//             Date.UTC(
//               parseInt(parts[2]),
//               parseInt(parts[1]) - 1,
//               parseInt(parts[0])
//             )
//           );
//         }
//       } else {
//         // yyyy-mm
//         const parts = raw.split("-");
//         if (parts.length >= 2) {
//           reportingMonth = new Date(
//             Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, 1)
//           );
//         }
//       }
//     }
//   }

//   if (!reportingMonth || isNaN(reportingMonth.getTime())) {
//     throw new Error("Could not determine reporting month");
//   }

//   const netRevenue = Math.round((totalMillionths / 1_000_000) * 1000) / 1000;

//   return {
//     type,
//     delimiter,
//     currency,
//     netRevenue,
//     reportingMonth,
//     rowErrors,
//   };
// }

// "use client";

// import { createHash } from "crypto";
// import {
//   REPORTING_CURRENCY,
//   REPORTING_TYPE,
//   REPORTING_DELIMITER,
// } from "@/lib/prisma/enums";

// export function getCSVHash(csvContent: string): string {
//   return createHash("sha256").update(csvContent).digest("hex");
// }

// /**
//  * Robustly cleans Believe/ANS fields by removing outer quotes,
//  * unescaping double quotes, and trimming whitespace.
//  */
// function sanitizeField(field: string): string {
//   let f = field.trim();
//   // Remove outer quotes if they exist
//   if (f.startsWith('"') && f.endsWith('"')) {
//     f = f.slice(1, -1);
//   }
//   // Remove internal double-double quotes (Believe format)
//   return f.replace(/""/g, '"').trim();
// }

// /**
//  * Specialized parser for Believe/ANS lines.
//  * Handles the "Wrapped Quote" issue and semicolon/comma logic.
//  */
// function parseRow(
//   line: string,
//   delimiter: string,
//   isBelieve: boolean
// ): string[] {
//   let cleanedLine = line.trim();

//   if (isBelieve) {
//     // 1. Remove trailing comma after the closing quote if present
//     if (cleanedLine.endsWith(",")) cleanedLine = cleanedLine.slice(0, -1);
//     // 2. Remove the "Whole Line" wrapping quotes
//     if (cleanedLine.startsWith('"') && cleanedLine.endsWith('"')) {
//       cleanedLine = cleanedLine.slice(1, -1);
//     }
//   }

//   // Split by the specific delimiter
//   // For Believe, we ONLY split by ; because Artist names might contain commas
//   const parts = cleanedLine.split(delimiter);
//   return parts.map(sanitizeField);
// }

// /**
//  * Convert decimal string to integer millionths for perfect precision
//  * Handles negative values correctly
//  * Returns as number (safe since values are reasonable)
//  */
// function decimalStringToMillionths(decimalStr: string): number {
//   // Check if value is negative
//   const isNegative = decimalStr.includes("-");

//   // Remove non-numeric characters except decimal point
//   const cleaned = decimalStr.replace(/[^\d.]/g, "");

//   // Split by decimal point
//   const parts = cleaned.split(".");

//   const intPart = parseInt(parts[0] || "0");
//   const decimalPart = parts[1] || "0";

//   // Pad decimal part to 6 digits (for millionths precision)
//   const paddedDecimal = decimalPart.padEnd(6, "0").slice(0, 6);

//   // Combine: intPart * 1000000 + decimal part
//   let result = intPart * 1000000 + parseInt(paddedDecimal);

//   // Apply negative sign if needed
//   if (isNegative) {
//     result = -result;
//   }

//   return result;
// }

// export function getCSVFormat(csvContent: string): {
//   type: REPORTING_TYPE;
//   delimiter: REPORTING_DELIMITER;
//   currency: REPORTING_CURRENCY;
//   netRevenue: number;
//   reportingMonth: Date;
// } {
//   // Use a regex to handle both \n and \r\n line endings
//   const lines = csvContent
//     .split(/\r?\n/)
//     .filter((line) => line.trim().length > 0);

//   if (lines.length < 2) {
//     throw new Error("CSV must have at least a header and one data row");
//   }

//   // Detect Format
//   const firstLineRaw = lines[0].toLowerCase();
//   const isBelieve =
//     firstLineRaw.includes("reporting month") || firstLineRaw.includes(";");

//   const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;
//   const delimiterChar = isBelieve ? ";" : ",";
//   const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

//   // Header keys (cleaned versions)
//   const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";
//   const monthKey = isBelieve ? "reporting month" : "statement period";

//   // Parse Header with aggressive sanitization
//   const header = parseRow(lines[0], delimiterChar, isBelieve).map(
//     (h) => h.toLowerCase().replace(/["']/g, "").trim() // Remove ALL quotes for comparison
//   );

//   const revIdx = header.findIndex(
//     (h) => h === netRevenueKey || h.includes(netRevenueKey)
//   );
//   const dateIdx = header.findIndex(
//     (h) => h === monthKey || h.includes(monthKey)
//   );

//   if (revIdx === -1 || dateIdx === -1) {
//     throw new Error(
//       `Required columns not found. Indices: Revenue(${revIdx}), Date(${dateIdx}). Headers found: ${header.join(" | ")}`
//     );
//   }

//   // Accumulate revenue as number (in millionths) for perfect precision
//   let totalNetRevenueMillionths = 0;

//   let reportingMonth: Date | null = null;

//   for (let i = 1; i < lines.length; i++) {
//     const row = parseRow(lines[i], delimiterChar, isBelieve);

//     // Ensure row has enough columns
//     if (row.length <= Math.max(revIdx, dateIdx)) continue;

//     // 1. Calculate Revenue with perfect precision
//     const revStr = row[revIdx];
//     const revInMillionths = decimalStringToMillionths(revStr);

//     totalNetRevenueMillionths += revInMillionths;

//     // 2. Parse Date (only from the first valid row)
//     if (!reportingMonth && row[dateIdx]) {
//       const dateStr = row[dateIdx];
//       if (isBelieve) {
//         // Believe Format: dd/mm/yyyy
//         const parts = dateStr.split("/");
//         if (parts.length === 3) {
//           reportingMonth = new Date(
//             Date.UTC(
//               parseInt(parts[2]),
//               parseInt(parts[1]) - 1,
//               parseInt(parts[0])
//             )
//           );
//         }
//       } else {
//         // ANS Format: yyyy-mm
//         const parts = dateStr.split("-");
//         if (parts.length >= 2) {
//           reportingMonth = new Date(
//             Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, 1)
//           );
//         }
//       }
//     }
//   }

//   if (!reportingMonth || isNaN(reportingMonth.getTime())) {
//     throw new Error("Could not parse reporting month from the CSV data.");
//   }

//   // Convert from millionths to decimal, then round to 3 decimal places
//   const netRevenueDecimal = totalNetRevenueMillionths / 1000000;
//   const netRevenue = Math.round(netRevenueDecimal * 1000) / 1000;

//   return {
//     type,
//     currency,
//     delimiter: isBelieve
//       ? REPORTING_DELIMITER.SEMICOLON
//       : REPORTING_DELIMITER.COMMA,
//     netRevenue,
//     reportingMonth,
//   };
// }

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

/* ---------------------- Distributor Detection --------------------- */

function detectDistributor(header: string[]): Distributor {
  let believeScore = 0;
  let ansScore = 0;

  for (const h of header) {
    if (h.includes("reporting month")) believeScore += 3;
    if (h === "net revenue") believeScore += 2;

    if (h.includes("statement period")) ansScore += 3;
    if (h.includes("net revenue in usd")) ansScore += 4;
  }

  return believeScore >= ansScore ? "BELIEVE" : "ANS";
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
  const delimiterChar = isBelieve ? ";" : ",";
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
