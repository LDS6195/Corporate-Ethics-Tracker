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
  /** True if the company funds reskilling/upskilling for displaced workers. */
  reskillingFunded: boolean;
  /** True if a human-in-the-loop review is mandated for high-stakes AI decisions. */
  humanInTheLoopMandate: boolean;
  /** True if the company's ToS reserves the right to scrape/train on user data without opt-out. */
  tosScrapingOptOut: boolean;
  /** Optional total layoffs value from external layoff-tracker sources. */
  layoffsTotal?: number;
  /** Optional latest layoff date from external layoff-tracker sources. */
  layoffsLatest?: string;
  /** Optional layoff-industry label from external layoff-tracker sources. */
  layoffsIndustry?: string;
  /** Optional AI-attributed layoffs total from external layoff-tracker sources. */
  aiLayoffEmployees?: number;
  /** Optional AI-attributed layoff event count from external layoff-tracker sources. */
  aiLayoffEvents?: number;
  citations: Citation[];
  /** ISO 8601 date string of the last audit update. */
  lastUpdated: string;
}
