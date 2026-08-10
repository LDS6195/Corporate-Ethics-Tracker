// Shows the next N unresearched S&P 500 companies by market cap rank.
// Run: node scripts/next-to-research.mjs [count=10]
import { readFileSync } from "node:fs";

const count = parseInt(process.argv[2] || "10", 10);

const master = JSON.parse(readFileSync("./src/data/sp500Master.json", "utf8"));
const tracked = new Set(
  JSON.parse(readFileSync("./src/data/companies.json", "utf8")).companies.map(c => c.ticker)
);

const unresearched = master.companies.filter(c => !tracked.has(c.ticker));

console.log(`\nNext ${count} S&P 500 companies to research (ranked by market cap):`);
console.log("─".repeat(72));
for (const c of unresearched.slice(0, count)) {
  const cap = c.marketCap > 0 ? `$${(c.marketCap / 1e12).toFixed(2)}T` : "N/A     ";
  console.log(`  #${String(c.sp500Rank).padStart(3)}  ${c.ticker.padEnd(6)}  ${cap.padEnd(9)}  ${c.sector.padEnd(28)}  ${c.name}`);
}
console.log("─".repeat(72));
console.log(`Already tracked: ${tracked.size} | Remaining: ${unresearched.length}`);
