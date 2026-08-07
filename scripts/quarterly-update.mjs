import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = process.argv.slice(2);
const shouldSeedSupabase = args.includes("--seed-supabase");
const companyIds = args.filter((arg) => arg !== "--seed-supabase");

function runStep(label, args) {
  console.log(`\n=== ${label} ===`);

  const result =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", npmCommand, ...args], {
          stdio: "inherit",
        })
      : spawnSync(npmCommand, args, {
          stdio: "inherit",
        });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.error) {
    throw result.error;
  }
}

runStep("Sync Layoffs.fyi Signals", ["run", "layoffs:sync"]);
if (shouldSeedSupabase) {
  runStep("Seed Supabase", ["run", "supabase:seed"]);
} else {
  console.log("\n=== Seed Supabase ===");
  console.log("Skipped (JSON-first mode). Pass --seed-supabase to include this step.");
}
runStep("Revalidate Cached Pages", ["run", "revalidate:site", "--", ...companyIds]);

console.log("\nQuarterly update complete.");