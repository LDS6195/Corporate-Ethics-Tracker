import {
  CAUSE_SCORE_WEIGHTS,
  CAUSE_SIGNAL_TYPES,
  CAUSE_TAXONOMY,
  CONFIDENCE_RULES,
  SOURCE_TIER_DESCRIPTION,
} from "@/lib/causes";

export default function CausesAboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-neutral-800 pb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Methodology Reference
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
          Causes Taxonomy and Scoring Model
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400">
          Reference documentation for how cause data is classified, weighted,
          and quality-scored across company profiles.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
          Scoring Model (V1)
        </h2>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>
            Support Signal: {CAUSE_SCORE_WEIGHTS.supportSignal}% (what the
            company says it supports)
          </li>
          <li>
            Spending Alignment: {CAUSE_SCORE_WEIGHTS.spendingAlignment}% (where
            disclosed dollars actually go)
          </li>
          <li>
            Disclosure Quality: {CAUSE_SCORE_WEIGHTS.disclosureQuality}% (source
            quality, recency, and traceability)
          </li>
          <li>
            Alignment Gap: {CAUSE_SCORE_WEIGHTS.alignmentGap}% (distance between
            public claims and spend reality)
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          Composite scoring is gated: if spending amounts are missing or source
          diversity is too thin, the model should display insufficient data
          rather than a precise score.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
          Cause Taxonomy
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CAUSE_TAXONOMY.map((category) => (
            <article
              key={category.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4"
            >
              <h3 className="text-sm font-semibold text-neutral-100">
                {category.label}
              </h3>
              <p className="mt-1 text-xs text-neutral-400">{category.description}</p>
              {category.subcategories.length > 0 ? (
                <ul className="mt-3 space-y-2 text-xs text-neutral-300">
                  {category.subcategories.map((subcategory) => (
                    <li
                      key={subcategory.id}
                      className="rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2"
                    >
                      <p className="font-medium text-neutral-200">
                        {subcategory.label}
                      </p>
                      <p className="mt-0.5 text-neutral-400">
                        {subcategory.description}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-neutral-500">
                  Reserve for edge cases that do not map cleanly.
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Evidence Signals
          </h2>
          <ul className="space-y-2 text-xs text-neutral-300">
            {CAUSE_SIGNAL_TYPES.map((signal) => (
              <li
                key={signal.id}
                className="rounded border border-neutral-800/80 bg-neutral-950/40 px-2.5 py-2"
              >
                {signal.label}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Source Priority and Confidence
          </h2>
          <div className="space-y-3 text-xs text-neutral-300">
            <div>
              <p className="font-semibold text-neutral-200">Source tiers</p>
              <ul className="mt-1 space-y-1 text-neutral-400">
                {Object.entries(SOURCE_TIER_DESCRIPTION).map(([tier, description]) => (
                  <li key={tier}>
                    {tier}: {description}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-neutral-200">Confidence rules</p>
              <ul className="mt-1 space-y-1 text-neutral-400">
                {Object.entries(CONFIDENCE_RULES).map(([level, rule]) => (
                  <li key={level}>
                    {level}: {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
