# Supabase setup

## 1. Create a project

In Supabase:

1. Create a new project.
2. Wait for the database to finish provisioning.
3. Open Project Settings -> API.
4. Copy the project URL and anon key.
5. Copy the service role key for server-side seed scripts only.

Do not expose the service role key in browser code.

## 2. Add local environment variables

Create `.env.local` in the repo root and add:

```env
NEXT_PUBLIC_APP_DATA_BACKEND=json
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REVALIDATE_BASE_URL=http://localhost:3000
REVALIDATE_SECRET=choose-a-long-random-secret
```

## 3. Create the tables

In the Supabase SQL editor, run [supabase/schema.sql](supabase/schema.sql).

## 4. Check the connection

Run:

```bash
npm run supabase:check
```

This confirms the app can reach the `companies` table with the anon key.

## 5. Seed the current JSON dataset

Run:

```bash
npm run supabase:seed
```

This imports the current local JSON data into Supabase using the service role key.

## 6. Refresh the cached site after updates

After seeding new data, refresh the cached pages:

```bash
npm run revalidate:site
```

This hits the protected `/api/revalidate` endpoint using `REVALIDATE_BASE_URL` and `REVALIDATE_SECRET`.

If you only changed a few companies, you can target those pages:

```bash
npm run revalidate:site -- apple microsoft amazon
```

## 7. Run the full quarterly update in one step

```bash
npm run quarterly:update
```

That command:

1. Syncs Layoffs.fyi data into local JSON.
2. Refreshes the cached site pages so the new data shows up immediately.

If you also want to seed Supabase in the same run:

```bash
npm run quarterly:update -- --seed-supabase
```

## Why this order matters

- URL + publishable key let the app read safely.
- Service role key is only for admin scripts like seeding.
- Schema must exist before the check and seed steps.
- Revalidation prevents the site from serving stale cached data after an import.