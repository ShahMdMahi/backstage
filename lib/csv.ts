"use client";

import { createHash } from "crypto";
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

export function getCSVHash(csvContent: string): string {
  return createHash("sha256").update(csvContent).digest("hex");
}

/* ----------------------------- Utils ----------------------------- */

function sanitizeField(field: string): string {
  let f = field.trim();
  if (f.startsWith('"') && f.endsWith('"')) {
    f = f.slice(1, -1);
  }
  return f.replace(/""/g, '"').trim();
}

/* ---------------------- Distributor Detection --------------------- */

function detectDistributor(header: string[]): Distributor {
  let believeScore = 0;
  let ansScore = 0;

  for (const h of header) {
    if (h.includes("reporting month")) believeScore += 3;
    if (h.includes("statement period")) ansScore += 3;
    if (h.includes("net revenue in usd")) ansScore += 4;
    if (h === "net revenue") believeScore += 2;
  }

  return believeScore > ansScore ? "BELIEVE" : "ANS";
}

/* ----------------------------- Parsing ---------------------------- */

function parseRow(line: string, distributor: Distributor): string[] {
  if (distributor === "BELIEVE") {
    let cleaned = line.trim();
    if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned.split(";").map(sanitizeField);
  }

  const parsed = Papa.parse<string[]>(line, {
    delimiter: ",",
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
  });

  return parsed.data[0]?.map(sanitizeField) ?? [];
}

/* ----------------------- Financial Precision ---------------------- */

function decimalStringToMillionths(decimalStr: string): number {
  const isNegative =
    decimalStr.includes("-") ||
    (decimalStr.startsWith("(") && decimalStr.endsWith(")"));

  const cleaned = decimalStr.replace(/[(),]/g, "").replace(/[^\d.]/g, "");

  if (!cleaned) return NaN;

  const [intPart, decPart = ""] = cleaned.split(".");
  const paddedDecimal = decPart.padEnd(6, "0").slice(0, 6);

  const value =
    parseInt(intPart || "0") * 1_000_000 + parseInt(paddedDecimal || "0");

  return isNegative ? -value : value;
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
    throw new Error("CSV must contain header + at least one row");
  }

  /* -------- Header parsing & distributor detection -------- */

  const rawHeader = Papa.parse<string[]>(lines[0]).data[0];
  if (!rawHeader) {
    throw new Error("Invalid CSV header");
  }

  const header = rawHeader.map((h) =>
    h.toLowerCase().replace(/["']/g, "").trim()
  );

  const distributor = detectDistributor(header);

  const isBelieve = distributor === "BELIEVE";

  const type = isBelieve ? REPORTING_TYPE.BELIEVE : REPORTING_TYPE.ANS;

  const currency = isBelieve ? REPORTING_CURRENCY.EUR : REPORTING_CURRENCY.USD;

  const delimiter = isBelieve
    ? REPORTING_DELIMITER.SEMICOLON
    : REPORTING_DELIMITER.COMMA;

  const netRevenueKey = isBelieve ? "net revenue" : "net revenue in usd";

  const monthKey = isBelieve ? "reporting month" : "statement period";

  const revIdx = header.findIndex(
    (h) => h === netRevenueKey || h.includes(netRevenueKey)
  );

  const dateIdx = header.findIndex(
    (h) => h === monthKey || h.includes(monthKey)
  );

  if (revIdx === -1 || dateIdx === -1) {
    throw new Error(`Required columns not found`);
  }

  /* ---------------- Row Processing ---------------- */

  let totalMillionths = 0;
  let reportingMonth: Date | null = null;
  const rowErrors: RowValidationError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i], distributor);

    // Column count validation
    if (row.length !== header.length) {
      rowErrors.push({
        rowNumber: i + 1,
        reason: "Column count mismatch",
        row,
      });
      continue;
    }

    // Revenue validation
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

    // Date validation (first valid row only)
    if (!reportingMonth && row[dateIdx]) {
      const dateStr = row[dateIdx];

      if (isBelieve) {
        const [d, m, y] = dateStr.split("/");
        if (!d || !m || !y) {
          rowErrors.push({
            rowNumber: i + 1,
            reason: "Invalid Believe date format",
            row,
          });
        } else {
          reportingMonth = new Date(Date.UTC(+y, +m - 1, +d));
        }
      } else {
        const [y, m] = dateStr.split("-");
        if (!y || !m) {
          rowErrors.push({
            rowNumber: i + 1,
            reason: "Invalid ANS date format",
            row,
          });
        } else {
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
    currency,
    delimiter,
    netRevenue,
    reportingMonth,
    rowErrors,
  };
}
