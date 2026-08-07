# Layoffs.fyi sync process

This project now has an automated Layoffs.fyi ingestion step for tracked companies.

## What it does

1. Pulls company layoff totals from the Layoffs.fyi backend API:
   - https://layoffsfyi-production.up.railway.app/api/companies-list
2. Pulls AI-attributed layoff events from:
   - https://layoffsfyi-production.up.railway.app/api/ai-layoffs-stats
3. Matches records to tracked companies in [src/data/companies.json](src/data/companies.json)
4. Persists normalized signals into [src/data/layoffsFyiSignals.json](src/data/layoffsFyiSignals.json)
5. Optionally seeds those signals into Supabase table `layoffs_fyi_signals` (when running with Supabase mode)

## Commands

- Sync only:
  - `npm run layoffs:sync`
- Full quarterly refresh pipeline (now includes Layoffs.fyi sync first):
  - `npm run quarterly:update`
- Full quarterly refresh plus Supabase seed:
  - `npm run quarterly:update -- --seed-supabase`

## How to run the automated script (Windows)

Run this from the repo root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-layoffs-refresh.ps1
```

Optional revalidation in the same run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-layoffs-refresh.ps1 -Revalidate
```

If you want this to run automatically every month or quarter, use the scheduler setup in [docs/scheduler-playbook.md](docs/scheduler-playbook.md).

## Match behavior

- Default matching uses company name and slug normalization.
- Alias overrides are configured in [src/data/layoffsFyiAliasMap.json](src/data/layoffsFyiAliasMap.json).
- As new tracked companies are added, add aliases only if auto-match fails.

## Important coverage caveat

Layoffs.fyi focuses on tech/startup layoffs. Non-tech companies in this index may have no match in the source.
That is expected and stored explicitly as `matched: false`.

## Suggested cadence

- Run `npm run layoffs:sync` monthly.
- Run `npm run quarterly:update` before each published score refresh.

## Scheduling

For Windows Task Scheduler and GitHub Actions setup, see [docs/scheduler-playbook.md](docs/scheduler-playbook.md).
