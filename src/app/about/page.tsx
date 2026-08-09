import { CAUSE_TAXONOMY } from "@/lib/causes";
import { CATEGORY_MAX } from "@/lib/scoring";
import {
  getCauseProfiles,
  getCompanies,
  getPoliticalProfiles,
} from "@/lib/data/repository";

// Dates are plain "YYYY-MM-DD" strings, so string comparison sorts correctly.
function getLatestDate(dates: string[]): string | null {
  return dates.reduce<string | null>((latest, date) => {
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
}

export default async function AboutPage() {
  const [companies, causeProfiles, politicalProfiles] = await Promise.all([
    getCompanies(),
    getCauseProfiles(),
    getPoliticalProfiles(),
  ]);

  const lastRefreshed = getLatestDate([
    ...companies.map((c) => c.lastUpdated),
    ...causeProfiles.map((p) => p.lastUpdated),
    ...politicalProfiles.map((p) => p.lastUpdated),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
          About This Project
        </h1>
      </header>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <p className="mb-4 text-sm leading-relaxed text-neutral-200">
          This project tracks what big companies actually do, not just what they
          say. It pulls from public sources like company filings, disclosures, and
          news coverage to build a clearer picture of corporate behavior. The goal
          is simple: help people stay informed, so they can make their own
          decisions.
        </p>
        <ul className="space-y-3 text-sm text-neutral-300">
          <li>
            <span className="font-semibold text-neutral-100">AI:</span>{" "}
            How companies are handling AI, including job impact, oversight of AI
            decisions, and what they do with your data.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Causes and Spending:</span>{" "}
            What causes and communities companies say they support, and how much
            they actually spend backing that up.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Political Activity:</span>{" "}
            Where companies send political money, including PAC (political action
            committee) contributions, lobbying spend, and which political party
            gets the most support.
          </li>
        </ul>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
          AI Accountability Score Formula
        </h2>
        <p className="mb-3 rounded-lg border border-neutral-800/80 bg-neutral-950/40 px-3 py-2 font-mono text-xs text-neutral-300">
          Accountability Score = Labor Displacement ({CATEGORY_MAX.laborDisplacement}) + Data Privacy (
          {CATEGORY_MAX.dataPrivacy}) + Human Oversight ({CATEGORY_MAX.humanOversight}) +
          Transparency ({CATEGORY_MAX.transparency})
        </p>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>
            <span className="font-semibold text-neutral-100">Labor Displacement:</span>{" "}
            job losses tied to AI, and support offered to affected workers.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Data Privacy:</span>{" "}
            how responsibly they handle your data.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Human Oversight:</span>{" "}
            whether a human reviews high-stakes AI decisions.
          </li>
          <li>
            <span className="font-semibold text-neutral-100">Transparency:</span>{" "}
            how much they publicly disclose about their AI use.
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          A higher Accountability Score reflects stronger evidence across these four
          categories; a lower score reflects weaker or unverified evidence, not a
          value judgment about the company itself. You can adjust the weight of
          each category yourself using the sliders on the main page.
        </p>
      </section>

      {lastRefreshed && (
        <p className="mb-8 text-xs text-neutral-600">Data last refreshed {lastRefreshed}</p>
      )}

      <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-300">
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
            Where the Data Comes From
          </summary>
          <ul className="mt-4 space-y-3 rounded-lg border border-neutral-800/80 bg-neutral-950/30 p-4 text-sm text-neutral-300">
            <li>
              <a
                href="https://www.sec.gov/edgar/search/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                SEC filings
              </a>{" "}
              (10-Ks, 8-Ks, proxy statements): workforce counts, layoff disclosures,
              and AI risk language behind the AI Score.
            </li>
            <li>
              <a
                href="https://www.dol.gov/agencies/eta/layoffs/warn"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                WARN Act
              </a>{" "}
              layoff notices: state-level filings companies submit before mass
              layoffs, used to verify layoff counts and dates.
            </li>
            <li>
              <a
                href="https://www.fec.gov/data/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                FEC
              </a>{" "}
              and{" "}
              <a
                href="https://www.opensecrets.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                OpenSecrets
              </a>{" "}
              records: PAC contributions, lobbying spend, and partisan split shown
              on the Political Activity page.
            </li>
            <li>
              <span className="font-medium text-neutral-200">Company ESG/CSR reports and public statements:</span>{" "}
              cause spending and category mapping shown on the Causes and Spending
              page.
            </li>
            <li>
              <span className="font-medium text-neutral-200">Credible news coverage:</span>{" "}
              fills gaps when none of the above is available.
            </li>
          </ul>
        </details>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-300">
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
            Taxonomy
          </summary>
          <ul className="mt-4 grid grid-cols-1 gap-2 rounded-lg border border-neutral-800/80 bg-neutral-950/30 p-4 text-sm text-neutral-300 sm:grid-cols-2">
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
        </details>
      </section>
    </main>
  );
}
