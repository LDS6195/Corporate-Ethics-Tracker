/**
 * Data contracts for the Corporate AI Accountability Index.
 * These types define the shape of every company audit record consumed by
 * the dashboard, and produced by the SEC EDGAR ingestion pipeline.
 */

/** Sub-category scores that sum to `overallScore` (0-100). */
export interface CategoryScores {
  /** Impact of AI-driven workforce reduction / automation. Range: 0-30. */
  laborDisplacement: number;
  /** Strength of data privacy & consent practices. Range: 0-25. */
  dataPrivacy: number;
  /** Degree of mandated human review over AI decisions. Range: 0-25. */
  humanOversight: number;
  /** Public disclosure & transparency of AI policy. Range: 0-20. */
  transparency: number;
}

/** The source document types a citation can be drawn from. */
export type CitationCategory =
  | "SEC Filing"
  | "WARN Notice"
  | "Policy"
  | "News";

/** A single verifiable source backing a claim in a `CompanyAudit`. */
export interface Citation {
  id: string;
  title: string;
  sourceName: string;
  url: string;
  snippet: string;
  /** ISO 8601 date string, e.g. "2024-11-15". */
  date: string;
  category: CitationCategory;
}

/** Full accountability audit record for a single tracked company. */
export interface CompanyAudit {
  id: string;
  name: string;
  ticker: string;
  /** Optional S&P 500 rank. Defaults to 500 when unknown. */
  sp500Rank?: number;
  logoUrl: string;
  industry: string;
  /** Weighted composite score, 0-100. */
  overallScore: number;
  categoryScores: CategoryScores;
  /** True if the company has publicly confirmed AI-attributed layoffs. */
  aiLayoffTracked: boolean;
  /** Confirmed AI-attributed headcount from layoffs.fyi; drives the scaled labor penalty. */
  aiLayoffCount: number;
  /** True if the company funds reskilling/upskilling for displaced workers. */
  reskillingFunded: boolean;
  /** True if a human-in-the-loop review is mandated for high-stakes AI decisions. */
  humanInTheLoopMandate: boolean;
  /** True if the company's ToS reserves the right to scrape/train on user data without opt-out. */
  tosScrapingOptOut: boolean;
  /** True if the company has an explicit, public statement that it does not train AI models on users' private personal data. */
  noAiTrainingOnPersonalData: boolean;
  /** True if the company offers an opt-out mechanism specific to AI training use (not just general data-sale opt-out). */
  dedicatedAiTrainingOptOut: boolean;
  /** True if a confirmed regulatory privacy fine (e.g. GDPR, FTC) is documented in citations. */
  confirmedPrivacyFine: boolean;
  /** True if the company has a named, dedicated internal body governing AI trust/safety (not just a general committee mention). */
  dedicatedAiGovernanceBody: boolean;
  /** True if the company explicitly commits to not making legally/significantly consequential decisions via full automation. */
  noConsequentialAutomatedDecisions: boolean;
  /** True if the company publishes a recurring (annual or more frequent) public AI transparency/progress report. */
  recurringPublicAiReport: boolean;
  /** True if the company publishes concrete, verifiable AI transparency artifacts (e.g. model cards, published risk assessments). */
  concreteTransparencyArtifacts: boolean;
  /** Optional total layoffs value from external layoff-tracker sources. */
  layoffsTotal?: number;
  /** Optional latest layoff date from external layoff-tracker sources. */
  layoffsLatest?: string;
  /** Optional layoff-industry label from external layoff-tracker sources. */
  layoffsIndustry?: string;
  /** Optional AI-attributed layoffs total from external layoff-tracker sources. */
  aiLayoffEmployees?: number;
  /** True when aiLayoffEmployees is an estimate (exact count not publicly reported). */
  aiLayoffEstimated?: boolean;
  /** Optional AI-attributed layoff event count from external layoff-tracker sources. */
  aiLayoffEvents?: number;
  citations: Citation[];
  /** ISO 8601 date string of the last audit update. */
  lastUpdated: string;
}
