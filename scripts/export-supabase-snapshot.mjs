import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLES = [
  "companies",
  "company_citations",
  "cause_profiles",
  "cause_evidence",
  "political_profiles",
  "political_evidence",
  "layoffs_fyi_signals",
];

async function fetchTable(tableName) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    const message = String(error.message ?? "");
    if (/Could not find the table 'public\.[^']+' in the schema cache/i.test(message)) {
      return { tableName, skipped: true, reason: message, rows: [] };
    }

    throw new Error(`${tableName}: ${message}`);
  }

  return { tableName, skipped: false, reason: null, rows: data ?? [] };
}

function toSlugDate(value) {
  return value.toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const now = new Date();
  const stamp = toSlugDate(now);
  const outputDir = path.join(process.cwd(), "backups", "supabase");
  const outputPath = path.join(outputDir, `snapshot-${stamp}.json`);

  await mkdir(outputDir, { recursive: true });

  const tables = [];
  for (const tableName of TABLES) {
    const table = await fetchTable(tableName);
    tables.push(table);
    if (table.skipped) {
      console.warn(`Skipped ${tableName}: ${table.reason}`);
    } else {
      console.log(`Fetched ${table.rows.length} row(s) from ${tableName}`);
    }
  }

  const payload = {
    exportedAt: now.toISOString(),
    source: "supabase",
    tables,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote Supabase snapshot to ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});