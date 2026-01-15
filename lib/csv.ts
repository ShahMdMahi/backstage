"use client";

import { createHash } from "crypto";
import {
  REPORTING_CURRENCY,
  REPORTING_TYPE,
  REPORTING_DELIMITER,
} from "@/lib/prisma/enums";

export function getCSVHash(csvContent: string): string {
  return createHash("sha256").update(csvContent).digest("hex");
}

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

/**
 * Specialized parser for Believe/ANS lines.
 * Handles the "Wrapped Quote" issue and semicolon/comma logic.
 */
function parseRow(
  line: string,
  delimiter: string,
  isBelieve: boolean
): string[] {
  let cleanedLine = line.trim();

  if (isBelieve) {
    // 1. Remove trailing comma after the closing quote if present
    if (cleanedLine.endsWith(",")) cleanedLine = cleanedLine.slice(0, -1);
    // 2. Remove the "Whole Line" wrapping quotes
    if (cleanedLine.startsWith('"') && cleanedLine.endsWith('"')) {
      cleanedLine = cleanedLine.slice(1, -1);
    }
  }

  // Split by the specific delimiter
  // For Believe, we ONLY split by ; because Artist names might contain commas
  const parts = cleanedLine.split(delimiter);
  return parts.map(sanitizeField);
}

/**
 * Convert decimal string to integer millionths for perfect precision
 * Returns as number (safe since values are reasonable)
 */
function decimalStringToMillionths(decimalStr: string): number {
  // Remove non-numeric characters except decimal point and minus
  const cleaned = decimalStr.replace(/[^\d.-]/g, "");

  // Split by decimal point
  const parts = cleaned.split(".");

  const intPart = parseInt(parts[0] || "0");
  const decimalPart = parts[1] || "0";

  // Pad decimal part to 6 digits (for millionths precision)
  const paddedDecimal = decimalPart.padEnd(6, "0").slice(0, 6);

  // Combine: intPart * 1000000 + decimal part
  return intPart * 1000000 + parseInt(paddedDecimal);
}

export function getCSVFormat(csvContent: string): {
  type: REPORTING_TYPE;
  delimiter: REPORTING_DELIMITER;
  currency: REPORTING_CURRENCY;
  netRevenue: number;
  reportingMonth: Date;
} {
  // Use a regex to handle both \n and \r\n line endings
  const lines = csvContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  // Detect Format
  const firstLineRaw = lines[0].toLowerCase();
  const isBelieve =
    firstLineRaw.includes("reporting month") || firstLineRaw.includes(";");

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;
  const delimiterChar = isBelieve ? ";" : ",";
  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  // Header keys (cleaned versions)
  const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";
  const monthKey = isBelieve ? "reporting month" : "statement period";

  // Parse Header with aggressive sanitization
  const header = parseRow(lines[0], delimiterChar, isBelieve).map(
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
      `Required columns not found. Indices: Revenue(${revIdx}), Date(${dateIdx}). Headers found: ${header.join(" | ")}`
    );
  }

  // Accumulate revenue as number (in millionths) for perfect precision
  let totalNetRevenueMillionths = 0;

  let reportingMonth: Date | null = null;

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i], delimiterChar, isBelieve);

    // Ensure row has enough columns
    if (row.length <= Math.max(revIdx, dateIdx)) continue;

    // 1. Calculate Revenue using BigInt for perfect precision
    const revStr = row[revIdx];
    const revInMillionths = decimalStringToMillionths(revStr);

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

  // Convert from millionths to decimal, then round to 2 places
  const netRevenueDecimal = totalNetRevenueMillionths / 1000000;
  const netRevenue = Math.round(netRevenueDecimal * 100) / 100;

  return {
    type,
    currency,
    delimiter: isBelieve
      ? REPORTING_DELIMITER.SEMICOLON
      : REPORTING_DELIMITER.COMMA,
    netRevenue,
    reportingMonth,
  };
}
