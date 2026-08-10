// Builds/refreshes src/data/sp500Master.json — S&P 500 ranked by market cap.
// Sources: GitHub constituents CSV + SEC EDGAR XBRL (shares) + Yahoo Finance v8 (price).
// Run: node scripts/refresh-sp500-master.mjs
import { readFileSync, writeFileSync } from "node:fs";
import https from "node:https";

function get(url, extraHeaders = {}) {
  return new Promise((res, rej) => {
    https.get(url, {
      headers: {
        "User-Agent": "SP-AVLNCH/1.0 (research@sp-avlnch.dev)",
        "Accept": "application/json",
        ...extraHeaders,
      },
    }, r => {
      let d = "";
      r.on("data", c => (d += c));
      r.on("end", () => res(d));
    }).on("error", rej);
  });
}

// Returns most recent shares outstanding from SEC EDGAR XBRL (public API, no key needed).
async function fetchShares(cik) {
  const padded = String(cik).padStart(10, "0");
  try {
    const raw = await get(
      `https://data.sec.gov/api/xbrl/companyconcept/CIK${padded}/us-gaap/CommonStockSharesOutstanding.json`
    );
    const j = JSON.parse(raw);
    const entries = j.units?.shares ?? [];
    // Most recent filed value with a valid 'val'
    const recent = entries
      .filter(e => e.val && e.filed)
      .sort((a, b) => b.filed.localeCompare(a.filed))[0];
    return recent?.val ?? null;
  } catch {
    return null;
  }
}

// Returns latest price from Yahoo Finance v8 chart (no auth needed).
async function fetchPrice(ticker) {
  try {
    const raw = await get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
    );
    const j = JSON.parse(raw);
    const meta = j.chart?.result?.[0]?.meta;
    return {
      price: meta?.regularMarketPrice ?? null,
      name: meta?.longName ?? meta?.shortName ?? null,
    };
  } catch {
    return { price: null, name: null };
  }
}

async function fetchMarketCaps(constituents) {
  const results = {};
  // SEC EDGAR rate limit: 10 req/sec — process in batches of 8 with 1s pause
  for (let i = 0; i < constituents.length; i += 8) {
    const batch = constituents.slice(i, i + 8);
    await Promise.all(
      batch.map(async ({ ticker, cik, name }) => {
        const [{ price, name: yahooName }, shares] = await Promise.all([
          fetchPrice(ticker),
          fetchShares(cik),
        ]);
        results[ticker] = {
          name: yahooName || name,
          marketCap: price && shares ? price * shares : 0,
        };
      })
    );
    await new Promise(r => setTimeout(r, 1100)); // respect SEC rate limit
    process.stdout.write(`  ${Math.min(i + 8, constituents.length)}/${constituents.length}...\r`);
  }
  return results;
}

// Handles quoted fields with embedded commas (e.g. "San Jose, California").
function parseCSVLine(line) {
  const fields = [];
  let cur = "", inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === "," && !inQuote) { fields.push(cur.trim()); cur = ""; }
    else { cur += ch; }
  }
  fields.push(cur.trim());
  return fields;
}

// Load S&P 500 constituents from GitHub CSV (includes CIK numbers)
// Columns: Symbol,Security,GICS Sector,GICS Sub-Industry,Headquarters Location,Date added,CIK,Founded
const csvUrl =
  "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv";
console.log("Fetching S&P 500 constituents list...");
const csv = await get(csvUrl);
const lines = csv.trim().split("\n").slice(1); // skip header
const constituents = lines.map((line) => {
  const parts = parseCSVLine(line);
  return {
    ticker: parts[0] ?? "",
    name: parts[1] ?? "",
    sector: parts[2] ?? "",
    subIndustry: parts[3] ?? "",
    // parts[4] = Headquarters Location (may contain commas), parts[5] = Date added
    cik: parts[6] ?? "",
  };
}).filter(c => c.ticker);
console.log(`Loaded ${constituents.length} S&P 500 companies.`);
console.log("Fetching market caps (SEC EDGAR shares + Yahoo Finance price). Takes ~2 min...");
// Verify a sample CIK before running the full batch
const sampleCik = constituents.find(c => c.ticker === "AAPL")?.cik;
console.log(`  AAPL CIK from CSV: ${sampleCik} (should be 320193)`);

const caps = await fetchMarketCaps(constituents);

// Merge and sort by market cap descending
const ranked = constituents
  .map((c) => ({
    ticker: c.ticker,
    name: caps[c.ticker]?.name ?? c.name,
    sector: c.sector,
    subIndustry: c.subIndustry,
    cik: c.cik,
    marketCap: caps[c.ticker]?.marketCap ?? 0,
  }))
  .sort((a, b) => b.marketCap - a.marketCap)
  .map((c, i) => ({ sp500Rank: i + 1, ...c }));

const output = {
  generatedAt: new Date().toISOString(),
  source: "Constituents: github.com/datasets/s-and-p-500-companies | Shares: SEC EDGAR XBRL | Price: Yahoo Finance v8",
  count: ranked.length,
  companies: ranked,
};

writeFileSync("./src/data/sp500Master.json", JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(`\nSaved ${ranked.length} companies to src/data/sp500Master.json`);

// Print top 35 so we can see next candidates
const alreadyTracked = new Set(
  JSON.parse(readFileSync("./src/data/companies.json", "utf8")).companies.map((c) => c.ticker)
);
console.log("\nTop 35 by market cap — ✓=tracked, ○=not yet researched:");
for (const c of ranked.slice(0, 35)) {
  const status = alreadyTracked.has(c.ticker) ? "✓" : "○";
  const cap = c.marketCap > 0 ? `$${(c.marketCap / 1e12).toFixed(2)}T` : "N/A";
  console.log(`  ${String(c.sp500Rank).padStart(3)} ${status} ${c.ticker.padEnd(6)} ${cap.padEnd(8)} ${c.name}`);
}
