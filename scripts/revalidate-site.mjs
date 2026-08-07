import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const revalidateBaseUrl = process.env.REVALIDATE_BASE_URL;
const revalidateSecret = process.env.REVALIDATE_SECRET;
const companyIds = process.argv.slice(2);

if (!revalidateBaseUrl || !revalidateSecret) {
  console.error("Missing REVALIDATE_BASE_URL or REVALIDATE_SECRET in .env.local");
  process.exit(1);
}

const response = await fetch(`${revalidateBaseUrl.replace(/\/$/, "")}/api/revalidate`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-revalidate-secret": revalidateSecret,
  },
  body: JSON.stringify({ companyIds }),
});

const payload = await response.json().catch(() => null);

if (!response.ok) {
  console.error("Revalidation failed.");
  if (payload) {
    console.error(JSON.stringify(payload, null, 2));
  }
  process.exit(1);
}

console.log("Revalidation OK.");
console.log(JSON.stringify(payload, null, 2));