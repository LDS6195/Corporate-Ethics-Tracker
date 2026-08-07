# Runtime Recovery Note (OneDrive + Next.js)

This project is in a OneDrive-synced folder, and Next.js artifacts can intermittently break due to file locks during dependency or cache writes.

## Symptom pattern

- App was working, then suddenly fails on refresh or route load.
- Typical errors:
  - `Cannot find module './vendor-chunks/@supabase.js'`
  - Missing `@swc/helpers` files
  - Random chunk/module not found errors under `.next/server/...`

## Fast recovery checklist

1. Stop all project Node processes.
2. Delete `.next`.
3. If `node_modules` deletion fails due to `EPERM`/locked SWC file:
   - Delete `node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` first.
4. Run a clean install with `npm ci`.
5. Validate with:
   - `npm run build`
   - `npm run dev` and request `/`.

## Useful PowerShell commands

```powershell
Set-Location "c:\Users\logan.smithson\OneDrive - Waystar\Desktop\SP-AVLNCH"
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' } | Select-Object ProcessId, CommandLine
```

```powershell
Set-Location "c:\Users\logan.smithson\OneDrive - Waystar\Desktop\SP-AVLNCH"
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path "node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node") {
  Remove-Item "node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node" -Force
}
npm ci
npm run build
npm run dev
```

## Why this happens

OneDrive sync and endpoint protection can briefly lock files while npm/Next are writing. That can leave a partially updated `node_modules` or `.next` state that compiles some modules but fails at runtime.

## Prevention

- Avoid running `npm run build` and `npm run dev` at the same time.
- Prefer one active Node process for this repo.
- If possible, move the repo outside OneDrive sync (or exclude this folder from sync).
