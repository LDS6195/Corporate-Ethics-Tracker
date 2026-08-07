"use client";

import type { Citation } from "@/types/company";

const CATEGORY_STYLES: Record<Citation["category"], string> = {
  "SEC Filing": "bg-sky-950 text-sky-300 ring-1 ring-sky-500/40",
  "WARN Notice": "bg-rose-950 text-rose-300 ring-1 ring-rose-500/40",
  Policy: "bg-violet-950 text-violet-300 ring-1 ring-violet-500/40",
  News: "bg-neutral-800 text-neutral-300 ring-1 ring-neutral-500/40",
};

interface CitationsDrawerProps {
  companyName: string;
  citations: Citation[];
  open: boolean;
  onClose: () => void;
}

export default function CitationsDrawer({
  companyName,
  citations,
  open,
  onClose,
}: CitationsDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Source citations for ${companyName}`}
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">
              Source Citations
            </h2>
            <p className="text-sm text-neutral-500">{companyName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
            aria-label="Close citations drawer"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-4">
          {citations.map((citation) => (
            <li
              key={citation.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${CATEGORY_STYLES[citation.category]}`}
                >
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
      </div>
    </div>
  );
}
