/**
 * Cause and spending accountability contracts.
 * These types power taxonomy, evidence quality, and cause scoring.
 */

export type CauseCategoryId =
  | "worker-wellbeing"
  | "digital-rights"
  | "climate-environment"
  | "health-human-services"
  | "education-opportunity"
  | "civil-democratic-institutions"
  | "equity-inclusion"
  | "other-unclassified";

export interface CauseSubcategory {
  id: string;
  label: string;
  description: string;
}

export interface CauseCategory {
  id: CauseCategoryId;
  label: string;
  description: string;
  subcategories: CauseSubcategory[];
}

export type CauseSignalType =
  | "grant-donation"
  | "recipient-disclosure"
  | "policy-commitment"
  | "lobbying-alignment"
  | "pac-political-spend"
  | "trade-association-alignment";

export type SpendingChannel =
  | "direct-corporate-grant"
  | "corporate-foundation-grant"
  | "lobbying-expenditure"
  | "pac-contribution"
  | "trade-association-dues"
  | "sponsorship";

export type Stance = "supportive" | "opposing" | "mixed" | "unclear";

export type SourceTier = "primary" | "secondary" | "tertiary";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface CauseEvidenceRecord {
  companyId: string;
  fiscalYear: number;
  categoryId: CauseCategoryId;
  subcategoryId?: string;
  signalType: CauseSignalType;
  channel: SpendingChannel;
  stance: Stance;
  amountUsd?: number;
  recipientName?: string;
  sourceUrl: string;
  sourceDate: string;
  sourceTier: SourceTier;
  confidence: ConfidenceLevel;
  notes?: string;
}

export interface CauseScoreWeights {
  supportSignal: number;
  spendingAlignment: number;
  disclosureQuality: number;
  alignmentGap: number;
}

export type CauseProfileStatus = "not-started" | "in-progress" | "published";

export interface CompanyCauseProfile {
  companyId: string;
  profileStatus: CauseProfileStatus;
  causeScore?: number;
  disclosedSpendUsd?: number;
  categorySpendUsd?: Partial<Record<CauseCategoryId, number>>;
  topCauseCategoryId?: CauseCategoryId;
  evidenceRecords: number;
  highConfidenceRecords: number;
  lastUpdated: string;
}
