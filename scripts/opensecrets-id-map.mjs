import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const mapPath = path.resolve(cwd, "src/data/openSecretsOrgMap.json");

function parseArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

const companyFilterArg = parseArg("--company");
const outputMode = parseArg("--output") || "json";
const missingOnly = process.argv.includes("--missing-only");

const raw = fs.readFileSync(mapPath, "utf8");
const map = JSON.parse(raw);

const companyFilter = companyFilterArg
  ? new Set(
      companyFilterArg
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    )
  : null;

const filtered = map.records.filter((record) => {
  if (companyFilter && !companyFilter.has(record.companyId)) {
    return false;
  }
  if (missingOnly && record.status !== "missing-id") {
    return false;
  }
  return true;
});

const summary = {
  totalRecords: map.records.length,
  verified: map.records.filter((r) => r.status === "verified").length,
  missingId: map.records.filter((r) => r.status === "missing-id").length,
  selected: filtered.length,
};

if (outputMode === "table") {
  console.log("companyId\tstatus\torgId\tsummaryUrl\trecipientsUrl");
  for (const row of filtered) {
    console.log(
      [
        row.companyId,
        row.status,
        row.orgId || "",
        row.summaryUrl || "",
        row.recipientsUrl || "",
      ].join("\t")
    );
  }
  console.log("");
  console.log(`Coverage: ${summary.verified}/${summary.totalRecords} verified IDs`);
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      summary,
      records: filtered,
      usage: {
        companyFilter: "node scripts/opensecrets-id-map.mjs --company=amazon,alphabet",
        missingOnly: "node scripts/opensecrets-id-map.mjs --missing-only",
        tableOutput: "node scripts/opensecrets-id-map.mjs --output=table",
      },
    },
    null,
    2
  )
);