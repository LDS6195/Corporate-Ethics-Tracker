import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import https from "node:https";

const SOURCE_SERVER = "https://layoffsfyi-production.up.railway.app";
const SOURCE_URLS = {
  companies: `${SOURCE_SERVER}/api/companies-list`,
  aiStats: `${SOURCE_SERVER}/api/ai-layoffs-stats`,
};

const COMPANIES_PATH = "src/data/companies.json";
const ALIAS_PATH = "src/data/layoffsFyiAliasMap.json";
const OUTPUT_PATH = "src/data/layoffsFyiSignals.json";
const AI_CUMULATIVE_YEARS = new Set(["2026", "2025", "2024"]);

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLegalSuffixes(name) {
  return String(name ?? "")
    .replace(/,?\s+inc\.?$/i, "")
    .replace(/,?\s+incorporated$/i, "")
    .replace(/,?\s+corporation$/i, "")
    .replace(/,?\s+corp\.?$/i, "")
    .replace(/,?\s+company$/i, "")
    .replace(/^the\s+/i, "")
    .trim();
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "SP-AVLNCH-LayoffsSync/1.0 (contact: ops@example.com)",
          Accept: "application/json",
        },
      },
      (res) => {
        const { statusCode } = res;
        if (!statusCode || statusCode < 200 || statusCode >= 300) {
          reject(new Error(`Request failed for ${url}: HTTP ${statusCode ?? "unknown"}`));
          res.resume();
          return;
        }

        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(new Error(`Invalid JSON from ${url}: ${error.message}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function readJson(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const raw = await readFile(fullPath, "utf8");
  return JSON.parse(raw);
}

function buildNameCandidates(company, aliasEntry) {
  const names = new Set();
  names.add(company.name);
  names.add(stripLegalSuffixes(company.name));

  for (const alias of aliasEntry?.names ?? []) {
    names.add(alias);
  }

  const normalized = new Set();
  for (const name of names) {
    const n = normalize(name);
    if (n) normalized.add(n);
  }

  return [...normalized];
}

function buildSlugCandidates(company, aliasEntry) {
  const slugs = new Set();
  slugs.add(company.id);
  for (const slug of aliasEntry?.slugs ?? []) {
    slugs.add(String(slug));
  }

  const normalized = new Set();
  for (const slug of slugs) {
    const n = normalize(slug).replace(/\s+/g, "-");
    if (n) normalized.add(n);
  }

  return [...normalized];
}

function findCompanyMatch(companyList, nameCandidates, slugCandidates) {
  const bySlug = companyList.find((record) => {
    const slug = normalize(record.slug).replace(/\s+/g, "-");
    return slugCandidates.includes(slug);
  });
  if (bySlug) return bySlug;

  const exactName = companyList.find((record) => nameCandidates.includes(normalize(record.name)));
  if (exactName) return exactName;

  return companyList.find((record) => {
    const name = normalize(record.name);
    return nameCandidates.some((candidate) => name.startsWith(candidate));
  });
}

function aggregateAiEvents(eventsByYear, matchedRecord, nameCandidates, slugCandidates) {
  const flattened = [];
  for (const [year, events] of Object.entries(eventsByYear ?? {})) {
    if (!AI_CUMULATIVE_YEARS.has(String(year))) continue;
    for (const event of events) {
      flattened.push({ ...event, year });
    }
  }

  const relatedEvents = flattened.filter((event) => {
    const eventName = normalize(event.company);
    const eventSlug = normalize(event.slug).replace(/\s+/g, "-");
    const matchedSlug = normalize(matchedRecord?.slug ?? "").replace(/\s+/g, "-");

    if (matchedSlug && eventSlug === matchedSlug) return true;
    if (slugCandidates.includes(eventSlug)) return true;
    return nameCandidates.includes(eventName);
  });

  const aiLayoffEmployees = relatedEvents.reduce((sum, event) => {
    return sum + (Number.isFinite(event.count) ? event.count : 0);
  }, 0);

  return {
    aiLayoffEmployees,
    aiLayoffEvents: relatedEvents.length,
    events: relatedEvents
      .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))
      .map((event) => ({
        year: event.year,
        company: event.company,
        slug: event.slug,
        date: event.date ?? null,
        count: Number.isFinite(event.count) ? event.count : null,
        percent: Number.isFinite(event.percent) ? event.percent : null,
        source: event.source ?? null,
        explanation: event.explanation ?? null,
      })),
  };
}

async function main() {
  const [companiesData, aliasMap, companiesList, aiStats] = await Promise.all([
    readJson(COMPANIES_PATH),
    readJson(ALIAS_PATH),
    fetchJson(SOURCE_URLS.companies),
    fetchJson(SOURCE_URLS.aiStats),
  ]);

  const trackedCompanies = companiesData.companies.map((company) => {
    const aliasEntry = aliasMap[company.id] ?? {};
    const nameCandidates = buildNameCandidates(company, aliasEntry);
    const slugCandidates = buildSlugCandidates(company, aliasEntry);
    const matchedRecord = findCompanyMatch(companiesList, nameCandidates, slugCandidates);

    const aiAggregate = aggregateAiEvents(
      aiStats.eventsByYear,
      matchedRecord,
      nameCandidates,
      slugCandidates
    );

    return {
      companyId: company.id,
      companyName: company.name,
      ticker: company.ticker,
      matched: Boolean(matchedRecord),
      matchedName: matchedRecord?.name ?? null,
      matchedSlug: matchedRecord?.slug ?? null,
      layoffsTotal: Number.isFinite(matchedRecord?.total) ? matchedRecord.total : null,
      layoffsLatest: matchedRecord?.latest ?? null,
      layoffsIndustry: matchedRecord?.industry ?? null,
      aiLayoffEmployees:
        Number.isFinite(aiAggregate.aiLayoffEmployees) && aiAggregate.aiLayoffEmployees > 0
          ? aiAggregate.aiLayoffEmployees
          : null,
      aiLayoffEvents: aiAggregate.aiLayoffEvents,
      aiLayoffTrackedFromSource: aiAggregate.aiLayoffEvents > 0,
      aiEvents: aiAggregate.events,
      source: "Layoffs.fyi",
      sourceCompanyUrl: matchedRecord?.slug ? `https://layoffs.fyi/company/${matchedRecord.slug}/` : null,
    };
  });

  const output = {
    sourceName: "Layoffs.fyi",
    sourceUrls: {
      tracker: "https://layoffs.fyi/",
      companies: "https://layoffs.fyi/companies/",
      aiLayoffs: "https://layoffs.fyi/ai-layoffs/",
      companiesApi: SOURCE_URLS.companies,
      aiLayoffsApi: SOURCE_URLS.aiStats,
    },
    aiLayoffYearsIncluded: [...AI_CUMULATIVE_YEARS],
    sourceUpdatedAt: aiStats.updatedAt ?? null,
    generatedAt: new Date().toISOString(),
    trackedCount: trackedCompanies.length,
    matchedCount: trackedCompanies.filter((item) => item.matched).length,
    aiTrackedCount: trackedCompanies.filter((item) => item.aiLayoffTrackedFromSource).length,
    trackedCompanies,
  };

  const fullOutputPath = path.join(process.cwd(), OUTPUT_PATH);
  await writeFile(fullOutputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(
    `Matched ${output.matchedCount}/${output.trackedCount}; AI-attributed layoffs found for ${output.aiTrackedCount} companies.`
  );

  const unmatched = trackedCompanies.filter((item) => !item.matched).map((item) => item.companyName);
  if (unmatched.length > 0) {
    console.log("Unmatched companies:");
    for (const name of unmatched) {
      console.log(`- ${name}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
