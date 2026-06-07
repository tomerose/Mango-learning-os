# AGENTS.md — MangoOS Agent Rules

> Shared rule file for ALL coding agents working on MangoLearningOS.
> Read this before any work. Update project-memory after any meaningful change.

---

## Product Identity

MangoOS (MangoLearningOS) is an AI-native learning operating system for university students.

Its core promise: turn courses, files, exams, anxiety, and learning goals into **concrete outputs** — Study Packs, review handouts, practice tasks, feedback reports, emotional recovery templates, and learning history.

---

## Non-Negotiable Global Rules

1. **Stability over new features.** Working production > new decoration.
2. **Real end-to-end logic over mock UI.** No fake buttons, no hardcoded responses.
3. **Source-grounded generation over generic AI output.** Every research/content feature must use real data sources before generation.
4. **Export-ready documents over raw text.** Major outputs must support Word/PDF export.
5. **Privacy-first handling of Mind Garden data.** Local mode default, explicit consent for cloud.
6. **No hardcoded secrets.** All credentials via environment variables.
7. **No fake online research.** Do not invent sources, URLs, or citations.
8. **No production paths using mock data.** Mock/demo data is for development previews only.
9. **Always update project-memory after meaningful changes.**

---

## Agent Responsibilities

### ClaudeCoda
- Product implementation
- UI/UX refinement and interaction polish
- Visual consistency and design system
- New experience construction
- Feature output Contracts

### Codex
- Engineering audit and production readiness
- Bug fixing and regression testing
- TypeScript and data-flow hardening
- PDF/Word export reliability
- Persistence verification (Supabase + guest/local)
- Mock/fake logic detection
- Route stability and build/lint reliability
- Architecture cleanup (only when necessary)

---

## Agent Collaboration Rules

1. Agents do **not** automatically know each other's latest work. Sync through Git commits, branches, and project-memory files.
2. No two agents may work on the same branch at the same time.
3. No two agents may modify the same core directories unless explicitly coordinated.
4. Codex's first task must be **audit-only** with no code changes.
5. Codex changes must be reviewed through diff before merge.
6. Production readiness requires: lint + typecheck + build + core workflow verification.
7. Stability > visual decoration or new feature expansion.
8. No agent may assume another agent's work is known unless committed and recorded in project-memory.

---

## Required Startup Protocol

Before any agent starts work:

1. Check current branch: `git branch --show-current`
2. Check git status: `git status --short`
3. Pull or confirm the latest intended branch
4. Read `AGENTS.md` (this file)
5. Read `project-memory/PROJECT_STATE.md`
6. Read `project-memory/FEATURES.md`
7. Read `project-memory/UPDATE_LOG.md`
8. Read `project-memory/BUGFIX_HISTORY.md`
9. Read `project-memory/REGRESSION_CHECKLIST.md`
10. Report current understanding **before** editing any file

---

## Required Completion Protocol

After any agent completes work:

1. Update relevant project-memory files
2. Run `npm run lint` (or `npx next lint`) and `npx next build --no-lint`
3. Run `npx tsc --noEmit` if TypeScript is configured
4. Commit with a clear message describing what changed and why
5. Report: branch name, commit hash, files changed, checks run, known risks, next recommended task

---

## Branch Strategy

- `main` — stable branch only. No direct work.
- `claude/*` — ClaudeCoda product branches
- `codex/*` — Codex audit/hardening branches
- Merge to main only after checks pass and diff is reviewed

---

## Environment Variables (must NOT be hardcoded)

| Variable | Purpose |
|----------|---------|
| `AI_API_KEY` | DeepSeek / OpenAI-compatible API key |
| `AI_BASE_URL` | AI provider base URL (default: https://api.deepseek.com) |
| `AI_MODEL` | Model name (default: deepseek-chat) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `GITHUB_TOKEN` | GitHub API token (optional, raises rate limit) |
| `YOUTUBE_API_KEY` | YouTube Data API key (optional) |
| `PADDLEOCR_URL` | PaddleOCR Docker service URL (optional) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `EMAIL_APP_PASSWORD` | Email send password |
| `DEEPGRAM_API_KEY` | Deepgram API key for STT |

## Tech Stack

Next.js 15.5 (App Router) · React 19 · TypeScript 5.8 · Tailwind CSS 4.1
shadcn/ui (New York) · Supabase (PostgreSQL + RLS) · DeepSeek AI · Vercel

---

## Regression Prevention (added 2026-06-07 after V14 feature-loss incident)

### Root Cause of V14 Regression
`claude/v10-study-pack` had all V12-V14 features but was **never merged to main**.
The UI redesign branch was created from `main` (missing features), merged back, and deployed — losing features.

### Hard Rules to Prevent Recurrence

1. **Single source of truth**: `main` is the ONLY deployable branch. No feature silos.
2. **Merge immediately**: Feature branches must merge to `main` before any other branch is created from `main`.
3. **Never branch from stale main**: `git pull origin main` before creating any branch.
4. **Protected files**: Do NOT delete or overwrite:
   - `app/api/**` (20+ routes)
   - `lib/agent/**`, `lib/ai/**`, `lib/auth/**`, `lib/plan/**`, `lib/quota/**`, `lib/mango-code/**`
   - `components/profile/*` (all 9 components)
   - `components/mobile/premium-mobile.tsx`
   - `app/globals.css` (design token section)
5. **Build gate**: `npm run build` must pass with 0 errors before any push.
6. **Version token**: `lib/version.ts` → `APP_VERSION` is the single version source.
7. **No update modal on startup**: User preference. UpdateModal is disabled.
8. **Post-deploy smoke test**: After deploy, curl `/hub`, `/agent`, `/pack`, `/profile`, `/grow` — all must return 200.
