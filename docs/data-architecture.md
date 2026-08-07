# Data architecture

The app now reads through a repository seam in [src/lib/data/repository.ts](src/lib/data/repository.ts), even though the active backend is still local JSON. That keeps the page layer stable when data moves to a hosted store.

## Recommended next backend

Use Supabase first.

- It is a better fit than Airtable for public, query-heavy reads.
- It gives you Postgres, SQL views, row-level security, and a REST/JS client on the free tier.
- Airtable is usable for editorial workflows, but it becomes awkward for relational evidence data, public traffic, and metric joins.

Use Airtable only if the main priority is manual non-technical editing and the public app remains small.

## Free-tier reality

Supabase can support this POC for free if the app stays read-heavy and modest in traffic.

- Good fit: tens of companies, low-write ingestion, public reads cached by Next.js.
- Watch-outs: database size, egress, and inactivity limits on free plans.
- Best practice: keep ingestion server-side and cache public pages.

Airtable also has a free tier, but record limits and API rate limits will become the constraint sooner than with Supabase.

## Migration shape

Keep the current UI contracts and migrate the storage layer underneath them.

1. Move current JSON seed files into Postgres tables.
2. Replace the JSON repository implementation with a Supabase-backed repository.
3. Keep public reads server-side where possible.
4. Add ingestion scripts that upsert evidence rows quarterly.

## Current dataset mapping

- `companies.json` -> `companies`, `company_citations`
- `causeProfiles.json` -> `cause_profiles`
- `causeEvidence.json` -> `cause_evidence`
- `politicalProfiles.json` -> `political_profiles`
- `politicalEvidence.json` -> `political_evidence`
- `layoffsFyiSignals.json` -> `layoffs_fyi_signals`

## Layoffs.fyi ingestion

- Source APIs:
	- `https://layoffsfyi-production.up.railway.app/api/companies-list`
	- `https://layoffsfyi-production.up.railway.app/api/ai-layoffs-stats`
- Sync script: `npm run layoffs:sync`
- Alias override file: [src/data/layoffsFyiAliasMap.json](src/data/layoffsFyiAliasMap.json)
- Output snapshot: [src/data/layoffsFyiSignals.json](src/data/layoffsFyiSignals.json)

## Why this is enough for now

The current code no longer depends on specific JSON file imports inside page components. That means the next migration can change the repository implementation without rewriting the filters, tables, or company detail UI.