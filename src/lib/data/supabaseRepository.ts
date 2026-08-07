import { unstable_cache } from "next/cache";
import { createSupabaseBrowserSafeClient, isSupabaseConfigured } from "@/lib/supabase/server";
import layoffsSignalsData from "@/data/layoffsFyiSignals.json";
import type { CompanyAudit } from "@/types/company";
import type { CompanyCauseProfile } from "@/types/causes";
import type { CompanyPoliticalProfile } from "@/types/politics";
import type { AppRepository, CauseEvidenceSummaryRow } from "@/lib/data/types";

const CACHE_WINDOW_SECONDS = 60 * 60 * 24;

interface SupabaseCitationRow {
  id: string;
  title: string;
  source_name: string;
  url: string;
  snippet: string;
  source_date: string;
  category: CompanyAudit["citations"][number]["category"];
}

interface SupabaseCompanyRow {
  id: string;
  name: string;
  ticker: string;
  logo_url: string;
  industry: string;
  overall_score: number | string;
  category_scores: CompanyAudit["categoryScores"];
  ai_layoff_tracked: boolean;
  reskilling_funded: boolean;
  human_in_the_loop_mandate: boolean;
  tos_scraping_opt_out: boolean;
  company_citations?: SupabaseCitationRow[];
  last_updated: string;
}

interface SupabaseLayoffsSignalRow {
  company_id: string;
  layoffs_total: number | null;
  layoffs_latest: string | null;
  layoffs_industry: string | null;
  ai_layoff_employees: number | null;
  ai_layoff_events: number | null;
}

interface LocalLayoffsSignalRow {
  companyId: string;
  layoffsTotal?: number | null;
  layoffsLatest?: string | null;
  layoffsIndustry?: string | null;
  aiLayoffEmployees?: number | null;
  aiLayoffEvents?: number | null;
}

const localLayoffsByCompanyId = new Map<string, LocalLayoffsSignalRow>(
  ((layoffsSignalsData?.trackedCompanies ?? []) as LocalLayoffsSignalRow[]).map((row) => [
    row.companyId,
    row,
  ])
);

interface SupabaseCauseProfileRow {
  company_id: string;
  profile_status: CompanyCauseProfile["profileStatus"];
  cause_score: number | null;
  disclosed_spend_usd: number | null;
  category_spend_usd: CompanyCauseProfile["categorySpendUsd"] | null;
  top_cause_category_id: CompanyCauseProfile["topCauseCategoryId"] | null;
  evidence_records: number;
  high_confidence_records: number;
  last_updated: string;
}

interface SupabaseCauseEvidenceRow {
  company_id: string;
  category_id: CauseEvidenceSummaryRow["categoryId"];
  amount_usd: number | null;
}

interface SupabasePoliticalProfileRow {
  company_id: string;
  profile_status: CompanyPoliticalProfile["profileStatus"];
  election_cycle: string | null;
  pac_contributions_usd: number | null;
  democratic_pct: number | null;
  republican_pct: number | null;
  third_party_pct: number | null;
  lobbying_spend_usd: number | null;
  lobbying_spend_prior_year_usd: number | null;
  lobbying_focus_summary: string | null;
  lobbying_policy_area: string | null;
  lobbying_bill_summary: string | null;
  lobbying_focus_areas: string[] | null;
  top_lobbied_bill_id: string | null;
  top_lobbied_bill_title: string | null;
  top_lobbied_bill_url: string | null;
  lobbying_source_url: string | null;
  revolving_door_current: CompanyPoliticalProfile["revolvingDoorCurrent"] | null;
  revolving_door_prior: CompanyPoliticalProfile["revolvingDoorPrior"] | null;
  trade_association_risk_flag: boolean | null;
  evidence_records: number;
  high_confidence_records: number;
  last_updated: string;
}

function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createSupabaseBrowserSafeClient();
}

const listCompaniesCached = unstable_cache(
  async (): Promise<CompanyAudit[]> => {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*, company_citations(*)")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`companies: ${error.message}`);
    }

    const layoffsResult = await supabase
      .from("layoffs_fyi_signals")
      .select(
        "company_id, layoffs_total, layoffs_latest, layoffs_industry, ai_layoff_employees, ai_layoff_events"
      );

    const layoffsByCompanyId = new Map<string, SupabaseLayoffsSignalRow | LocalLayoffsSignalRow>();
    if (!layoffsResult.error) {
      for (const row of (layoffsResult.data ?? []) as SupabaseLayoffsSignalRow[]) {
        layoffsByCompanyId.set(row.company_id, row);
      }
    } else {
      for (const [companyId, row] of localLayoffsByCompanyId.entries()) {
        layoffsByCompanyId.set(companyId, row);
      }
    }

    return ((data ?? []) as SupabaseCompanyRow[]).map((row) => {
      const signal = layoffsByCompanyId.get(row.id);

      return {
      ...(signal
        ? {
            layoffsTotal:
              "layoffs_total" in signal
                ? signal.layoffs_total ?? undefined
                : signal.layoffsTotal ?? undefined,
            layoffsLatest:
              "layoffs_latest" in signal
                ? signal.layoffs_latest ?? undefined
                : signal.layoffsLatest ?? undefined,
            layoffsIndustry:
              "layoffs_industry" in signal
                ? signal.layoffs_industry ?? undefined
                : signal.layoffsIndustry ?? undefined,
            aiLayoffEmployees:
              "ai_layoff_employees" in signal
                ? signal.ai_layoff_employees ?? undefined
                : signal.aiLayoffEmployees ?? undefined,
            aiLayoffEvents:
              "ai_layoff_events" in signal
                ? signal.ai_layoff_events ?? undefined
                : signal.aiLayoffEvents ?? undefined,
          }
        : {}),
      id: row.id,
      name: row.name,
      ticker: row.ticker,
      logoUrl: row.logo_url,
      industry: row.industry,
      overallScore: Number(row.overall_score),
      categoryScores: row.category_scores,
      aiLayoffTracked: row.ai_layoff_tracked,
      reskillingFunded: row.reskilling_funded,
      humanInTheLoopMandate: row.human_in_the_loop_mandate,
      tosScrapingOptOut: row.tos_scraping_opt_out,
      citations: (row.company_citations ?? []).map((citation) => ({
        id: citation.id,
        title: citation.title,
        sourceName: citation.source_name,
        url: citation.url,
        snippet: citation.snippet,
        date: citation.source_date,
        category: citation.category,
      })),
      lastUpdated: row.last_updated,
    };
    });
  },
  ["supabase-companies"],
  { revalidate: CACHE_WINDOW_SECONDS }
);

const listCauseProfilesCached = unstable_cache(
  async (): Promise<CompanyCauseProfile[]> => {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("cause_profiles")
      .select("*")
      .order("company_id", { ascending: true });

    if (error) {
      throw new Error(`cause_profiles: ${error.message}`);
    }

    return ((data ?? []) as SupabaseCauseProfileRow[]).map((row) => ({
      companyId: row.company_id,
      profileStatus: row.profile_status,
      causeScore: row.cause_score ?? undefined,
      disclosedSpendUsd: row.disclosed_spend_usd ?? undefined,
      categorySpendUsd: row.category_spend_usd ?? undefined,
      topCauseCategoryId: row.top_cause_category_id ?? undefined,
      evidenceRecords: row.evidence_records,
      highConfidenceRecords: row.high_confidence_records,
      lastUpdated: row.last_updated,
    }));
  },
  ["supabase-cause-profiles"],
  { revalidate: CACHE_WINDOW_SECONDS }
);

const listCauseEvidenceCached = unstable_cache(
  async (): Promise<CauseEvidenceSummaryRow[]> => {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("cause_evidence")
      .select("company_id, category_id, amount_usd")
      .order("company_id", { ascending: true });

    if (error) {
      throw new Error(`cause_evidence: ${error.message}`);
    }

    return ((data ?? []) as SupabaseCauseEvidenceRow[]).map((row) => ({
      companyId: row.company_id,
      categoryId: row.category_id,
      amountUsd: row.amount_usd ?? undefined,
    }));
  },
  ["supabase-cause-evidence"],
  { revalidate: CACHE_WINDOW_SECONDS }
);

const listPoliticalProfilesCached = unstable_cache(
  async (): Promise<CompanyPoliticalProfile[]> => {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("political_profiles")
      .select("*")
      .order("company_id", { ascending: true });

    if (error) {
      throw new Error(`political_profiles: ${error.message}`);
    }

    return ((data ?? []) as SupabasePoliticalProfileRow[]).map((row) => ({
      companyId: row.company_id,
      profileStatus: row.profile_status,
      electionCycle: row.election_cycle ?? undefined,
      pacContributionsUsd: row.pac_contributions_usd ?? undefined,
      democraticPct: row.democratic_pct ?? undefined,
      republicanPct: row.republican_pct ?? undefined,
      thirdPartyPct: row.third_party_pct ?? undefined,
      lobbyingSpendUsd: row.lobbying_spend_usd ?? undefined,
      lobbyingSpendPriorYearUsd: row.lobbying_spend_prior_year_usd ?? undefined,
      lobbyingFocusSummary: row.lobbying_focus_summary ?? undefined,
      lobbyingPolicyArea: row.lobbying_policy_area ?? undefined,
      lobbyingBillSummary: row.lobbying_bill_summary ?? undefined,
      lobbyingFocusAreas: row.lobbying_focus_areas ?? undefined,
      topLobbiedBillId: row.top_lobbied_bill_id ?? undefined,
      topLobbiedBillTitle: row.top_lobbied_bill_title ?? undefined,
      topLobbiedBillUrl: row.top_lobbied_bill_url ?? undefined,
      lobbyingSourceUrl: row.lobbying_source_url ?? undefined,
      revolvingDoorCurrent: row.revolving_door_current ?? undefined,
      revolvingDoorPrior: row.revolving_door_prior ?? undefined,
      tradeAssociationRiskFlag: row.trade_association_risk_flag ?? undefined,
      evidenceRecords: row.evidence_records,
      highConfidenceRecords: row.high_confidence_records,
      lastUpdated: row.last_updated,
    }));
  },
  ["supabase-political-profiles"],
  { revalidate: CACHE_WINDOW_SECONDS }
);

export const supabaseRepository: AppRepository = {
  listCompanies: listCompaniesCached,
  listCauseProfiles: listCauseProfilesCached,
  listCauseEvidence: listCauseEvidenceCached,
  listPoliticalProfiles: listPoliticalProfilesCached,
};