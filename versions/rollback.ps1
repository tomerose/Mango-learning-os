<#
.SYNOPSIS
  Mango Learning OS — Rollback Script
  Restore any versioned snapshot, verify build, output report.

.PARAMETER Version
  Target version tag (e.g. "1.2.0" or "1.1.0")

.EXAMPLE
  .\versions\rollback.ps1 -Version 1.1.0
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$Version
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$VERSIONS = Join-Path $ROOT "versions"
$SNAPSHOT = Join-Path $VERSIONS "v$Version"
$VERSIONS_JSON = Join-Path $VERSIONS "versions.json"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Mango Learning OS — Rollback v$Version" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# 1. Validate snapshot
if (-not (Test-Path $SNAPSHOT)) {
  Write-Error "Snapshot v$Version not found at: $SNAPSHOT"
  Write-Host "Available snapshots:" -ForegroundColor Yellow
  Get-ChildItem "$VERSIONS\v*" -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
  exit 1
}

$COMMIT_FILE = Join-Path $SNAPSHOT "commit-hash.txt"
if (-not (Test-Path $COMMIT_FILE)) {
  Write-Error "Snapshot corrupted: missing commit-hash.txt"
  exit 1
}
$TARGET_COMMIT = (Get-Content $COMMIT_FILE).Trim()

# 2. Confirm
Write-Host ""
Write-Host "Target commit : $TARGET_COMMIT" -ForegroundColor White
Write-Host "Snapshot dir  : $SNAPSHOT" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Rollback will revert ALL files to this version. Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
  Write-Host "Aborted." -ForegroundColor Gray
  exit 0
}

# 3. Git checkout
Write-Host "`n[1/4] Checking out commit $TARGET_COMMIT ..." -ForegroundColor Yellow
Set-Location $ROOT
git checkout $TARGET_COMMIT 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
  Write-Error "Git checkout failed"
  exit 1
}

# 4. Restore package.json if needed
$PKG_BACKUP = Join-Path $SNAPSHOT "package.json"
if (Test-Path $PKG_BACKUP) {
  Copy-Item $PKG_BACKUP "$ROOT\package.json" -Force
  Write-Host "[2/4] Restored package.json from snapshot" -ForegroundColor Yellow
}

# 5. Install dependencies
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
npm install 2>&1 | Select-Object -Last 5

# 6. Verify build
Write-Host "[4/4] Verifying build..." -ForegroundColor Yellow
$build = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "" -ForegroundColor Green
  Write-Host "═══════════════════════════════════════" -ForegroundColor Green
  Write-Host "  ROLLBACK SUCCESSFUL — v$Version" -ForegroundColor Green
  Write-Host "  Build: PASS" -ForegroundColor Green
  Write-Host "  Commit: $TARGET_COMMIT" -ForegroundColor Green
  Write-Host "═══════════════════════════════════════" -ForegroundColor Green

  # Update current version in versions.json
  if (Test-Path $VERSIONS_JSON) {
    $json = Get-Content $VERSIONS_JSON -Raw | ConvertFrom-Json
    $json.current = $Version
    $json | ConvertTo-Json -Depth 10 | Set-Content $VERSIONS_JSON -Encoding UTF8
    Write-Host "  Updated versions.json → current: $Version" -ForegroundColor Gray
  }
} else {
  Write-Host "" -ForegroundColor Red
  Write-Host "═══════════════════════════════════════" -ForegroundColor Red
  Write-Host "  ROLLBACK FAILED — Build error" -ForegroundColor Red
  Write-Host "  Check build output above" -ForegroundColor Red
  Write-Host "═══════════════════════════════════════" -ForegroundColor Red
  Write-Host "`nRolling forward to previous HEAD..." -ForegroundColor Yellow
  git checkout main
  exit 1
}
