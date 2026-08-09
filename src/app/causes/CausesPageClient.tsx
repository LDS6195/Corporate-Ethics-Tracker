"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CompanyAudit } from "@/types/company";
import type {
  CauseCategoryId,
  CompanyCauseProfile,
  CauseProfileStatus,
} from "@/types/causes";
import { compareCompaniesBySp500Rank } from "@/lib/companyRank";
import { CAUSE_TAXONOMY } from "@/lib/causes";
import type { CauseEvidenceSummaryRow } from "@/lib/data/types";
import SortControl, { type SortOption } from "@/components/SortControl";
import SortableHeader from "@/components/SortableHeader";
import { useIsMobileViewport } from "@/lib/useIsMobileViewport";

type ViewMode = "grid" | "list";

type GridSortKey = "sp500Rank" | "spend" | "name";
type ListSortKey = "sp500Rank" | "name" | "industry" | "spend" | "topCause";
type SortDirection = "asc" | "desc";

const GRID_SORT_OPTIONS: SortOption<GridSortKey>[] = [
  { value: "sp500Rank", label: "S&P 500 Rank" },
  { value: "spend", label: "Disclosed Social Impact Spend" },
  { value: "name", label: "Alphabetical" },
];

interface CauseCompanyRow {
  company: CompanyAudit;
  profile: CompanyCauseProfile;
}

interface CausesPageClientProps {
  companies: CompanyAudit[];
  seededProfiles: CompanyCauseProfile[];
  evidenceRows: CauseEvidenceSummaryRow[];
}

const STATUS_STYLES: Record<CauseProfileStatus, string> = {
  "not-started": "text-neutral-300 bg-neutral-800/70 ring-1 ring-neutral-700",
  "in-progress": "text-amber-300 bg-amber-950/50 ring-1 ring-amber-700/40",
  published: "text-emerald-300 bg-emerald-950/50 ring-1 ring-emerald-700/40",
};

function formatCurrency(amount?: number) {
  if (amount === undefined) return "Not disclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategorySpend(profile: CompanyCauseProfile, categoryId: CauseCategoryId) {
  return profile.categorySpendUsd?.[categoryId];
}

function getTotalCategorySpend(profile: CompanyCauseProfile) {
  const values = Object.values(profile.categorySpendUsd ?? {}).filter(
    (amount): amount is number => typeof amount === "number"
  );
  if (values.length === 0) return profile.disclosedSpendUsd;
  return values.reduce((sum, amount) => sum + amount, 0);
}

function getTopCauseLabel(profile: CompanyCauseProfile) {
  if (!profile.topCauseCategoryId) return "Not set";

  return (
    CAUSE_TAXONOMY.find((category) => category.id === profile.topCauseCategoryId)?.label ??
    "Unknown"
  );
}

function getSignalOnlyCountByCompany(
  evidenceRows: CauseEvidenceSummaryRow[],
  companyId: string
) {
  return evidenceRows.filter(
    (row) => row.companyId === companyId && row.amountUsd === undefined
  ).length;
}

function getAmountBackedCountByCompany(
  evidenceRows: CauseEvidenceSummaryRow[],
  companyId: string
) {
  return evidenceRows.filter(
    (row) => row.companyId === companyId && typeof row.amountUsd === "number"
  ).length;
}

function hasSignalWithoutAmount(
  evidenceRows: CauseEvidenceSummaryRow[],
  companyId: string,
  categoryId: CauseCategoryId
) {
  return evidenceRows.some(
    (row) =>
      row.companyId === companyId &&
      row.categoryId === categoryId &&
      row.amountUsd === undefined
  );
}

function toCauseRows(
  companies: CompanyAudit[],
  seededProfiles: CompanyCauseProfile[]
): CauseCompanyRow[] {
  const map = new Map(seededProfiles.map((profile) => [profile.companyId, profile]));

  return companies.map((company) => {
    const seeded = map.get(company.id);
    const fallback: CompanyCauseProfile = {
      companyId: company.id,
      profileStatus: "not-started",
      evidenceRecords: 0,
      highConfidenceRecords: 0,
      lastUpdated: company.lastUpdated,
    };

    return {
      company,
      profile: seeded ?? fallback,
    };
  });
}

export default function CausesPageClient({
  companies,
  seededProfiles,
  evidenceRows,
}: CausesPageClientProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [statusFilter, setStatusFilter] = useState<CauseProfileStatus | "All">("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [gridSortKey, setGridSortKey] = useState<GridSortKey>("sp500Rank");
  const [gridSortDir, setGridSortDir] = useState<SortDirection>("asc");
  const [listSortKey, setListSortKey] = useState<ListSortKey>("sp500Rank");
  const [listSortDir, setListSortDir] = useState<SortDirection>("asc");
  const isMobile = useIsMobileViewport();

  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  const handleListSort = (key: ListSortKey) => {
    if (key === listSortKey) {
      setListSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setListSortKey(key);
      setListSortDir(key === "name" || key === "industry" || key === "topCause" ? "asc" : "desc");
    }
  };

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(companies.map((c) => c.industry)))],
    [companies]
  );

  const rows = useMemo(() => {
    const all = toCauseRows(companies, seededProfiles);
    return all.filter(({ company, profile }) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        company.name.toLowerCase().includes(query) ||
        company.ticker.toLowerCase().includes(query);
      const matchesIndustry = industry === "All" || company.industry === industry;
      const matchesStatus =
        statusFilter === "All" || profile.profileStatus === statusFilter;
      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [companies, seededProfiles, search, industry, statusFilter]);

  const gridRows = useMemo(() => {
    const dir = gridSortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (gridSortKey) {
        case "sp500Rank":
          return dir * compareCompaniesBySp500Rank(a.company, b.company);
        case "spend":
          return dir * ((getTotalCategorySpend(a.profile) ?? -1) - (getTotalCategorySpend(b.profile) ?? -1));
        case "name":
          return dir * a.company.name.localeCompare(b.company.name);
        default:
          return 0;
      }
    });
  }, [rows, gridSortKey, gridSortDir]);

  const listRows = useMemo(() => {
    const dir = listSortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (listSortKey) {
        case "sp500Rank":
          return dir * compareCompaniesBySp500Rank(a.company, b.company);
        case "name":
          return dir * a.company.name.localeCompare(b.company.name);
        case "industry":
          return (
            dir * a.company.industry.localeCompare(b.company.industry) ||
            a.company.name.localeCompare(b.company.name)
          );
        case "spend":
          return dir * ((getTotalCategorySpend(a.profile) ?? -1) - (getTotalCategorySpend(b.profile) ?? -1));
        case "topCause":
          return dir * getTopCauseLabel(a.profile).localeCompare(getTopCauseLabel(b.profile));
        default:
          return 0;
      }
    });
  }, [rows, listSortKey, listSortDir]);

  const causeColumns = useMemo(
    () =>
      CAUSE_TAXONOMY.filter((category) => category.id !== "other-unclassified").map(
        (category) => ({ id: category.id, label: category.label })
      ),
    []
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl">
          Causes and Spending Index
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
          Highlights how much companies contribute to causes, and which
          causes they support. Only includes amounts that are publicly
          disclosed and source-backed. Click a company to see its full
          spending breakdown by cause.
        </p>
      </header>

      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CauseProfileStatus | "All")}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none sm:w-48"
          >
            <option value="All">All profile statuses</option>
            <option value="published">Published</option>
            <option value="in-progress">In progress</option>
            <option value="not-started">Not started</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === "grid" && (
            <SortControl
              options={GRID_SORT_OPTIONS}
              sortKey={gridSortKey}
              sortDir={gridSortDir}
              onSortKeyChange={setGridSortKey}
              onToggleDirection={() => setGridSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            />
          )}
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

      {viewMode === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] uppercase tracking-wide text-neutral-300 md:text-xs">
                <SortableHeader
                  label="#"
                  sortKey="sp500Rank"
                  activeKey={listSortKey}
                  direction={listSortDir}
                  onSort={handleListSort}
                />
                <SortableHeader
                  label="Company"
                  sortKey="name"
                  activeKey={listSortKey}
                  direction={listSortDir}
                  onSort={handleListSort}
                />
                <SortableHeader
                  label="Industry"
                  sortKey="industry"
                  activeKey={listSortKey}
                  direction={listSortDir}
                  onSort={handleListSort}
                />
                <SortableHeader
                  label="Disclosed Social Impact Spend"
                  sortKey="spend"
                  activeKey={listSortKey}
                  direction={listSortDir}
                  onSort={handleListSort}
                  align="right"
                />
                <SortableHeader
                  label="Top Cause"
                  sortKey="topCause"
                  activeKey={listSortKey}
                  direction={listSortDir}
                  onSort={handleListSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {listRows.map(({ company, profile }, index) => {
                const totalDisclosedSpend = getTotalCategorySpend(profile);
                const topCauseLabel = getTopCauseLabel(profile);

                return (
                  <tr key={company.id} className="transition-colors hover:bg-neutral-900/60">
                    <td className="px-4 py-3 text-xs tabular-nums text-neutral-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/company/${company.id}?tab=causes`} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={company.logoUrl}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-100 hover:text-sky-400">
                            {company.name}
                          </p>
                          <p className="truncate text-xs text-neutral-500">{company.ticker}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">{company.industry}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">
                      {formatCurrency(totalDisclosedSpend)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-300">{topCauseLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {gridRows.map(({ company, profile }) => {
            const topCause = getTopCauseLabel(profile);
            const totalDisclosedSpend = getTotalCategorySpend(profile);
            const amountBackedCount = getAmountBackedCountByCompany(evidenceRows, company.id);
            const signalOnlyCategoryCount = causeColumns.filter(
              (category) =>
                getCategorySpend(profile, category.id) === undefined &&
                hasSignalWithoutAmount(evidenceRows, company.id, category.id)
            ).length;
            const signalOnlyCount = getSignalOnlyCountByCompany(evidenceRows, company.id);

            return (
              <article
                key={company.id}
                className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-md"
                    />
                    <div>
                      <Link
                        href={`/company/${company.id}?tab=causes`}
                        className="font-serif text-base font-semibold leading-tight text-neutral-100 hover:text-sky-400 hover:underline"
                      >
                        {company.name}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {company.ticker} · {company.industry}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[profile.profileStatus]
                    }`}
                  >
                    {profile.profileStatus.replace("-", " ")}
                  </span>
                </div>

                <dl className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-neutral-800 bg-neutral-950/30 p-3 text-xs">
                  <div>
                    <dt className="text-neutral-500">Cause score</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">
                      {profile.causeScore ?? "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Disclosed social impact spend</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">
                      {formatCurrency(totalDisclosedSpend)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Evidence records</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">
                      {profile.evidenceRecords}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">High-confidence</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">
                      {profile.highConfidenceRecords}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Amount-backed records</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">{amountBackedCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Signal-only categories</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">
                      {signalOnlyCategoryCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Unpriced signals</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">{signalOnlyCount}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-neutral-500">Top cause</dt>
                    <dd className="mt-0.5 font-medium text-neutral-200">{topCause}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-3">
                  <span className="text-[11px] text-neutral-600">Updated {profile.lastUpdated}</span>
                  <Link
                    href={`/company/${company.id}`}
                    className="rounded-md border border-sky-800/70 px-3 py-1.5 text-xs font-medium text-sky-300 hover:border-sky-600 hover:bg-sky-900/20"
                  >
                    Company profile
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {rows.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          No companies match the current filters.
        </p>
      )}
    </main>
  );
}