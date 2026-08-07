param(
  [switch]$Revalidate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Write-Host "Running layoffs refresh from $repoRoot"

& npm.cmd run layoffs:sync

if ($LASTEXITCODE -ne 0) {
  throw "layoffs:sync failed with exit code $LASTEXITCODE"
}

if ($Revalidate) {
  if ([string]::IsNullOrWhiteSpace($env:REVALIDATE_BASE_URL) -or [string]::IsNullOrWhiteSpace($env:REVALIDATE_SECRET)) {
    Write-Warning "Skipping revalidation because REVALIDATE_BASE_URL or REVALIDATE_SECRET is not set in the task environment."
  }
  else {
    & npm.cmd run revalidate:site
    if ($LASTEXITCODE -ne 0) {
      throw "revalidate:site failed with exit code $LASTEXITCODE"
    }
  }
}

Write-Host "Layoffs refresh complete."