import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const { data, error } = await supabase
  .from("companies")
  .select("id", { count: "exact" })
  .limit(1);

if (error) {
  console.error("Supabase connection failed:");
  console.error(error.message);
  process.exit(1);
}

console.log("Supabase connection OK.");
console.log(`Companies table reachable. Sample rows returned: ${data?.length ?? 0}`);