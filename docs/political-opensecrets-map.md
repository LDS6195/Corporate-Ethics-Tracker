# OpenSecrets Canonical ID Map

Use [src/data/openSecretsOrgMap.json](src/data/openSecretsOrgMap.json) as the single source of truth for OpenSecrets organization identity.

For field-by-field enrichment and publish gate rules, also use [docs/political-field-criteria.md](docs/political-field-criteria.md).

## Rules

1. Do not fetch numeric political metrics from slug-only URLs.
2. Use only records where `status` is `verified`.
3. For `missing-id` records, do not guess slugs; resolve org ID first, then update the map.

## Commands

1. Show current mapping and coverage:

```bash
npm run politics:opensecrets-map
```

2. Show unresolved companies only:

```bash
node scripts/opensecrets-id-map.mjs --missing-only --output=table
```

3. Show a subset for enrichment:

```bash
node scripts/opensecrets-id-map.mjs --company=amazon,alphabet,microsoft --output=table
```

## Update Procedure

1. Resolve a company's OpenSecrets org ID from a reliable source.
2. Update `orgId`, `orgSlug`, `summaryUrl`, and `recipientsUrl`.
3. Set `status` to `verified`.
4. Use canonical URLs from the map for all PAC/party split/lobbying numeric ingestion.