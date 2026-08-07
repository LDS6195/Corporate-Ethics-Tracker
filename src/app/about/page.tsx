import {
  CAUSE_SCORE_WEIGHTS,
  CAUSE_SIGNAL_TYPES,
  CAUSE_TAXONOMY,
} from "@/lib/causes";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-neutral-800 pb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Independent Corporate Research
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
          About This Project
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400">
          This project tracks corporate accountability across three related lenses:
          AI governance, causes and spending, and political activity.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
          What Each Page Means
        </h2>
        <ul className="space-y-3 text-sm text-neutral-300">
          <li>
            <span className="font-semibold text-neutral-100">AI Policy Index:</span>{" "}
            Composite score from labor displacement, data privacy, human oversight,
            and transparency signals in cited sources.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Causes and Spending:</span>{" "}
            Cause-category mapping of support signals and disclosed dollars. Some
            cells may show signal-only evidence when a source confirms activity but
            does not disclose a verifiable amount.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Political Activity:</span>{" "}
            Federal PAC contributions, partisan split, lobbying spend, and policy
            focus context. PAC totals are only one influence channel and should be
            read alongside lobbying and association activity.
          </li>
        </ul>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
          Why Data Can Look Sparse
        </h2>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>Many companies publish initiative narratives without category-level dollar amounts.</li>
          <li>Reported amounts can be delayed, partial, or mixed across entities and years.</li>
          <li>The project only surfaces numeric values when they are source-backed and attributable.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Methodology and Taxonomy
            <span
              aria-hidden="true"
              className="inline-flex text-neutral-500 transition-transform group-open:rotate-90"
            >
              <svg
                viewBox="0 0 12 12"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2.5 8 6 4 9.5" />
              </svg>
            </span>
          </summary>
          <div className="mt-4 space-y-4 rounded-lg border border-neutral-800/80 bg-neutral-950/30 p-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                Scoring Weights
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                <li>Support Signal: {CAUSE_SCORE_WEIGHTS.supportSignal}%</li>
                <li>Spending Alignment: {CAUSE_SCORE_WEIGHTS.spendingAlignment}%</li>
                <li>Disclosure Quality: {CAUSE_SCORE_WEIGHTS.disclosureQuality}%</li>
                <li>Alignment Gap: {CAUSE_SCORE_WEIGHTS.alignmentGap}%</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                Evidence Signal Types
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {CAUSE_SIGNAL_TYPES.map((signal) => (
                  <span
                    key={signal.id}
                    className="rounded-md border border-neutral-700 bg-neutral-900/60 px-2 py-1 text-xs text-neutral-300"
                  >
                    {signal.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                Cause Taxonomy
              </h3>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-neutral-300 sm:grid-cols-2">
                {CAUSE_TAXONOMY.map((category) => (
                  <li
                    key={category.id}
                    className="rounded border border-neutral-800 bg-neutral-900/40 px-2.5 py-2"
                  >
                    <p className="font-medium text-neutral-200">{category.label}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{category.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </section>
    </main>
  );
}
