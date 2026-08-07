"use client";

import { useMemo, useState } from "react";
import type { CompanyAudit } from "@/types/company";
import { compareCompaniesBySp500Rank } from "@/lib/companyRank";
import {
  computeWeightedScore,
  DEFAULT_WEIGHTS,
  type CategoryWeights,
} from "@/lib/scoring";
import CompanyCard from "@/components/CompanyCard";
import CompanyTable from "@/components/CompanyTable";
import WeightSliders from "@/components/WeightSliders";

type ViewMode = "grid" | "list";

interface HomePageClientProps {
  companies: CompanyAudit[];
}

export default function HomePageClient({ companies }: HomePageClientProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [weights, setWeights] = useState<CategoryWeights>(DEFAULT_WEIGHTS);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(companies.map((c) => c.industry)))],
    [companies]
  );

  const scoredCompanies = useMemo(
    () =>
      companies
        .map((company) => ({
          company,
          displayScore: computeWeightedScore(company.categoryScores, weights),
        }))
        .filter(({ company }) => {
          const matchesSearch =
            search.trim() === "" ||
            company.name.toLowerCase().includes(search.trim().toLowerCase()) ||
            company.ticker.toLowerCase().includes(search.trim().toLowerCase());
          const matchesIndustry =
            industry === "All" || company.industry === industry;
          return matchesSearch && matchesIndustry;
        })
        .sort((a, b) => compareCompaniesBySp500Rank(a.company, b.company)),
    [companies, search, industry, weights]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="intro-reveal mb-12 border-b border-neutral-800 pb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
          Independent Corporate Research
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl">
          Corporate AI Accountability Index
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
          Tracking how the world&rsquo;s largest companies disclose, govern,
          and answer for their use of artificial intelligence &mdash; labor
          impact, data privacy, human oversight, and transparency, sourced
          directly from SEC filings, WARN notices, and public policy.
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-neutral-500">
          The index view prioritizes concrete indicators (counts and yes/no
          disclosures). Open any company profile for full score methodology and
          factor-by-factor breakdown.
        </p>
      </header>

      <section className="mb-8">
        <WeightSliders
          weights={weights}
          onChange={setWeights}
          onReset={() => setWeights(DEFAULT_WEIGHTS)}
        />
      </section>

      <section className="mb-6 flex flex-col gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticker or company name..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none sm:max-w-xs"
          />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none sm:w-56"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-md border border-neutral-800 bg-neutral-900 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </section>

      {viewMode === "grid" ? (
        <section
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          aria-live="polite"
        >
          {scoredCompanies.map(({ company, displayScore }) => (
            <CompanyCard
              key={company.id}
              company={company}
              displayScore={displayScore}
            />
          ))}
        </section>
      ) : (
        <CompanyTable rows={scoredCompanies} />
      )}

      {scoredCompanies.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          No companies match the current filters.
        </p>
      )}
    </main>
  );
}