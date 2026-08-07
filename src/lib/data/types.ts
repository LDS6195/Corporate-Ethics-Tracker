import type { CompanyAudit } from "@/types/company";
import type {
  CompanyCauseProfile,
  CauseCategoryId,
  ConfidenceLevel,
} from "@/types/causes";
import type { CompanyPoliticalProfile } from "@/types/politics";

export type AppDataBackend = "json" | "supabase" | "airtable";

export interface CauseEvidenceSummaryRow {
  companyId: string;
  categoryId: CauseCategoryId;
  amountUsd?: number;
  signal?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
  confidence?: ConfidenceLevel;
}

export interface AppRepository {
  listCompanies(): Promise<CompanyAudit[]>;
  listCauseProfiles(): Promise<CompanyCauseProfile[]>;
  listCauseEvidence(): Promise<CauseEvidenceSummaryRow[]>;
  listPoliticalProfiles(): Promise<CompanyPoliticalProfile[]>;
}