"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CompanyAudit } from "@/types/company";
import type { CompanyPoliticalProfile } from "@/types/politics";
import { compareCompaniesBySp500Rank } from "@/lib/companyRank";
import SortControl, { type SortOption } from "@/components/SortControl";
import SortableHeader from "@/components/SortableHeader";
import { useIsMobileViewport } from "@/lib/useIsMobileViewport";

type ViewMode = "grid" | "list";

type GridSortKey =
  | "sp500Rank"
  | "pacContributions"
  | "democraticPct"
  | "republicanPct"
  | "thirdPartyPct"
  | "lobbyingSpend"
  | "name";
type ListSortKey =
  | "sp500Rank"
  | "name"
  | "industry"
  | "electionCycle"
  | "pacContributions"
  | "democraticPct"
  | "republicanPct"
  | "thirdPartyPct"
  | "lobbyingSpend"
  | "tradeAssociationRisk";
type SortDirection = "asc" | "desc";

const GRID_SORT_OPTIONS: SortOption<GridSortKey>[] = [
  { value: "sp500Rank", label: "S&P 500" },
  { value: "pacContributions", label: "Political Contributions (PAC)" },
  { value: "democraticPct", label: "Democrat" },
  { value: "republicanPct", label: "Republican" },
  { value: "thirdPartyPct", label: "Third Party" },
  { value: "lobbyingSpend", label: "Lobbying Spend" },
  { value: "name", label: "Alphabetical" },
];

interface PoliticalCompanyRow {
  company: CompanyAudit;
  profile: CompanyPoliticalProfile;
}

interface PoliticsPageClientProps {
  companies: CompanyAudit[];
  seededProfiles: CompanyPoliticalProfile[];
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "Not disclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value?: number | null) {
  if (value == null) return "-";
  return `${value.toFixed(1)}%`;
}

function toRows(
  companies: CompanyAudit[],
  seededProfiles: CompanyPoliticalProfile[]
): PoliticalCompanyRow[] {
  const map = new Map(seededProfiles.map((profile) => [profile.companyId, profile]));

  return companies.map((company) => {
    const seeded = map.get(company.id);
    const fallback: CompanyPoliticalProfile = {
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

export default function PoliticsPageClient({
  companies,
  seededProfiles,
}: PoliticsPageClientProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
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
      setListSortDir(key === "name" || key === "industry" || key === "electionCycle" ? "asc" : "desc");
    }
  };

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(companies.map((c) => c.industry)))],
    [companies]
  );

  const rows = useMemo(() => {
    const all = toRows(companies, seededProfiles);
    return all.filter(({ company }) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        company.name.toLowerCase().includes(query) ||
        company.ticker.toLowerCase().includes(query);
      const matchesIndustry = industry === "All" || company.industry === industry;
      return matchesSearch && matchesIndustry;
    });
  }, [companies, seededProfiles, search, industry]);

  const gridRows = useMemo(() => {
    const dir = gridSortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (gridSortKey) {
        case "sp500Rank":
          return dir * compareCompaniesBySp500Rank(a.company, b.company);
        case "pacContributions":
          return dir * ((a.profile.pacContributionsUsd ?? -1) - (b.profile.pacContributionsUsd ?? -1));
        case "democraticPct":
          return dir * ((a.profile.democraticPct ?? -1) - (b.profile.democraticPct ?? -1));
        case "republicanPct":
          return dir * ((a.profile.republicanPct ?? -1) - (b.profile.republicanPct ?? -1));
        case "thirdPartyPct":
          return dir * ((a.profile.thirdPartyPct ?? -1) - (b.profile.thirdPartyPct ?? -1));
        case "lobbyingSpend":
          return dir * ((a.profile.lobbyingSpendUsd ?? -1) - (b.profile.lobbyingSpendUsd ?? -1));
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
        case "electionCycle":
          return dir * (a.profile.electionCycle ?? "").localeCompare(b.profile.electionCycle ?? "");
        case "pacContributions":
          return dir * ((a.profile.pacContributionsUsd ?? -1) - (b.profile.pacContributionsUsd ?? -1));
        case "democraticPct":
          return dir * ((a.profile.democraticPct ?? -1) - (b.profile.democraticPct ?? -1));
        case "republicanPct":
          return dir * ((a.profile.republicanPct ?? -1) - (b.profile.republicanPct ?? -1));
        case "thirdPartyPct":
          return dir * ((a.profile.thirdPartyPct ?? -1) - (b.profile.thirdPartyPct ?? -1));
        case "lobbyingSpend":
          return dir * ((a.profile.lobbyingSpendUsd ?? -1) - (b.profile.lobbyingSpendUsd ?? -1));
        case "tradeAssociationRisk": {
          const toRank = (flag?: boolean) => (flag === undefined ? -1 : Number(flag));
          return dir * (toRank(a.profile.tradeAssociationRiskFlag) - toRank(b.profile.tradeAssociationRiskFlag));
        }
        default:
          return 0;
      }
    });
  }, [rows, listSortKey, listSortDir]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl">
          Political Activity Tracker
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
          Follows corporate political spending, including contributions to
          PACs (political action committees), partisan split, lobbying spend,
          and trade association activity. Each is reported separately, since
          they&rsquo;re distinct by law. Click a company to see its full
          political profile.
        </p>
      </header>

      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                {ind === "All" ? "All Industries" : ind}
              </option>
            ))}
          </select>
        </div>
        {viewMode === "grid" && (
          <SortControl
            options={GRID_SORT_OPTIONS}
            sortKey={gridSortKey}
            sortDir={gridSortDir}
            onSortKeyChange={setGridSortKey}
            onToggleDirection={() => setGridSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          />
        )}
      </section>

      <section className="mb-6 flex items-center">
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
      </section>

      {viewMode === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] uppercase tracking-wide text-neutral-300 md:text-xs">
                <SortableHeader label="#" sortKey="sp500Rank" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} />
                <SortableHeader label="Company" sortKey="name" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} />
                <SortableHeader label="Industry" sortKey="industry" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} />
                <SortableHeader label="Election Cycle" sortKey="electionCycle" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="Political Contributions (PAC)" sortKey="pacContributions" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="Dem %" sortKey="democraticPct" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="Rep %" sortKey="republicanPct" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="3rd/Other %" sortKey="thirdPartyPct" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="Lobbying Spend" sortKey="lobbyingSpend" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
                <SortableHeader label="Trade Assn Risk" sortKey="tradeAssociationRisk" activeKey={listSortKey} direction={listSortDir} onSort={handleListSort} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {listRows.map(({ company, profile }, index) => (
                <tr key={company.id} className="transition-colors hover:bg-neutral-900/60">
                  <td className="px-4 py-3 text-xs tabular-nums text-neutral-600">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${company.id}?tab=political`} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={company.logoUrl} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-100 hover:text-sky-400">{company.name}</p>
                        <p className="truncate text-xs text-neutral-500">{company.ticker}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{company.industry}</td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-300">{profile.electionCycle ?? "N/A"}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">{formatCurrency(profile.pacContributionsUsd)}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">{formatPercent(profile.democraticPct)}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">{formatPercent(profile.republicanPct)}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">{formatPercent(profile.thirdPartyPct)}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300">{formatCurrency(profile.lobbyingSpendUsd)}</td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-300">{profile.tradeAssociationRiskFlag === undefined ? "Unknown" : profile.tradeAssociationRiskFlag ? "Flagged" : "Not flagged"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {gridRows.map(({ company, profile }) => (
            <article key={company.id} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={company.logoUrl} alt={`${company.name} logo`} width={40} height={40} className="h-10 w-10 rounded-md" />
                  <div>
                    <Link href={`/company/${company.id}?tab=political`} className="font-serif text-base font-semibold leading-tight text-neutral-100 hover:text-sky-400 hover:underline">
                      {company.name}
                    </Link>
                    <p className="text-xs text-neutral-500">{company.ticker} · {company.industry}</p>
                  </div>
                </div>
              </div>

              <dl className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-neutral-800 bg-neutral-950/30 p-3 text-xs">
                <div>
                  <dt className="text-neutral-500">Election cycle</dt>
                  <dd className="mt-0.5 font-medium text-neutral-200">{profile.electionCycle ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Political contributions (PAC)</dt>
                  <dd className="mt-0.5 font-medium text-neutral-200">{formatCurrency(profile.pacContributionsUsd)}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Dem/Rep split</dt>
                  <dd className="mt-0.5 font-medium text-neutral-200">{`${formatPercent(profile.democraticPct)} / ${formatPercent(profile.republicanPct)}`}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Lobbying spend</dt>
                  <dd className="mt-0.5 font-medium text-neutral-200">{formatCurrency(profile.lobbyingSpendUsd)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-neutral-500">Trade association risk</dt>
                  <dd className="mt-0.5 font-medium text-neutral-200">{profile.tradeAssociationRiskFlag === undefined ? "Unknown" : profile.tradeAssociationRiskFlag ? "Flagged" : "Not flagged"}</dd>
                </div>
              </dl>

              <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-[11px] text-neutral-600">Updated {profile.lastUpdated}</span>
                <span className="text-xs text-neutral-400">Evidence: {profile.evidenceRecords}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      {rows.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">No companies match the current filters.</p>
      )}
    </main>
  );
}