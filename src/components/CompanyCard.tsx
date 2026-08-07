"use client";

import { useState } from "react";
import Link from "next/link";
import type { CompanyAudit } from "@/types/company";
import ScoreBadge from "./ScoreBadge";
import CitationsDrawer from "./CitationsDrawer";

interface TagPillProps {
  label: string;
  positive: boolean;
}

function TagPill({ label, positive }: TagPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        positive
          ? "bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-rose-950/60 text-rose-400 ring-1 ring-rose-500/30"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          positive ? "bg-emerald-400" : "bg-rose-400"
        }`}
      />
      {label}
    </span>
  );
}

interface CompanyCardProps {
  company: CompanyAudit;
  /** Optionally overrides `company.overallScore`, e.g. from the weight customizer. */
  displayScore?: number;
}

export default function CompanyCard({
  company,
  displayScore,
}: CompanyCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const score = displayScore ?? company.overallScore;
  const layoffCountMatch = company.citations
    .map((citation) =>
      citation.snippet.match(
        /(?:cut|cuts|cutting|laid off|eliminat(?:e|ed|ing)|layoffs?)\s+(?:about\s+|around\s+|roughly\s+)?([\d,]+)\s+(?:employees|workers|roles|jobs)|([\d,]+)\s+(?:employees|workers|roles|jobs)[^.]{0,80}(?:laid off|eliminations|layoffs|cut)/i
      )
    )
    .find((match) => Boolean(match?.[1] || match?.[2]));
  const fallbackLayoffCount = layoffCountMatch?.[1] ?? layoffCountMatch?.[2] ?? null;
  const structuredLayoffCount =
    typeof company.layoffsTotal === "number"
      ? company.layoffsTotal.toLocaleString()
      : typeof company.aiLayoffEmployees === "number"
        ? company.aiLayoffEmployees.toLocaleString()
        : null;
  const layoffCount = structuredLayoffCount ?? fallbackLayoffCount;
  const dataOptOutAvailable = !company.tosScrapingOptOut;

  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700">
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
              href={`/company/${company.id}`}
              className="font-serif text-base font-semibold leading-tight text-neutral-100 hover:text-sky-400 hover:underline"
            >
              {company.name}
            </Link>
            <p className="text-xs text-neutral-500">
              {company.ticker} · {company.industry}
            </p>
          </div>
        </div>
        <ScoreBadge score={score} />
      </div>

      <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950/30 p-3">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-neutral-500">
          Concrete Indicators
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-neutral-500">Total layoffs (#)</dt>
            <dd className="mt-0.5 font-medium text-neutral-200">
              {layoffCount ?? "Not disclosed"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Sources</dt>
            <dd className="mt-0.5 font-medium text-neutral-200">
              {company.citations.length}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Reskilling funded</dt>
            <dd className="mt-0.5 font-medium text-neutral-200">
              {company.reskillingFunded ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">HITL mandate</dt>
            <dd className="mt-0.5 font-medium text-neutral-200">
              {company.humanInTheLoopMandate ? "Yes" : "No"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">Data opt-out available</dt>
            <dd className="mt-0.5 font-medium text-neutral-200">
              {dataOptOutAvailable ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <TagPill label="AI Layoff Tracked" positive={!company.aiLayoffTracked} />
        <TagPill label="Reskilling Funded" positive={company.reskillingFunded} />
        <TagPill
          label="Human Oversight Mandate"
          positive={company.humanInTheLoopMandate}
        />
        <TagPill
          label="Unrestricted Data Scraping"
          positive={!company.tosScrapingOptOut}
        />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-3">
        <span className="text-[11px] text-neutral-600">
          Updated {company.lastUpdated}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/company/${company.id}`}
            className="rounded-md border border-sky-800/70 px-3 py-1.5 text-xs font-medium text-sky-300 hover:border-sky-600 hover:bg-sky-900/20"
          >
            Score details
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          >
            Sources ({company.citations.length})
          </button>
        </div>
      </div>

      <CitationsDrawer
        companyName={company.name}
        citations={company.citations}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
