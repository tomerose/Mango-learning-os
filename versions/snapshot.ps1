<#
.SYNOPSIS
  Create a new version snapshot. Automates:
  1) File manifest + git hash capture
  2) Semver increment (Major/Minor/Patch)
  3) CHANGELOG + versions.json update
  4) Optional git tag

.PARAMETER Bump
  Which semver component to increment: major, minor, or patch

.PARAMETER Codename
  Optional release codename for this version

.PARAMETER Added
  Comma-separated string of new features added

.PARAMETER Fixed
  Comma-separated string of bugs fixed

.PARAMETER Improved
  Comma-separated string of improvements

.EXAMPLE
  .\versions\snapshot.ps1 -Bump minor -Codename "Study Boost" -Added "Exam v2,AI Gen" -Fixed "500 error" -Improved "Mobile UI"
#>

param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("major","minor","patch")]
  [string]$Bump,
  [string]$Codename = "",
  [string]$Added = "",
  [string]$Fixed = "",
  [string]$Improved = ""
)

$ROOT = Split-Path -Parent $PSScriptRoot
$VERSIONS = Join-Path $ROOT "versions"
$VERSIONS_JSON = Join-Path $VERSIONS "versions.json"
$CHANGELOG = Join-Path $ROOT "CHANGELOG.md"

# 1. Read current version
$json = Get-Content $VERSIONS_JSON -Raw | ConvertFrom-Json
$cur = $json.current -split "\."
$major = [int]$cur[0]; $minor = [int]$cur[1]; $patch = [int]$cur[2]

# 2. Bump
switch ($Bump) {
  "major" { $major++; $minor=0; $patch=0 }
  "minor" { $minor++; $patch=0 }
  "patch" { $patch++ }
}
$newVer = "$major.$minor.$patch"
Write-Host "═ Bumping: $($json.current) → $newVer ($Bump)" -ForegroundColor Cyan

# 3. Capture snapshot
$SNAPSHOT = Join-Path $VERSIONS "v$newVer"
New-Item -ItemType Directory -Force $SNAPSHOT | Out-Null

Set-Location $ROOT
$hash = (git rev-parse HEAD).Trim()
$date = Get-Date -Format "yyyy-MM-dd"
$hash | Out-File "$SNAPSHOT\commit-hash.txt" -Encoding UTF8
$date  | Out-File "$SNAPSHOT\timestamp.txt"  -Encoding UTF8
Copy-Item "$ROOT\package.json" "$SNAPSHOT\package.json" -Force

# Generate file manifest
& { git ls-files | Where-Object { $_ -match '\.(tsx?|css|json|sql|js|webmanifest|md)$' -and $_ -notmatch 'node_modules|\.next|package-lock|versions/' } } | Sort-Object | Out-File "$SNAPSHOT\file-manifest.txt" -Encoding UTF8
$fileCount = (Get-Content "$SNAPSHOT\file-manifest.txt" | Measure-Object).Lines
Write-Host "═ Files tracked: $fileCount" -ForegroundColor Gray

# 4. Parse added/fixed/improved from comma-separated strings
$addedList = if ($Added) { $Added -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }
$fixedList = if ($Fixed) { $Fixed -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }
$improvedList = if ($Improved) { $Improved -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } } else { @() }

# 5. Update versions.json
$entry = @{
  version = $newVer
  semver = @{ major=$major; minor=$minor; patch=$patch }
  date = $date
  commit = $hash
  codename = $Codename
  snapshot_dir = "versions/v$newVer"
  type = $Bump
  added = $addedList
  fixed = $fixedList
  improved = $improvedList
  files_changed = $fileCount
  rollback = @{
    git_tag = "v$newVer"
    commit = $hash
    db_migrations = @("docs/architecture/exam-mode-schema.sql")
    env_vars_required = @(
      "NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY","AI_API_KEY","AI_BASE_URL","AI_MODEL"
    )
  }
}
$json.history = @($entry) + $json.history
$json.current = $newVer
$json | ConvertTo-Json -Depth 10 | Set-Content $VERSIONS_JSON -Encoding UTF8 -Force
Write-Host "═ Updated versions.json" -ForegroundColor Green

# 6. Append to CHANGELOG.md
$now = Get-Date -Format "yyyy-MM-dd"
$changelogEntry = @"

## [$newVer] — $now · *$Codename*

### Added
$(if ($addedList.Count -gt 0) { $addedList | ForEach-Object { "- $_" } | Out-String } else { "- *(none)*" })
### Fixed
$(if ($fixedList.Count -gt 0) { $fixedList | ForEach-Object { "- $_" } | Out-String } else { "- *(none)*" })
### Improved
$(if ($improvedList.Count -gt 0) { $improvedList | ForEach-Object { "- $_" } | Out-String } else { "- *(none)*" })
---
"@
$currentChangelog = Get-Content $CHANGELOG -Raw -Encoding UTF8
$changelogEntry + "`n" + $currentChangelog | Set-Content $CHANGELOG -Encoding UTF8 -Force
Write-Host "═ Updated CHANGELOG.md" -ForegroundColor Green

# 7. Create git tag
git tag -a "v$newVer" -m "Release v$newVer — $Codename" 2>&1 | Out-Null
Write-Host "═ Git tag: v$newVer" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SNAPSHOT v$newVer CREATED" -ForegroundColor Cyan
Write-Host "  Files : $fileCount" -ForegroundColor White
Write-Host "  Commit: $hash" -ForegroundColor White
Write-Host "  Rollback: versions/rollback.ps1 -Version $newVer" -ForegroundColor White
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
