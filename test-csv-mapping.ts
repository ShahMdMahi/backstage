import { readFileSync } from "fs";
import { mapCSVHeaders } from "./lib/csv";

console.log("=".repeat(80));
console.log("TESTING CSV MAPPING FUNCTIONS");
console.log("=".repeat(80));

// Test Believe CSV
console.log("\n📊 TESTING BELIEVE CSV");
console.log("-".repeat(80));
try {
  const believeCSV = readFileSync("./exact_csv_samples/believe.csv", "utf-8");
  const believeResult = mapCSVHeaders(believeCSV);

  console.log("✅ Type:", believeResult.type);
  console.log("✅ Delimiter:", believeResult.delimiter);
  console.log("✅ Currency:", believeResult.currency);
  console.log("✅ Total rows:", believeResult.rows.length);
  console.log("✅ Skipped rows:", believeResult.skippedRows.length);

  console.log("\n📋 First Row (with formatted dates):");
  console.log(JSON.stringify(believeResult.rows[0], null, 2));

  // Verify all fields are mapped
  console.log("\n🔍 Verifying Field Mapping:");
  const firstRow = believeResult.rows[0];
  console.log(
    "  reportingMonth:",
    firstRow.reportingMonth ? "✅" : "❌",
    `(${firstRow.reportingMonth})`
  );
  console.log(
    "  salesMonth:",
    firstRow.salesMonth ? "✅" : "❌",
    `(${firstRow.salesMonth})`
  );
  console.log("  label:", firstRow.label ? "✅" : "❌");
  console.log("  artist:", firstRow.artist ? "✅" : "❌");
  console.log("  releaseTitle:", firstRow.releaseTitle ? "✅" : "❌");
  console.log("  trackTitle:", firstRow.trackTitle ? "✅" : "❌");
  console.log("  upc:", firstRow.upc ? "✅" : "❌");
  console.log("  isrc:", firstRow.isrc ? "✅" : "❌");
  console.log(
    "  releaseCatalogId:",
    firstRow.releaseCatalogId || "(empty - expected)"
  );
  console.log("  service:", firstRow.service ? "✅" : "❌");
  console.log("  channel:", firstRow.channel ? "✅" : "❌");
  console.log("  territory:", firstRow.territory ? "✅" : "❌");
  console.log("  quantity:", firstRow.quantity ? "✅" : "❌");
  console.log("  netRevenue:", firstRow.netRevenue ? "✅" : "❌");
} catch (error) {
  console.error("❌ BELIEVE CSV Error:", error);
}

// Test Revelator CSV
console.log("\n\n📊 TESTING REVELATOR CSV");
console.log("-".repeat(80));
try {
  const revelatorCSV = readFileSync(
    "./exact_csv_samples/revelator.csv",
    "utf-8"
  );
  const revelatorResult = mapCSVHeaders(revelatorCSV);

  console.log("✅ Type:", revelatorResult.type);
  console.log("✅ Delimiter:", revelatorResult.delimiter);
  console.log("✅ Currency:", revelatorResult.currency);
  console.log("✅ Total rows:", revelatorResult.rows.length);
  console.log("✅ Skipped rows:", revelatorResult.skippedRows.length);

  console.log("\n📋 First Row (with formatted dates):");
  console.log(JSON.stringify(revelatorResult.rows[0], null, 2));

  // Verify all fields are mapped
  console.log("\n🔍 Verifying Field Mapping:");
  const firstRow = revelatorResult.rows[0];
  console.log(
    "  reportingMonth:",
    firstRow.reportingMonth ? "✅" : "❌",
    `(${firstRow.reportingMonth})`
  );
  console.log(
    "  salesMonth:",
    firstRow.salesMonth ? "✅" : "❌",
    `(${firstRow.salesMonth})`
  );
  console.log("  label:", firstRow.label ? "✅" : "❌");
  console.log("  artist:", firstRow.artist ? "✅" : "❌");
  console.log("  releaseTitle:", firstRow.releaseTitle ? "✅" : "❌");
  console.log("  trackTitle:", firstRow.trackTitle ? "✅" : "❌");
  console.log("  upc:", firstRow.upc ? "✅" : "❌");
  console.log("  isrc:", firstRow.isrc ? "✅" : "❌");
  console.log("  releaseCatalogId:", firstRow.releaseCatalogId ? "✅" : "❌");
  console.log("  service:", firstRow.service ? "✅" : "❌");
  console.log("  channel:", firstRow.channel ? "✅" : "❌");
  console.log("  territory:", firstRow.territory ? "✅" : "❌");
  console.log("  quantity:", firstRow.quantity ? "✅" : "❌");
  console.log("  netRevenue:", firstRow.netRevenue ? "✅" : "❌");
} catch (error) {
  console.error("❌ REVELATOR CSV Error:", error);
}

console.log("\n" + "=".repeat(80));
console.log("✅ ALL TESTS COMPLETED");
console.log("=".repeat(80));
