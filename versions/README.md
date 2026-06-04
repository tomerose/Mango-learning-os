# Version Management

## Quick Reference

| Action | Command |
|---|---|
| **Create snapshot** | `.\versions\snapshot.ps1 -Bump patch -Codename "Bugfix" -Added "..." -Fixed "..." -Improved "..."` |
| **Rollback** | `.\versions\rollback.ps1 -Version 1.2.0` |
| **View history** | `cat versions/versions.json` |
| **View changelog** | `cat CHANGELOG.md` |

## Snapshot (Creating a New Version)

```powershell
.\versions\snapshot.ps1 `
  -Bump minor `
  -Codename "Apple Glass" `
  -Added "Feature A,Feature B" `
  -Fixed "Bug fix 1,Bug fix 2" `
  -Improved "UI polish,Performance"
```

## Rollback (Restoring a Previous Version)

```powershell
# Restore v1.1.0
.\versions\rollback.ps1 -Version 1.1.0
```

The rollback script:
1. Checks out the git commit from that version's snapshot
2. Restores `package.json`
3. Runs `npm install`
4. Verifies `npm run build`
5. Updates `versions.json` to reflect the rollback

## Semver Rules

| Bump | When |
|---|---|
| **Major** (x.0.0) | Breaking changes, removed APIs, DB migrations that aren't backward-compatible |
| **Minor** (0.x.0) | New features, new pages, new API routes |
| **Patch** (0.0.x) | Bug fixes, typo fixes, CSS tweaks, no new features |

## Directory Structure

```
versions/
├── versions.json          # Version registry (current version + history)
├── rollback.ps1           # Rollback script
├── snapshot.ps1           # Snapshot creation script
├── README.md              # This file
└── v1.2.0/               # Per-version snapshots
    ├── commit-hash.txt
    ├── timestamp.txt
    ├── package.json
    └── file-manifest.txt
```
