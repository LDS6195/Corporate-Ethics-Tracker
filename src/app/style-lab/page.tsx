"use client";

import { useState } from "react";

type StyleId = "poster" | "signal" | "catalog";

const SAMPLE_ROWS = [
  {
    name: "Microsoft",
    industry: "Software",
    score: 54,
    layoffs: "4,800",
    review: "Yes",
  },
  {
    name: "Amazon",
    industry: "E-commerce",
    score: 49,
    layoffs: "Not disclosed",
    review: "No",
  },
  {
    name: "Visa",
    industry: "Payments",
    score: 59,
    layoffs: "Not disclosed",
    review: "Yes",
  },
];

const STYLE_OPTIONS: Array<{ id: StyleId; name: string; blurb: string }> = [
  {
    id: "poster",
    name: "Poster Storm",
    blurb: "High-contrast editorial poster language with dramatic blocks and angled rhythm.",
  },
  {
    id: "signal",
    name: "Signal Metro",
    blurb: "Transit-map-inspired operational layout with connected stops and compact status chips.",
  },
  {
    id: "catalog",
    name: "Civic Catalog",
    blurb: "Museum-style evidence catalog with tags, specimen cards, and layered paper surfaces.",
  },
];

function PosterStorm() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-rose-900/50 bg-[radial-gradient(circle_at_15%_15%,#4a1919_0,#201010_45%,#140d0d_100%)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.4)] sm:p-7">
      <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rotate-12 rounded-3xl border border-amber-300/30 bg-amber-200/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full border border-rose-300/20 bg-rose-200/10 blur-sm" />

      <div className="mb-5 grid gap-3 border-b border-rose-200/20 pb-4 lg:grid-cols-[0.7fr_1.3fr]">
        <p className="inline-flex w-fit items-center rounded-full border border-rose-200/30 bg-rose-100/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose-100">
          Special Edition
        </p>
        <h2 className="font-serif text-4xl leading-tight text-rose-50 sm:text-5xl">
          Accountability Index as an Editorial Poster
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border border-rose-200/30 bg-[#2b1515]/85 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-rose-200/80">Frontline Story</p>
          <h3 className="mt-2 font-serif text-2xl text-rose-50 sm:text-3xl">
            Top performers pair disclosure depth with stronger human-review commitments
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rose-100/85">
            Same content model, but framed as a public brief with dramatic hierarchy and expressive
            contrast. It is intentionally bold without changing your app behavior.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SAMPLE_ROWS.map((row, index) => (
              <div
                key={row.name}
                className={`rounded-xl border p-3 text-rose-50 ${
                  index % 2 === 0
                    ? "-rotate-[0.8deg] border-rose-200/35 bg-[#341919]"
                    : "rotate-[0.7deg] border-amber-200/35 bg-[#3f2319]"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-rose-200/75">{row.industry}</p>
                <p className="mt-1 text-lg font-semibold">{row.name}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded border border-rose-200/25 bg-black/20 px-2 py-1">
                    <p className="text-rose-200/80">Score</p>
                    <p className="text-sm font-semibold">{row.score}</p>
                  </div>
                  <div className="rounded border border-rose-200/25 bg-black/20 px-2 py-1">
                    <p className="text-rose-200/80">Layoffs</p>
                    <p className="text-sm font-semibold">{row.layoffs}</p>
                  </div>
                  <div className="rounded border border-rose-200/25 bg-black/20 px-2 py-1">
                    <p className="text-rose-200/80">Review</p>
                    <p className="text-sm font-semibold">{row.review}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-amber-200/30 bg-[#40261a]/90 p-4 text-amber-50">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-100/70">Pulse</p>
            <p className="mt-1 text-4xl font-semibold">59</p>
            <p className="text-sm text-amber-100/80">Highest current score in sample</p>
          </div>
          <div className="rounded-2xl border border-rose-200/30 bg-[#2a1515]/90 p-4 text-rose-50">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-100/70">Tension Note</p>
            <p className="mt-2 text-sm leading-relaxed text-rose-100/85">
              Big headline style for legibility, with small tactical cards to preserve scanning speed.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200/30 bg-[#1d1010]/90 p-4 text-rose-50">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-100/70">Motion Cue</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-300/20">
              <div className="h-full w-2/3 rounded-full bg-rose-300/70 transition-all duration-1000" />
            </div>
            <p className="mt-2 text-xs text-rose-100/80">Progress bars can animate in on load for drama.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SignalMetro() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-900/50 bg-[linear-gradient(140deg,#081b16_0%,#0d2820_45%,#061510_100%)] p-5 shadow-[0_20px_55px_rgba(2,23,18,0.55)] sm:p-7">
      <div className="pointer-events-none absolute inset-y-0 left-8 hidden w-px bg-emerald-300/25 lg:block" />
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-200/5 p-3">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-emerald-50">Signal Metro</h2>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-200/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-100">
          Route Live
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-3">
          {["Disclosure", "Workforce", "Human Review"].map((lane, index) => (
            <div key={lane} className="relative rounded-2xl border border-emerald-300/25 bg-black/20 p-3">
              <div className="absolute -left-2 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-emerald-200/40 bg-emerald-300/30 lg:block" />
              <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-200/75">Stop {index + 1}</p>
              <p className="mt-1 text-lg font-semibold text-emerald-50">{lane}</p>
              <p className="text-sm text-emerald-100/80">Monitoring route quality and evidence consistency.</p>
            </div>
          ))}
        </aside>

        <article className="rounded-2xl border border-emerald-300/25 bg-black/20 p-4">
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-100/5 p-2 text-emerald-50">
              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-200/70">Median Score</p>
              <p className="text-2xl font-semibold">55</p>
            </div>
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-100/5 p-2 text-emerald-50">
              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-200/70">Review Coverage</p>
              <p className="text-2xl font-semibold">2 / 3</p>
            </div>
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-100/5 p-2 text-emerald-50">
              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-200/70">Disclosed Layoffs</p>
              <p className="text-2xl font-semibold">1</p>
            </div>
          </div>

          <div className="grid gap-2">
            {SAMPLE_ROWS.map((row) => (
              <div
                key={row.name}
                className="grid gap-2 rounded-xl border border-emerald-300/20 bg-emerald-100/5 p-3 text-sm text-emerald-50 sm:grid-cols-[1.4fr_0.6fr_1fr_0.7fr]"
              >
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-emerald-200/75">{row.industry}</p>
                </div>
                <p className="sm:text-right">Score {row.score}</p>
                <p className="sm:text-right">Layoffs {row.layoffs}</p>
                <p className="sm:text-right">Review {row.review}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function CivicCatalog() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-stone-700/60 bg-[linear-gradient(120deg,#161311_0%,#211c16_45%,#15110e_100%)] p-5 shadow-[0_20px_55px_rgba(10,8,6,0.45)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(245,158,11,0.15),transparent_38%)]" />

      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70">Open Collection</p>
          <h2 className="font-serif text-3xl text-stone-100 sm:text-4xl">Civic Catalog</h2>
        </div>
        <span className="rounded-full border border-amber-600/50 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
          Exhibit A-01
        </span>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-stone-600/60 bg-[#2a241e]/80 p-4">
          <h3 className="font-serif text-xl text-stone-100">Specimen Cards</h3>
          <p className="mt-1 text-sm text-stone-300">
            Neutral paper palette, stronger typographic labels, and archive-style tags for an intentional
            non-dashboard identity.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {SAMPLE_ROWS.map((row) => (
              <div key={row.name} className="rounded-xl border border-stone-500/60 bg-[#1e1a16] p-3 text-stone-100">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">{row.industry}</p>
                <p className="mt-1 text-lg font-semibold">{row.name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md border border-amber-500/50 bg-amber-300/10 px-2 py-1 text-amber-100">
                    Score {row.score}
                  </span>
                  <span className="rounded-md border border-stone-400/45 bg-stone-300/10 px-2 py-1 text-stone-200">
                    Layoffs {row.layoffs}
                  </span>
                  <span className="rounded-md border border-amber-500/50 bg-amber-300/10 px-2 py-1 text-amber-100">
                    Review {row.review}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-stone-600/60 bg-[#2a241e]/80 p-4 text-stone-100">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Index Label</p>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between border-b border-stone-600/50 pb-1">
                <dt className="text-stone-300">Collection</dt>
                <dd>AI Signals</dd>
              </div>
              <div className="flex items-center justify-between border-b border-stone-600/50 pb-1">
                <dt className="text-stone-300">Curated</dt>
                <dd>Aug 2026</dd>
              </div>
              <div className="flex items-center justify-between pb-1">
                <dt className="text-stone-300">Items</dt>
                <dd>3</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-stone-600/60 bg-[#2a241e]/80 p-4 text-stone-100">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Section Tabs</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md border border-amber-500/50 bg-amber-300/10 px-2 py-1 text-amber-100">AI</span>
              <span className="rounded-md border border-stone-500/60 bg-stone-300/10 px-2 py-1 text-stone-200">Causes</span>
              <span className="rounded-md border border-stone-500/60 bg-stone-300/10 px-2 py-1 text-stone-200">Political</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function StyleLabPage() {
  const [activeStyleId, setActiveStyleId] = useState<StyleId>("poster");

  const activeStyle = STYLE_OPTIONS.find((style) => style.id === activeStyleId) ?? STYLE_OPTIONS[0];

  const renderPrototype = () => {
    if (activeStyleId === "signal") return <SignalMetro />;
    if (activeStyleId === "catalog") return <CivicCatalog />;
    return <PosterStorm />;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">UI Lab Prototype</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-neutral-100">Out-of-Box Theme And Layout Exploration</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-300">
          The interactions stay simple and familiar, but each direction pushes a much more extreme visual
          language, composition, and atmosphere.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setActiveStyleId(style.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                style.id === activeStyleId
                  ? "border-sky-600 bg-sky-900/20 text-sky-300"
                  : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-500">{activeStyle.blurb}</p>
      </header>

      {renderPrototype()}
    </main>
  );
}
