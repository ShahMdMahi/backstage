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

function sanitizeField(field: string): string {
  return field
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/""/g, '"')
    .trim();
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

/* ----------------------------- Parsing ---------------------------- */

function parseLine(line: string, delimiter: REPORTING_DELIMITER): string[] {
  const parsed = Papa.parse<string[]>(line, {
    delimiter: delimiter === REPORTING_DELIMITER.SEMICOLON ? ";" : ",",
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
  });

  return parsed.data[0]?.map(sanitizeField) ?? [];
}

/* ----------------------- Financial Precision ---------------------- */

function decimalStringToMillionths(value: string): number {
  if (!value) return NaN;

  const negative =
    value.includes("-") || (value.startsWith("(") && value.endsWith(")"));

  const cleaned = value.replace(/[(),]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;

  const [intPart, decPart = ""] = cleaned.split(".");
  const decimals = decPart.padEnd(6, "0").slice(0, 6);

  const result = Number(intPart || 0) * 1_000_000 + Number(decimals);

  return negative ? -result : result;
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
  const lines = csvContent.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CSV must contain header and data rows");
  }

  /* -------- Header detection (try both delimiters) -------- */

  const commaHeader = Papa.parse<string[]>(lines[0]).data[0] ?? [];
  const semiHeader =
    Papa.parse<string[]>(lines[0], {
      delimiter: ";",
    }).data[0] ?? [];

  const header =
    semiHeader.length > commaHeader.length ? semiHeader : commaHeader;

  const normalizedHeader = header.map((h) =>
    h.toLowerCase().replace(/["']/g, "").trim()
  );

  const distributor = detectDistributor(normalizedHeader);
  const isBelieve = distributor === "BELIEVE";

  const delimiter = isBelieve
    ? REPORTING_DELIMITER.SEMICOLON
    : REPORTING_DELIMITER.COMMA;

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;

  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";

  const dateKey = isBelieve ? "reporting month" : "statement period";

  const revIdx = normalizedHeader.findIndex((h) => h.includes(netRevenueKey));

  const dateIdx = normalizedHeader.findIndex((h) => h.includes(dateKey));

  if (revIdx === -1 || dateIdx === -1) {
    throw new Error("Required columns not found");
  }

  /* ---------------- Row Processing ---------------- */

  let totalMillionths = 0;
  let reportingMonth: Date | null = null;
  const rowErrors: RowValidationError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i], delimiter);

    if (row.length < normalizedHeader.length) {
      rowErrors.push({
        rowNumber: i + 1,
        reason: "Column count mismatch",
        row,
      });
      continue;
    }

    const revenue = decimalStringToMillionths(row[revIdx]);
    if (Number.isNaN(revenue)) {
      rowErrors.push({
        rowNumber: i + 1,
        reason: "Invalid revenue value",
        row,
      });
      continue;
    }

    totalMillionths += revenue;

    if (!reportingMonth && row[dateIdx]) {
      const raw = sanitizeField(row[dateIdx]);

      if (isBelieve) {
        const [d, m, y] = raw.split("/");
        if (d && m && y) {
          reportingMonth = new Date(Date.UTC(+y, +m - 1, +d));
        }
      } else {
        const [y, m] = raw.split("-");
        if (y && m) {
          reportingMonth = new Date(Date.UTC(+y, +m - 1, 1));
        }
      }
    }
  }

  if (!reportingMonth) {
    throw new Error("Could not determine reporting month");
  }

  const netRevenue = Math.round((totalMillionths / 1_000_000) * 1000) / 1000;

  return {
    type,
    delimiter,
    currency,
    netRevenue,
    reportingMonth,
    rowErrors,
  };
}
