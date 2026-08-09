"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CompanyAudit } from "@/types/company";
import type { CompanyCauseProfile } from "@/types/causes";
import type { CompanyPoliticalProfile } from "@/types/politics";
import { OVERALL_SCORE_DESCRIPTION } from "@/lib/scoring";
import ProgressBar from "@/components/ProgressBar";
import Tooltip from "@/components/Tooltip";

const TIER_STYLES: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-500/40",
  medium: "text-amber-400 bg-amber-950/60 ring-1 ring-amber-500/40",
  low: "text-rose-400 bg-rose-950/60 ring-1 ring-rose-500/40",
};

type CompanyDetailTab = "ai" | "causes" | "political";

function parseDetailTab(tab?: string | null): CompanyDetailTab {
  if (tab === "causes" || tab === "political") return tab;
  return "ai";
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

export interface CategoryTotal {
  label: string;
  description: string;
  value: number;
  max: number;
  color: string;
  barColorClassName: string;
  factors: string[];
}

export interface CauseCategoryRow {
  id: string;
  label: string;
  amount?: number;
}

export interface CompanyDetailViewProps {
  company: CompanyAudit;
  causeProfile: CompanyCauseProfile;
  politicalProfile: CompanyPoliticalProfile;
  tier: string;
  categoryTotals: CategoryTotal[];
  strongestCategory: CategoryTotal;
  weakestCategory: CategoryTotal;
  topCauseCategory: { id: string; label: string } | null | undefined;
  causeCategoryRows: CauseCategoryRow[];
  disclosedCategorySpend: number;
}

export default function CompanyDetailView({
  company,
  causeProfile,
  politicalProfile,
  tier,
  categoryTotals,
  strongestCategory,
  weakestCategory,
  topCauseCategory,
  causeCategoryRows,
  disclosedCategorySpend,
}: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState<CompanyDetailTab>("ai");

  // This is a statically-exported site, so the initial tab must be read from
  // the URL on the client after mount rather than via server searchParams.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveTab(parseDetailTab(params.get("tab")));
  }, []);

  function handleTabChange(tab: CompanyDetailTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  }

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
            <span className="mt-2 text-xs text-neutral-400">
              Disclosed spend: {formatCompactCurrency(causeProfile.disclosedSpendUsd ?? disclosedCategorySpend)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Political Profile
            </span>
            <span className="mt-2 text-xs text-neutral-400">
              PAC: {formatCompactCurrency(politicalProfile.pacContributionsUsd)}
            </span>
          </div>
        )}
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 text-xs" role="tablist" aria-label="Company detail tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ai"}
          onClick={() => handleTabChange("ai")}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "ai"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          A.I.
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "causes"}
          onClick={() => handleTabChange("causes")}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "causes"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          Causes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "political"}
          onClick={() => handleTabChange("political")}
          className={`rounded-md border px-3 py-1.5 ${
            activeTab === "political"
              ? "border-sky-800/70 bg-sky-900/20 text-sky-300"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          }`}
        >
          Politics
        </button>
      </nav>

      {activeTab === "ai" && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Category Breakdown
            </h2>
            <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              {categoryTotals.map((category) => (
                <ProgressBar
                  key={category.label}
                  label={category.label}
                  description={category.description}
                  citationsCount={company.citations.length}
                  value={category.value}
                  max={category.max}
                  colorClassName={category.barColorClassName}
                />
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
              How This Score Was Derived
            </h2>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <p className="text-sm leading-relaxed text-neutral-300">
                The composite score is an additive total out of 100 points: Labor
                Displacement ({categoryTotals[0].value}/
                {categoryTotals[0].max}), Data Privacy (
                {categoryTotals[1].value}/{categoryTotals[1].max}),
                Human Oversight ({categoryTotals[2].value}/
                {categoryTotals[2].max}), and Transparency (
                {categoryTotals[3].value}/{categoryTotals[3].max}).
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
              <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
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
              <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
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
                <div className="sm:col-span-2">
                  <dt className="mb-2 text-neutral-500">PAC Contribution Split</dt>
                  <dd className="grid grid-cols-3 gap-2">
                    <div className="flex items-stretch overflow-hidden rounded border border-neutral-800/80 bg-neutral-950/40">
                      <span className="w-1 shrink-0 bg-blue-500" />
                      <div className="flex flex-1 flex-col px-2.5 py-2">
                        <span className="text-[11px] text-neutral-500">Democrat</span>
                        <span className="mt-0.5 font-medium text-neutral-200">{formatPercent(politicalProfile.democraticPct)}</span>
                      </div>
                    </div>
                    <div className="flex items-stretch overflow-hidden rounded border border-neutral-800/80 bg-neutral-950/40">
                      <span className="w-1 shrink-0 bg-red-500" />
                      <div className="flex flex-1 flex-col px-2.5 py-2">
                        <span className="text-[11px] text-neutral-500">Republican</span>
                        <span className="mt-0.5 font-medium text-neutral-200">{formatPercent(politicalProfile.republicanPct)}</span>
                      </div>
                    </div>
                    <div className="flex items-stretch overflow-hidden rounded border border-neutral-800/80 bg-neutral-950/40">
                      <span className="w-1 shrink-0 bg-neutral-500" />
                      <div className="flex flex-1 flex-col px-2.5 py-2">
                        <span className="text-[11px] text-neutral-500">3rd Party</span>
                        <span className="mt-0.5 font-medium text-neutral-200">{formatPercent(politicalProfile.thirdPartyPct)}</span>
                      </div>
                    </div>
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
