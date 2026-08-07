import type { CompanyAudit } from "@/types/company";

export const DEFAULT_SP500_RANK = 500;

export function getSp500Rank(company: CompanyAudit): number {
  if (typeof company.sp500Rank === "number" && Number.isFinite(company.sp500Rank)) {
    return company.sp500Rank;
  }

  return DEFAULT_SP500_RANK;
}

export function compareCompaniesBySp500Rank(a: CompanyAudit, b: CompanyAudit) {
  const rankDiff = getSp500Rank(a) - getSp500Rank(b);
  if (rankDiff !== 0) return rankDiff;
  return a.name.localeCompare(b.name);
}