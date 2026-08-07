# Political Field Acceptance Criteria

This runbook defines exactly how to populate political tracker fields in a repeatable way.

## Scope

The process covers:

1. `src/data/politicalProfiles.json`
2. `src/data/politicalEvidence.json`
3. `src/data/openSecretsOrgMap.json`

## Core Principles

1. Never infer numeric values from narrative text.
2. Prefer primary-source numeric records from OpenSecrets canonical org ID pages.
3. If org ID is unresolved, do not use slug guesses for numeric ingestion.
4. Keep one evidence record per metric per company when possible.
5. Keep narrative `policyRiskDisclosure` tied to direct SEC filing language.

## Source Hierarchy

1. OpenSecrets recipients page with canonical org ID (`high` confidence):
   - `pacContributionsUsd`
   - `partySplitPct`
2. OpenSecrets summary page with canonical org ID (`high` confidence):
   - `lobbyingSpendUsd`
   - `lobbyingSpendPriorYearUsd`
   - `revolvingDoorCurrent`
   - `revolvingDoorPrior`
3. SEC EDGAR filing text (`medium` confidence):
   - `policyRiskDisclosure`
   - context for `lobbyingPolicyArea` and `lobbyingFocusSummary` only when no stronger source exists

## Field Rules: politicalProfiles

### Required always

1. `companyId`
2. `profileStatus`
3. `evidenceRecords`
4. `highConfidenceRecords`
5. `lastUpdated` in `YYYY-MM-DD`

### Numeric publish fields

Only populate these when values come from verified ID-based OpenSecrets URLs:

1. `pacContributionsUsd`
2. `democraticPct`
3. `republicanPct`
4. `thirdPartyPct`
5. `lobbyingSpendUsd`
6. `lobbyingSpendPriorYearUsd`
7. `revolvingDoorCurrent`
8. `revolvingDoorPrior`

Party split check:

1. `democraticPct + republicanPct + thirdPartyPct` should be approximately `100`.
2. Accept rounding drift up to `0.2`.

### Narrative fields

1. `lobbyingPolicyArea` should use a stable policy taxonomy label.
2. `lobbyingFocusSummary` should be 1 sentence, factual, no speculation.
3. `lobbyingBillSummary` and bill fields should only be set if bill-specific evidence is available.
4. `lobbyingSourceUrl` should point to the canonical OpenSecrets summary URL when numeric lobbying values are present.

## Field Rules: politicalEvidence

Each record should include:

1. `companyId`
2. `metric`
3. `electionCycle` (currently `2024` for this dataset)
4. `value`
5. `sourceName`
6. `sourceUrl`
7. `sourceDate`
8. `confidence` (`high` or `medium` currently used)

Metric-specific value expectations:

1. `pacContributionsUsd`: number
2. `partySplitPct`: object with `democraticPct`, `republicanPct`, `thirdPartyPct`
3. `lobbyingSpendUsd`: number
4. `policyRiskDisclosure`: direct quote or tightly faithful excerpt

Confidence rules:

1. `high`: canonical OpenSecrets org ID URL with explicit numeric value.
2. `medium`: SEC narrative disclosure without direct political spend numeric.
3. Do not use `high` for SEC-only policy-risk text.

## Status Gates

Set `profileStatus` to `published` only when all conditions are met:

1. At least 3 `high` confidence records exist.
2. Includes all of:
   - `pacContributionsUsd`
   - `partySplitPct`
   - `lobbyingSpendUsd`
3. Profile-level numeric fields match evidence values.

Otherwise keep as `in-progress`.

## Canonical ID Workflow

1. Check mapping coverage:

```bash
npm run politics:opensecrets-map
```

2. List unresolved companies:

```bash
node scripts/opensecrets-id-map.mjs --missing-only --output=table
```

3. Resolve and update in `src/data/openSecretsOrgMap.json`:
   - `orgId`
   - `orgSlug`
   - `summaryUrl`
   - `recipientsUrl`
   - `status` => `verified`

## Update Sequence Per Company

1. Confirm org ID is `verified` in map.
2. Extract numeric values from canonical OpenSecrets URLs.
3. Add/refresh evidence records in `src/data/politicalEvidence.json`.
4. Update corresponding fields in `src/data/politicalProfiles.json`.
5. Recompute `evidenceRecords` and `highConfidenceRecords`.
6. Evaluate publish gate and set `profileStatus`.

## Quality Checks Before Finish

1. Run lint:

```bash
npm run lint
```

2. Revalidate site cache:

```bash
npm run revalidate:site
```

3. Sanity spot-check:
   - No zero-evidence profiles unless intentionally `not-started`.
   - No numeric fields populated from non-verified OpenSecrets sources.
   - No stale `lastUpdated` for edited profiles.

## Resume Checklist

At the start of a future session:

1. Read `docs/political-opensecrets-map.md`.
2. Read this file.
3. Run `npm run politics:opensecrets-map`.
4. Pick 3-5 `missing-id` companies and resolve IDs first.
5. Only then fill numeric profile fields.