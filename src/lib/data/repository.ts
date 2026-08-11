import { cache } from "react";
import companiesData from "@/data/companies.json";
import layoffsSignalsData from "@/data/layoffsFyiSignals.json";
import causeProfilesData from "@/data/causeProfiles.json";
import causeEvidenceData from "@/data/causeEvidence.json";
import politicalProfilesData from "@/data/politicalProfiles.json";
import type { CompanyAudit } from "@/types/company";
import type { CompanyCauseProfile } from "@/types/causes";
import type { CompanyPoliticalProfile } from "@/types/politics";
import { supabaseRepository } from "@/lib/data/supabaseRepository";
import type {
  AppDataBackend,
  AppRepository,
  CauseEvidenceSummaryRow,
} from "@/lib/data/types";

interface LayoffsSignalRow {
  companyId: string;
  layoffsTotal?: number | null;
  layoffsLatest?: string | null;
  layoffsIndustry?: string | null;
  aiLayoffEmployees?: number | null;
  aiLayoffEstimated?: boolean | null;
  aiLayoffEvents?: number | null;
}

const layoffsSignalsByCompanyId = new Map<string, LayoffsSignalRow>(
  ((layoffsSignalsData?.trackedCompanies ?? []) as LayoffsSignalRow[]).map((row) => [
    row.companyId,
    row,
  ])
);

function mergeLayoffsSignals(companies: CompanyAudit[]): CompanyAudit[] {
  return companies.map((company) => {
    const signal = layoffsSignalsByCompanyId.get(company.id);
    if (!signal) return company;

    return {
      ...company,
      layoffsTotal: signal.layoffsTotal ?? undefined,
      layoffsLatest: signal.layoffsLatest ?? undefined,
      layoffsIndustry: signal.layoffsIndustry ?? undefined,
      aiLayoffEmployees: signal.aiLayoffEmployees ?? undefined,
      aiLayoffEstimated: signal.aiLayoffEstimated ?? undefined,
      aiLayoffEvents: signal.aiLayoffEvents ?? undefined,
    };
  });
}

const jsonRepository: AppRepository = {
  listCompanies: async () =>
    mergeLayoffsSignals(companiesData.companies as CompanyAudit[]),
  listCauseProfiles: async () => causeProfilesData.profiles as CompanyCauseProfile[],
  listCauseEvidence: async () =>
    ((causeEvidenceData.records ?? []) as CauseEvidenceSummaryRow[]),
  listPoliticalProfiles: async () =>
    politicalProfilesData.profiles as CompanyPoliticalProfile[],
};

function normalizeBackend(value?: string): AppDataBackend {
  if (value === "supabase" || value === "airtable") return value;
  return "json";
}

export function getConfiguredBackend(): AppDataBackend {
  return normalizeBackend(process.env.NEXT_PUBLIC_APP_DATA_BACKEND);
}

export function getActiveRepository(): AppRepository {
  const backend = getConfiguredBackend();

  if (backend === "supabase") {
    return supabaseRepository;
  }

  if (backend === "airtable") {
    return jsonRepository;
  }

  return jsonRepository;
}

export function getRepositoryStatus() {
  const configuredBackend = getConfiguredBackend();
  const activeBackend: AppDataBackend =
    configuredBackend === "supabase" ? "supabase" : "json";

  return {
    configuredBackend,
    activeBackend,
    isFallback: configuredBackend !== activeBackend,
    fallbackReason:
      configuredBackend === activeBackend
        ? null
        : "Configured backend is not available, so the app is serving the local JSON seed.",
  };
}

export const getCompanies = cache(async () => getActiveRepository().listCompanies());

export const getCauseProfiles = cache(async () =>
  getActiveRepository().listCauseProfiles()
);

export const getCauseEvidence = cache(async () =>
  getActiveRepository().listCauseEvidence()
);

export const getPoliticalProfiles = cache(async () =>
  getActiveRepository().listPoliticalProfiles()
);