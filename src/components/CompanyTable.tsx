"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompanyAudit } from "@/types/company";
import { getSp500Rank } from "@/lib/companyRank";
import {
  OVERALL_SCORE_DESCRIPTION,
  getScoreTier,
} from "@/lib/scoring";
import Tooltip from "./Tooltip";

interface ScoredCompany {
  company: CompanyAudit;
  displayScore: number;
}

type SortKey =
  | "sp500Rank"
  | "name"
  | "industry"
  | "overall"
  | "aiLayoffCount"
  | "workforceSupport"
  | "humanInTheLoopMandate";

type SortDirection = "asc" | "desc";

const TIER_STYLES: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-500/40",
  medium: "text-amber-400 bg-amber-950/60 ring-1 ring-amber-500/40",
  low: "text-rose-400 bg-rose-950/60 ring-1 ring-rose-500/40",
};

function getAiLayoffCount(company: CompanyAudit): number | null {
  if (typeof company.aiLayoffEmployees === "number") return company.aiLayoffEmployees;
  return null;
}

function YesNoPill({ value }: { value: boolean }) {
  return (
    <span
      className={`badge-pill ${
        value
          ? "bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-rose-950/60 text-rose-400 ring-1 ring-rose-500/30"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
  description?: string;
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
  className = "",
  description,
}: SortableHeaderProps) {
  const isActive = sortKey === activeKey;
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={`inline-flex items-center gap-1 hover:text-neutral-200 ${
            isActive ? "text-neutral-200" : ""
          }`}
        >
          {label}
          <span className="text-[10px] leading-none">
            {isActive ? (direction === "asc" ? "▲" : "▼") : ""}
          </span>
        </button>
        {description && (
          <Tooltip content={<p>{description}</p>}>
            <span className="tooltip-indicator" aria-label="More info">
              ?
            </span>
          </Tooltip>
        )}
      </span>
    </th>
  );
}

export default function CompanyTable({ rows }: { rows: ScoredCompany[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sp500Rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "name" || key === "industry" || key === "sp500Rank"
          ? "asc"
          : "desc"
      );
    }
  };

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const withCategories = rows.map(({ company, displayScore }) => ({
      company,
      displayScore,
      sp500Rank: getSp500Rank(company),
      aiLayoffCount: getAiLayoffCount(company),
      workforceSupport: company.reskillingFunded,
      humanInTheLoopMandate: company.humanInTheLoopMandate,
    }));

    return withCategories.sort((a, b) => {
      switch (sortKey) {
        case "sp500Rank":
          return dir * (a.sp500Rank - b.sp500Rank);
        case "name":
          return dir * a.company.name.localeCompare(b.company.name);
        case "industry":
          return dir * a.company.industry.localeCompare(b.company.industry);
        case "overall":
          return dir * (a.displayScore - b.displayScore);
        case "aiLayoffCount":
          return dir * ((a.aiLayoffCount ?? -1) - (b.aiLayoffCount ?? -1));
        case "workforceSupport":
          return dir * (Number(a.workforceSupport) - Number(b.workforceSupport));
        case "humanInTheLoopMandate":
          return (
            dir *
            (Number(a.humanInTheLoopMandate) - Number(b.humanInTheLoopMandate))
          );
        default:
          return 0;
      }
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full min-w-[740px] border-collapse text-sm md:min-w-[860px]">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] uppercase tracking-wide text-neutral-300 md:text-xs">
            <SortableHeader
              label="S&P 500"
              sortKey="sp500Rank"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="right"
              description="S&P 500 rank for ordering; defaults to 500 when unavailable."
            />
            <SortableHeader
              label="Company"
              sortKey="name"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Industry"
              sortKey="industry"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Score"
              sortKey="overall"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="right"
              description={OVERALL_SCORE_DESCRIPTION}
            />
            <SortableHeader
              label="AI Layoffs (#)"
              sortKey="aiLayoffCount"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="right"
              description="Cumulative AI-attributed layoffs from tracked public layoff disclosures."
            />
            <SortableHeader
              label="Workforce Support"
              sortKey="workforceSupport"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="right"
              description="Whether the company discloses funded worker reskilling or upskilling support tied to AI or broader digital transition."
            />
            <SortableHeader
              label="Human Review"
              sortKey="humanInTheLoopMandate"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="right"
              description="Whether high-stakes AI decisions are stated to require human review."
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {sorted.map((row) => (
            <tr
              key={row.company.id}
              className="data-row transition-colors"
            >
              <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-400 sm:font-mono">
                {row.sp500Rank}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/company/${row.company.id}`}
                  className="flex items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.company.logoUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-100 hover:text-sky-400">
                      {row.company.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500 sm:font-mono">
                      {row.company.ticker}
                    </p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">
                {row.company.industry}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`badge-pill tabular-nums ${
                    TIER_STYLES[getScoreTier(row.displayScore)]
                  }`}
                >
                  {row.displayScore}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-neutral-300 sm:font-mono">
                {row.aiLayoffCount === null
                  ? "Not disclosed"
                  : row.aiLayoffCount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <YesNoPill value={row.workforceSupport} />
              </td>
              <td className="px-4 py-3 text-right">
                <YesNoPill value={row.humanInTheLoopMandate} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
