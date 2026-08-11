import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCauseProfiles,
  getCompanies,
  getPoliticalProfiles,
} from "@/lib/data/repository";
import type { CompanyAudit } from "@/types/company";
import {
  CATEGORY_INFO,
  CATEGORY_MAX,
  getScoreTier,
} from "@/lib/scoring";
import { CAUSE_TAXONOMY } from "@/lib/causes";
import CompanyDetailView from "./CompanyDetailView";

export const dynamic = "force-static";

function extractNumberMetric(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (!match) return null;
  for (let i = 1; i < match.length; i += 1) {
    if (match[i]) return match[i];
  }
  return null;
}

function findMetricFromCitations(
  company: CompanyAudit,
  pattern: RegExp
): string | null {
  for (const citation of company.citations) {
    if (!citation.snippet) continue;
    const metric = extractNumberMetric(citation.snippet, pattern);
    if (metric) {
      return metric;
    }
  }
  return null;
}

function findTextMetricFromCitations(
  company: CompanyAudit,
  pattern: RegExp
): string | null {
  for (const citation of company.citations) {
    if (!citation.snippet) continue;
    const match = citation.snippet.match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }
  return null;
}

interface CompanyPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const companies = await getCompanies();
  return companies.map((company) => ({ id: company.id }));
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const companies = await getCompanies();
  const company = companies.find((c) => c.id === params.id);
  return { title: company ? `${company.name} — Corporate AI Accountability Index` : "Company Not Found" };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const [companies, causeProfiles, politicalProfiles] = await Promise.all([
    getCompanies(),
    getCauseProfiles(),
    getPoliticalProfiles(),
  ]);

  const company = companies.find((c) => c.id === params.id);
  if (!company) notFound();

  const causeProfile =
    causeProfiles.find((profile) => profile.companyId === company.id) ??
    {
      companyId: company.id,
      profileStatus: "not-started",
      evidenceRecords: 0,
      highConfidenceRecords: 0,
      lastUpdated: company.lastUpdated,
    };

  const politicalProfile =
    politicalProfiles.find((profile) => profile.companyId === company.id) ??
    {
      companyId: company.id,
      profileStatus: "not-started",
      evidenceRecords: 0,
      highConfidenceRecords: 0,
      lastUpdated: company.lastUpdated,
    };

  const topCauseCategory = causeProfile.topCauseCategoryId
    ? CAUSE_TAXONOMY.find((category) => category.id === causeProfile.topCauseCategoryId)
    : null;

  const tier = getScoreTier(company.overallScore);
  const workforceCount = findMetricFromCitations(
    company,
    /([\d,]+)\s+(?:full-time equivalent\s+)?employees/i
  );
  const reskillingParticipants = findMetricFromCitations(
    company,
    /([\d,]+)\s+[^.]*participated/i
  );
  const layoffCount = findMetricFromCitations(
    company,
    /(?:cut|cuts|cutting|laid off|eliminat(?:e|ed|ing)|layoffs?)\s+(?:about\s+|around\s+|roughly\s+)?([\d,]+)\s+(?:employees|workers|roles|jobs)|([\d,]+)\s+(?:employees|workers|roles|jobs)[^.]{0,80}(?:laid off|eliminations|layoffs|cut)/i
  );
  const totalLayoffsDisplay =
    typeof company.layoffsTotal === "number"
      ? company.layoffsTotal.toLocaleString()
      : layoffCount;
  const aiLayoffsDisplay =
    typeof company.aiLayoffEmployees === "number"
      ? company.aiLayoffEmployees.toLocaleString()
      : null;
  const severanceAmount = findTextMetricFromCitations(
    company,
    /\$[\d.,]+\s*(?:billion|million)[^.]{0,60}severance/i
  );
  const privacyFine = findTextMetricFromCitations(
    company,
    /fine of\s*[€$][\d.,]+\s*(?:billion|million)?/i
  );
  const oversightMentioned = company.citations.some((citation) =>
    /human oversight|human review|human-in-the-loop/i.test(citation.snippet)
  );
  const secCitationCount = company.citations.filter(
    (citation) => citation.category === "SEC Filing"
  ).length;

  const categoryTotals = [
    {
      label: CATEGORY_INFO.laborDisplacement.label,
      description: CATEGORY_INFO.laborDisplacement.description,
      value: company.categoryScores.laborDisplacement,
      max: CATEGORY_MAX.laborDisplacement,
      color: "text-orange-300",
      barColorClassName: "bg-orange-500",
      factors: [
        `AI-attributed layoffs tracked: ${company.aiLayoffTracked ? "Yes" : "No"}`,
        totalLayoffsDisplay
          ? `Disclosed total layoffs: ${totalLayoffsDisplay}`
          : "Disclosed total layoffs: Not found in current sources",
        aiLayoffsDisplay
          ? `AI-attributed layoffs from source: ${aiLayoffsDisplay}`
          : "AI-attributed layoffs from source: Not found",
        severanceAmount
          ? `Severance-related disclosure found: ${severanceAmount}`
          : "Severance-related disclosure found: No explicit severance metric captured",
        workforceCount
          ? `Disclosed workforce baseline: ${workforceCount} employees`
          : "Disclosed workforce baseline: Not found in current citations",
        `Reskilling funded: ${company.reskillingFunded ? "Yes" : "No"}`,
      ],
    },
    {
      label: CATEGORY_INFO.dataPrivacy.label,
      description: CATEGORY_INFO.dataPrivacy.description,
      value: company.categoryScores.dataPrivacy,
      max: CATEGORY_MAX.dataPrivacy,
      color: "text-sky-300",
      barColorClassName: "bg-sky-500",
      factors: [
        `Unrestricted data scraping opt-out in place: ${company.tosScrapingOptOut ? "Yes" : "No"}`,
        `Explicit no-AI-training-on-personal-data commitment: ${company.noAiTrainingOnPersonalData ? "Yes" : "No"}`,
        `Dedicated AI-training opt-out mechanism: ${company.dedicatedAiTrainingOptOut ? "Yes" : "No"}`,
        `Confirmed regulatory privacy fine on record: ${company.confirmedPrivacyFine ? "Yes" : "No"}`,
        privacyFine
          ? `Regulatory fine disclosure found: ${privacyFine}`
          : "Regulatory fine disclosure found: Not found in current citations",
        `Privacy/cyber risk disclosure citations: ${company.citations.length}`,
      ],
    },
    {
      label: CATEGORY_INFO.humanOversight.label,
      description: CATEGORY_INFO.humanOversight.description,
      value: company.categoryScores.humanOversight,
      max: CATEGORY_MAX.humanOversight,
      color: "text-violet-300",
      barColorClassName: "bg-violet-500",
      factors: [
        `Human-in-the-loop mandate declared: ${company.humanInTheLoopMandate ? "Yes" : "No"}`,
        `Dedicated AI trust/safety governance body: ${company.dedicatedAiGovernanceBody ? "Yes" : "No"}`,
        `Commits to no consequential fully-automated decisions: ${company.noConsequentialAutomatedDecisions ? "Yes" : "No"}`,
        `Explicit oversight language in sources: ${oversightMentioned ? "Yes" : "No"}`,
        reskillingParticipants
          ? `Documented AI/digital training participants: ${reskillingParticipants}`
          : "Documented AI/digital training participants: Not found in current citations",
      ],
    },
    {
      label: CATEGORY_INFO.transparency.label,
      description: CATEGORY_INFO.transparency.description,
      value: company.categoryScores.transparency,
      max: CATEGORY_MAX.transparency,
      color: "text-emerald-300",
      barColorClassName: "bg-emerald-500",
      factors: [
        `Total citations published on this profile: ${company.citations.length}`,
        `SEC filing citations: ${secCitationCount}`,
        `Recurring public AI transparency report: ${company.recurringPublicAiReport ? "Yes" : "No"}`,
        `Concrete transparency artifacts (model cards, risk assessments): ${company.concreteTransparencyArtifacts ? "Yes" : "No"}`,
        `Last methodology/data refresh: ${company.lastUpdated}`,
      ],
    },
  ];

  const strongestCategory = categoryTotals.reduce((best, current) => {
    const currentPct = current.value / current.max;
    const bestPct = best.value / best.max;
    return currentPct > bestPct ? current : best;
  }, categoryTotals[0]);

  const weakestCategory = categoryTotals.reduce((worst, current) => {
    const currentPct = current.value / current.max;
    const worstPct = worst.value / worst.max;
    return currentPct < worstPct ? current : worst;
  }, categoryTotals[0]);

  const causeCategoryRows = CAUSE_TAXONOMY.filter(
    (category) => category.id !== "other-unclassified"
  ).map((category) => ({
    id: category.id,
    label: category.label,
    amount: causeProfile.categorySpendUsd?.[category.id],
  }));

  const disclosedCategorySpend = causeCategoryRows
    .filter((row) => typeof row.amount === "number")
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return (
    <CompanyDetailView
      company={company}
      causeProfile={causeProfile}
      politicalProfile={politicalProfile}
      tier={tier}
      categoryTotals={categoryTotals}
      strongestCategory={strongestCategory}
      weakestCategory={weakestCategory}
      topCauseCategory={topCauseCategory}
      causeCategoryRows={causeCategoryRows}
      disclosedCategorySpend={disclosedCategorySpend}
    />
  );
}
