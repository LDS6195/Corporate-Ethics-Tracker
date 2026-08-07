import { readFile } from "node:fs/promises";
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

async function readJson(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const raw = await readFile(fullPath, "utf8");
  return JSON.parse(raw);
}

function causeEvidenceKey(record) {
  return [record.companyId, record.categoryId, record.sourceUrl, record.sourceDate].join("::");
}

function politicalEvidenceKey(record) {
  return [
    record.companyId,
    record.metric,
    record.electionCycle ?? "",
    record.sourceUrl,
    record.sourceDate,
  ].join("::");
}

const companiesData = await readJson("src/data/companies.json");
const causeProfilesData = await readJson("src/data/causeProfiles.json");
const causeEvidenceData = await readJson("src/data/causeEvidence.json");
const politicalProfilesData = await readJson("src/data/politicalProfiles.json");
const politicalEvidenceData = await readJson("src/data/politicalEvidence.json");
const layoffsSignalsData = await readJson("src/data/layoffsFyiSignals.json");

const companies = companiesData.companies.map((company) => ({
  id: company.id,
  name: company.name,
  ticker: company.ticker,
  logo_url: company.logoUrl,
  industry: company.industry,
  overall_score: company.overallScore,
  category_scores: company.categoryScores,
  ai_layoff_tracked: company.aiLayoffTracked,
  reskilling_funded: company.reskillingFunded,
  human_in_the_loop_mandate: company.humanInTheLoopMandate,
  tos_scraping_opt_out: company.tosScrapingOptOut,
  last_updated: company.lastUpdated,
}));

const citations = companiesData.companies.flatMap((company) =>
  (company.citations ?? []).map((citation) => ({
    id: citation.id,
    company_id: company.id,
    title: citation.title,
    source_name: citation.sourceName,
    url: citation.url,
    snippet: citation.snippet,
    source_date: citation.date,
    category: citation.category,
  }))
);

const causeProfiles = causeProfilesData.profiles.map((profile) => ({
  company_id: profile.companyId,
  profile_status: profile.profileStatus,
  cause_score: profile.causeScore ?? null,
  disclosed_spend_usd: profile.disclosedSpendUsd ?? null,
  category_spend_usd: profile.categorySpendUsd ?? null,
  top_cause_category_id: profile.topCauseCategoryId ?? null,
  evidence_records: profile.evidenceRecords,
  high_confidence_records: profile.highConfidenceRecords,
  last_updated: profile.lastUpdated,
}));

const causeEvidence = causeEvidenceData.records.map((record) => ({
  record_key: causeEvidenceKey(record),
  company_id: record.companyId,
  category_id: record.categoryId,
  amount_usd: record.amountUsd ?? null,
  source_name: record.sourceName,
  source_url: record.sourceUrl,
  source_date: record.sourceDate,
  signal: record.signal,
  confidence: record.confidence,
}));

const politicalProfiles = politicalProfilesData.profiles.map((profile) => ({
  company_id: profile.companyId,
  profile_status: profile.profileStatus,
  election_cycle: profile.electionCycle ?? null,
  pac_contributions_usd: profile.pacContributionsUsd ?? null,
  democratic_pct: profile.democraticPct ?? null,
  republican_pct: profile.republicanPct ?? null,
  third_party_pct: profile.thirdPartyPct ?? null,
  lobbying_spend_usd: profile.lobbyingSpendUsd ?? null,
  lobbying_spend_prior_year_usd: profile.lobbyingSpendPriorYearUsd ?? null,
  lobbying_focus_summary: profile.lobbyingFocusSummary ?? null,
  lobbying_policy_area: profile.lobbyingPolicyArea ?? null,
  lobbying_bill_summary: profile.lobbyingBillSummary ?? null,
  lobbying_focus_areas: profile.lobbyingFocusAreas ?? null,
  top_lobbied_bill_id: profile.topLobbiedBillId ?? null,
  top_lobbied_bill_title: profile.topLobbiedBillTitle ?? null,
  top_lobbied_bill_url: profile.topLobbiedBillUrl ?? null,
  lobbying_source_url: profile.lobbyingSourceUrl ?? null,
  revolving_door_current: profile.revolvingDoorCurrent ?? null,
  revolving_door_prior: profile.revolvingDoorPrior ?? null,
  trade_association_risk_flag: profile.tradeAssociationRiskFlag ?? null,
  evidence_records: profile.evidenceRecords,
  high_confidence_records: profile.highConfidenceRecords,
  last_updated: profile.lastUpdated,
}));

const politicalEvidence = politicalEvidenceData.records.map((record) => ({
  record_key: politicalEvidenceKey(record),
  company_id: record.companyId,
  metric_key: record.metric,
  metric_value: JSON.stringify(record.value ?? null),
  source_name: record.sourceName,
  source_url: record.sourceUrl,
  source_date: record.sourceDate,
  confidence: record.confidence,
}));

const layoffsSignals = layoffsSignalsData.trackedCompanies.map((record) => ({
  company_id: record.companyId,
  source_name: layoffsSignalsData.sourceName,
  source_updated_at: layoffsSignalsData.sourceUpdatedAt,
  last_checked_at: layoffsSignalsData.generatedAt,
  matched: record.matched,
  matched_name: record.matchedName,
  matched_slug: record.matchedSlug,
  source_company_url: record.sourceCompanyUrl,
  layoffs_total: record.layoffsTotal,
  layoffs_latest: record.layoffsLatest,
  layoffs_industry: record.layoffsIndustry,
  ai_layoff_employees: record.aiLayoffEmployees,
  ai_layoff_events: record.aiLayoffEvents,
  ai_layoff_tracked_from_source: record.aiLayoffTrackedFromSource,
  ai_events: record.aiEvents,
}));

async function upsert(table, rows, conflict) {
  if (rows.length === 0) return;

  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`Upserted ${rows.length} rows into ${table}`);
}

function isMissingRelationError(errorMessage) {
  return /Could not find the table 'public\.[^']+' in the schema cache/i.test(errorMessage);
}

await upsert("companies", companies, "id");
await upsert("company_citations", citations, "id");
await upsert("cause_profiles", causeProfiles, "company_id");
await upsert("cause_evidence", causeEvidence, "record_key");
await upsert("political_profiles", politicalProfiles, "company_id");
await upsert("political_evidence", politicalEvidence, "record_key");
try {
  await upsert("layoffs_fyi_signals", layoffsSignals, "company_id");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (isMissingRelationError(message)) {
    console.warn(
      "Skipping layoffs_fyi_signals upsert: table not found. Apply latest supabase/schema.sql migration to enable persistence."
    );
  } else {
    throw error;
  }
}

console.log("Supabase seed complete.");