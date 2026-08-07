import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCauseProfiles,
  getCompanies,
  getPoliticalProfiles,
} from "@/lib/data/repository";
import type { CompanyAudit } from "@/types/company";
import type { CauseProfileStatus } from "@/types/causes";
import type { PoliticalProfileStatus } from "@/types/politics";
import {
  CATEGORY_INFO,
  CATEGORY_MAX,
  OVERALL_SCORE_DESCRIPTION,
  getScoreTier,
} from "@/lib/scoring";
import { CAUSE_TAXONOMY } from "@/lib/causes";
import ProgressBar from "@/components/ProgressBar";
import Tooltip from "@/components/Tooltip";

export const dynamic = "force-static";

const TIER_STYLES: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-500/40",
  medium: "text-amber-400 bg-amber-950/60 ring-1 ring-amber-500/40",
  low: "text-rose-400 bg-rose-950/60 ring-1 ring-rose-500/40",
};

const PROFILE_STATUS_STYLES: Record<CauseProfileStatus | PoliticalProfileStatus, string> = {
  "not-started": "text-neutral-300 bg-neutral-800/70 ring-1 ring-neutral-700",
  "in-progress": "text-amber-300 bg-amber-950/50 ring-1 ring-amber-700/40",
  published: "text-emerald-300 bg-emerald-950/50 ring-1 ring-emerald-700/40",
};

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
    const match = citation.snippet.match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }
  return null;
}

function normalize(value: number, max: number) {
  return Math.round((value / max) * 100);
}

function formatCurrency(amount?: number) {
  if (amount === undefined) return "Not disclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompactCurrency(amount?: number) {
  if (amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function formatPercent(value?: number) {
  if (value === undefined) return "-";
  return `${value.toFixed(1)}%`;
}

function formatRatio(numerator?: number, denominator?: number) {
  if (numerator === undefined || denominator === undefined || denominator === 0) {
    return "N/A";
  }
  return `${(numerator / denominator).toFixed(1)}x`;
}

function toStatusLabel(status: CauseProfileStatus | PoliticalProfileStatus) {
  return status.replace("-", " ");
}

type CompanyDetailTab = "ai" | "causes" | "political";

function parseDetailTab(tab?: string): CompanyDetailTab {
  if (tab === "causes" || tab === "political") return tab;
  return "ai";
}

interface CompanyPageProps {
  params: { id: string };
  searchParams?: { tab?: string };
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

export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const [companies, causeProfiles, politicalProfiles] = await Promise.all([
    getCompanies(),
    getCauseProfiles(),
    getPoliticalProfiles(),
  ]);

  const company = companies.find((c) => c.id === params.id);
  if (!company) notFound();
  const activeTab = parseDetailTab(searchParams?.tab);

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
      value: company.categoryScores.laborDisplacement,
      max: CATEGORY_MAX.laborDisplacement,
      color: "text-orange-300",
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
      value: company.categoryScores.dataPrivacy,
      max: CATEGORY_MAX.dataPrivacy,
      color: "text-sky-300",
      factors: [
        `Unrestricted data scraping opt-out in place: ${company.tosScrapingOptOut ? "Yes" : "No"}`,
        privacyFine
          ? `Regulatory fine disclosure found: ${privacyFine}`
          : "Regulatory fine disclosure found: Not found in current citations",
        `Privacy/cyber risk disclosure citations: ${company.citations.length}`,
      ],
    },
    {
      label: CATEGORY_INFO.humanOversight.label,
      value: company.categoryScores.humanOversight,
      max: CATEGORY_MAX.humanOversight,
      color: "text-violet-300",
      factors: [
        `Human-in-the-loop mandate declared: ${company.humanInTheLoopMandate ? "Yes" : "No"}`,
        `Explicit oversight language in sources: ${oversightMentioned ? "Yes" : "No"}`,
        reskillingParticipants
          ? `Documented AI/digital training participants: ${reskillingParticipants}`
          : "Documented AI/digital training participants: Not found in current citations",
      ],
    },
    {
      label: CATEGORY_INFO.transparency.label,
      value: company.categoryScores.transparency,
      max: CATEGORY_MAX.transparency,
      color: "text-emerald-300",
      factors: [
        `Total citations published on this profile: ${company.citations.length}`,
        `SEC filing citations: ${secCitationCount}`,
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
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
      >
        ← Back to Index
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={company.logoUrl}
            alt={`${company.name} logo`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-md"
          />
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-50 sm:text-3xl">
              {company.name}
            </h1>
            <p className="text-sm text-neutral-500">
              {company.ticker} · {company.industry}
            </p>
          </div>
        </div>
        {activeTab === "ai" ? (
          <div
            className={`flex flex-col items-center justify-center rounded-lg px-5 py-3 ${TIER_STYLES[tier]}`}
          >
            <Tooltip
              content={
                <>
                  <p>{OVERALL_SCORE_DESCRIPTION}</p>
                  <p className="mt-2 text-neutral-500">
                    {company.citations.length
                      ? `Backed by ${company.citations.length} source citation${company.citations.length === 1 ? "" : "s"} below.`
                      : "No citations sourced yet -- this score reflects the baseline pending research."}
                  </p>
                </>
              }
            >
              <span className="flex cursor-help flex-col items-center">
                <span className="text-3xl font-semibold leading-none tabular-nums">
                  {company.overallScore}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-90">
                  / 100
                  <span className="tooltip-indicator" aria-label="How score is calculated">
                    ?
                  </span>
                </span>
              </span>
            </Tooltip>
          </div>
        ) : activeTab === "causes" ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Causes Profile
            </span>
            <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-semibold ${PROFILE_STATUS_STYLES[causeProfile.profileStatus]}`}>
              {toStatusLabel(causeProfile.profileStatus)}
            </span>
            <span className="mt-2 text-xs text-neutral-400">
              Disclosed spend: {formatCompactCurrency(causeProfile.disclosedSpendUsd ?? disclosedCategorySpend)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Political Profile
            </span>
            <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-semibold ${PROFILE_STATUS_STYLES[politicalProfile.profileStatus]}`}>
              {toStatusLabel(politicalProfile.profileStatus)}
            </span>
            <span className="mt-2 text-xs text-neutral-400">
              PAC: {formatCompactCurrency(politicalProfile.pacContributionsUsd)}
            </span>
          </div>
        )}
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 text-xs" aria-label="Company detail tabs">
        <Link
          href={`/company/${company.id}?tab=ai`}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "ai"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          AI Score Details
        </Link>
        <Link
          href={`/company/${company.id}?tab=causes`}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "causes"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          Causes and Spending
        </Link>
        <Link
          href={`/company/${company.id}?tab=political`}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "political"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          Political Activity
        </Link>
      </nav>

      {activeTab === "ai" && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Category Breakdown
            </h2>
            <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <ProgressBar
                label={CATEGORY_INFO.laborDisplacement.label}
                description={CATEGORY_INFO.laborDisplacement.description}
                citationsCount={company.citations.length}
                value={company.categoryScores.laborDisplacement}
                max={CATEGORY_MAX.laborDisplacement}
                colorClassName="bg-orange-500"
              />
              <ProgressBar
                label={CATEGORY_INFO.dataPrivacy.label}
                description={CATEGORY_INFO.dataPrivacy.description}
                citationsCount={company.citations.length}
                value={company.categoryScores.dataPrivacy}
                max={CATEGORY_MAX.dataPrivacy}
                colorClassName="bg-sky-500"
              />
              <ProgressBar
                label={CATEGORY_INFO.humanOversight.label}
                description={CATEGORY_INFO.humanOversight.description}
                citationsCount={company.citations.length}
                value={company.categoryScores.humanOversight}
                max={CATEGORY_MAX.humanOversight}
                colorClassName="bg-violet-500"
              />
              <ProgressBar
                label={CATEGORY_INFO.transparency.label}
                description={CATEGORY_INFO.transparency.description}
                citationsCount={company.citations.length}
                value={company.categoryScores.transparency}
                max={CATEGORY_MAX.transparency}
                colorClassName="bg-emerald-500"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              How This Score Was Derived
            </h2>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <p className="text-sm leading-relaxed text-neutral-300">
                The composite score is an additive total out of 100 points: Labor
                Displacement ({company.categoryScores.laborDisplacement}/
                {CATEGORY_MAX.laborDisplacement}), Data Privacy (
                {company.categoryScores.dataPrivacy}/{CATEGORY_MAX.dataPrivacy}),
                Human Oversight ({company.categoryScores.humanOversight}/
                {CATEGORY_MAX.humanOversight}), and Transparency (
                {company.categoryScores.transparency}/{CATEGORY_MAX.transparency}).
                Strongest category right now is {strongestCategory.label} at{" "}
                {normalize(strongestCategory.value, strongestCategory.max)}%, while
                the weakest is {weakestCategory.label} at{" "}
                {normalize(weakestCategory.value, weakestCategory.max)}%.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Metrics below are extracted directly from currently attached source
                citations. If a number is marked as not found, it means the present
                citation set does not yet include a verifiable quantitative figure
                for that factor.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Score Drivers &amp; Metrics
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {categoryTotals.map((category) => (
                <article
                  key={category.label}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-neutral-100">
                      {category.label}
                    </h3>
                    <span className={`text-sm font-semibold tabular-nums ${category.color}`}>
                      {category.value}/{category.max} ({normalize(category.value, category.max)}%)
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs leading-relaxed text-neutral-400">
                    {category.factors.map((factor) => (
                      <li key={factor} className="rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                        {factor}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Source Citations
            </h2>
            {company.citations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-800 p-5 text-sm text-neutral-500">
                No citations sourced yet for this company.
              </p>
            ) : (
              <ul className="space-y-4">
                {company.citations.map((citation) => (
                  <li
                    key={citation.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-300">
                        {citation.category}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {citation.sourceName} · {citation.date}
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-neutral-200">
                      {citation.title}
                    </p>
                    <p className="mb-3 border-l-2 border-neutral-700 pl-3 text-sm italic text-neutral-400">
                      &ldquo;{citation.snippet}&rdquo;
                    </p>
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      View original source ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {activeTab === "causes" && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Causes Profile Summary
            </h2>
            <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${PROFILE_STATUS_STYLES[causeProfile.profileStatus]}`}
                >
                  {toStatusLabel(causeProfile.profileStatus)}
                </span>
                <Link
                  href="/causes"
                  className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
                >
                  Open causes index
                </Link>
              </div>
              <dl className="grid grid-cols-1 gap-2 text-xs text-neutral-300 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Cause score</dt>
                  <dd className="font-medium text-neutral-200">
                    {causeProfile.causeScore === undefined ? "Not published" : `${causeProfile.causeScore}/100`}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Tracked spend in sources</dt>
                  <dd className="font-medium text-neutral-200">{formatCurrency(causeProfile.disclosedSpendUsd)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Top cause category</dt>
                  <dd className="font-medium text-neutral-200">{topCauseCategory?.label ?? "Not identified"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Evidence records</dt>
                  <dd className="font-medium text-neutral-200">{causeProfile.evidenceRecords}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Category Spend Breakdown
            </h2>
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3 text-left font-medium">Cause Category</th>
                    <th className="px-4 py-3 text-right font-medium">Tracked Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {causeCategoryRows.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-900/40">
                      <td className="px-4 py-3 text-xs text-neutral-300">{row.label}</td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">
                        {row.amount === undefined ? "-" : formatCompactCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-800 bg-neutral-900/50">
                    <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      Total Across Category Columns
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-neutral-200">
                      {disclosedCategorySpend > 0 ? formatCurrency(disclosedCategorySpend) : "Not disclosed"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Dashes mean no source-backed amount has been logged for that cause category yet.
            </p>
          </section>
        </>
      )}

      {activeTab === "political" && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Political Profile Summary
            </h2>
            <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${PROFILE_STATUS_STYLES[politicalProfile.profileStatus]}`}
                >
                  {toStatusLabel(politicalProfile.profileStatus)}
                </span>
                <Link
                  href="/politics"
                  className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
                >
                  Open political tracker
                </Link>
              </div>
              <dl className="grid grid-cols-1 gap-2 text-xs text-neutral-300 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Election cycle</dt>
                  <dd className="font-medium text-neutral-200">{politicalProfile.electionCycle ?? "N/A"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Political contributions (PAC)</dt>
                  <dd className="font-medium text-neutral-200">{formatCurrency(politicalProfile.pacContributionsUsd)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Lobbying spend</dt>
                  <dd className="font-medium text-neutral-200">{formatCurrency(politicalProfile.lobbyingSpendUsd)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                  <dt className="text-neutral-500">Lobbying vs PAC</dt>
                  <dd className="font-medium text-neutral-200">
                    {formatRatio(politicalProfile.lobbyingSpendUsd, politicalProfile.pacContributionsUsd)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-3 py-2 sm:col-span-2">
                  <dt className="text-neutral-500">Dem / Rep / 3rd split</dt>
                  <dd className="font-medium text-neutral-200">
                    {`${formatPercent(politicalProfile.democraticPct)} / ${formatPercent(politicalProfile.republicanPct)} / ${formatPercent(politicalProfile.thirdPartyPct)}`}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                PAC totals are federal hard-money contributions and are only one channel of influence.
                They are separate from lobbying expenditures, trade association dues, and other political spend.
              </p>
            </article>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Lobbying Details
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-neutral-100">Issue Focus</h3>
                <p className="mb-3 text-xs leading-relaxed text-neutral-300">
                  {politicalProfile.lobbyingFocusSummary ?? "No lobbying focus summary published yet."}
                </p>
                <p className="text-xs text-neutral-500">
                  Policy area: {politicalProfile.lobbyingPolicyArea ?? "Not categorized"}
                </p>
                {politicalProfile.lobbyingFocusAreas && politicalProfile.lobbyingFocusAreas.length > 0 && (
                  <ul className="mt-3 space-y-2 text-xs text-neutral-300">
                    {politicalProfile.lobbyingFocusAreas.map((area) => (
                      <li key={area} className="rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                        {area}
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-neutral-100">Top Bill Context</h3>
                {politicalProfile.topLobbiedBillUrl ? (
                  <a
                    href={politicalProfile.topLobbiedBillUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    {politicalProfile.topLobbiedBillId
                      ? `${politicalProfile.topLobbiedBillId} - ${politicalProfile.topLobbiedBillTitle ?? "View bill"}`
                      : politicalProfile.topLobbiedBillTitle ?? "View bill"}
                  </a>
                ) : (
                  <p className="text-xs text-neutral-500">No bill link published yet.</p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-neutral-300">
                  {politicalProfile.lobbyingBillSummary ?? "No additional bill context published yet."}
                </p>
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-neutral-100">Spending Trend</h3>
                <dl className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                    <dt>{politicalProfile.electionCycle ?? "Current cycle"}</dt>
                    <dd className="font-medium text-neutral-200">{formatCurrency(politicalProfile.lobbyingSpendUsd)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                    <dt>Prior cycle/year</dt>
                    <dd className="font-medium text-neutral-200">{formatCurrency(politicalProfile.lobbyingSpendPriorYearUsd)}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-neutral-100">Revolving-Door Profile</h3>
                <dl className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                    <dt>
                      Former officials ({politicalProfile.revolvingDoorCurrent?.cycle ?? "current"})
                    </dt>
                    <dd className="font-medium text-neutral-200">
                      {politicalProfile.revolvingDoorCurrent
                        ? `${politicalProfile.revolvingDoorCurrent.formerGovtLobbyists}/${politicalProfile.revolvingDoorCurrent.totalLobbyists}`
                        : "Not disclosed"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2">
                    <dt>
                      Former officials ({politicalProfile.revolvingDoorPrior?.cycle ?? "prior"})
                    </dt>
                    <dd className="font-medium text-neutral-200">
                      {politicalProfile.revolvingDoorPrior
                        ? `${politicalProfile.revolvingDoorPrior.formerGovtLobbyists}/${politicalProfile.revolvingDoorPrior.totalLobbyists}`
                        : "Not disclosed"}
                    </dd>
                  </div>
                </dl>
                {politicalProfile.lobbyingSourceUrl && (
                  <a
                    href={politicalProfile.lobbyingSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs font-medium text-neutral-400 hover:text-neutral-300 hover:underline"
                  >
                    Open lobbying source
                  </a>
                )}
              </article>
            </div>
          </section>
        </>
      )}

      <p className="text-xs text-neutral-600">Last updated {company.lastUpdated}</p>
    </main>
  );
}
