# Scheduler playbook

This playbook automates layoffs refresh so it runs without manual prompts.

## Scope

- Runtime source of truth is local JSON.
- Automated source is Layoffs.fyi only.
- Script updates [src/data/layoffsFyiSignals.json](src/data/layoffsFyiSignals.json).

## Option A: Windows Task Scheduler (recommended for this environment)

Use this when you want refreshes to run on your Windows machine.

### 1) One-time test

From repo root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-layoffs-refresh.ps1
```

Optional (also call revalidate endpoint if env vars are available in task environment):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-layoffs-refresh.ps1 -Revalidate
```

### 2) Create a scheduled task

Create a monthly task that runs on day 1 every month at 09:00 local time:

```powershell
$taskName = "SP-AVLNCH-Layoffs-Refresh"
$repoPath = "C:\Users\logan.smithson\OneDrive - Waystar\Desktop\SP-AVLNCH"
$psArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$repoPath\scripts\run-layoffs-refresh.ps1`""

schtasks /Create /F /TN $taskName /SC MONTHLY /MO 1 /D 1 /ST 09:00 /TR "powershell.exe $psArgs"
```

To run every 3 months instead:

```powershell
schtasks /Create /F /TN "SP-AVLNCH-Layoffs-Refresh-Q" /SC MONTHLY /MO 3 /D 1 /ST 09:00 /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"C:\Users\logan.smithson\OneDrive - Waystar\Desktop\SP-AVLNCH\scripts\run-layoffs-refresh.ps1`""
```

### 3) Verify task

```powershell
schtasks /Query /TN "SP-AVLNCH-Layoffs-Refresh" /V /FO LIST
```

## Option B: GitHub Actions (if this folder is in a git remote)

Use this when you want cloud scheduling and automatic pull requests.

Create [.github/workflows/layoffs-refresh.yml](.github/workflows/layoffs-refresh.yml) with:

```yaml
name: layoffs-refresh

on:
  schedule:
    - cron: "0 14 1 * *"
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run layoffs:sync
      - name: Create PR if data changed
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "chore: refresh layoffs signals"
          branch: chore/layoffs-refresh
          title: "chore: refresh layoffs signals"
          body: "Automated layoffs refresh from scheduler."
```

## Operating rule

- Automation should update layoffs data only.
- SEC, cause, and political research remain analyst-reviewed until dedicated connectors are production-ready.