# Changelog

All notable changes to Mango Learning OS. Uses [Semantic Versioning](https://semver.org/).

---

## [14.8.1] — 2026-06-08 · *Outcome Loop + Agent Enforcement*

### Added
- **Agent Enforcement** — Pro/Admin mandatory research, noResearch escape removed, hard 90 quality gate (<90 → FAILED state)
- **Outcome Loop MVP** — 5-table persistence: agent_runs, outcome_documents, outcome_versions, outcome_sources, outcome_exports
- **Quality Gate v4** — requiredFixes, needsAdminReview, citationCount dimensions
- **Tavily Search** — AI-native semantic search, 1K free/month
- **Jina Reader** — Free deep search, zero setup, 10M tokens
- **Admin Review Page** — `/admin/review` with full outcome document inspection
- **Admin Research QC Page** — `/admin/research-qc` with quality metrics
- **Export API** — POST `/api/export` — HTML + PDF (ezPDF server-side)
- **Supabase Realtime** — WebSocket-based instant progress updates for agent runs
- **Agent Status API** — runId-based polling with progress tracking
- **Auto-deepen** — Pro/Admin agents auto-retry up to 2 rounds if quality <90
- **Source collection** — Pro → 12 sources, 8 search queries
- **Fonts self-hosted** — Cormorant Garamond + Inter served locally, zero external dependency

### Fixed
- Agent result displayed as raw markdown → integrated OutcomeDocument with section parsing
- Save-to-Library empty sections → parse markdown ## headers into ArtifactSection[]
- Error files sent to Agent API → filter out files with error values
- Duplicate copy/export buttons → preserved both (ArtifactRenderer + OutcomeActionsBar)

## [14.8.0] — 2026-06-07 · *Weekend Closeout*

### Added
- Quality Gate v3 → v4 preparation
- GitHub research notes for V14.8
- Agent pipeline architecture design
- Fluid Compute readiness assessment

---

## [1.2.0] — 2026-06-05 · *Apple Glass*

### Added
- **Exam Mode v2** — Question bank CRUD, 3 exercise types (MCQ/fill-blank/problem), auto-scoring engine with per-question feedback, results history with stats dashboard
- **AI Question Generation** — 3 data-source modes: keyword-only, web URL fetch (Wikipedia/ArXiv/blogs), file upload + text paste (PDF/Word/TXT/Markdown)
- **One-click Import** — 3 modes: JSON URL (GitHub raw), local JSON/CSV upload, document→AI extract
- **GitHub Sync API** — Export/import exam questions via GitHub raw URLs (`/api/exam/github-sync`)
- **Mango DNA Preview** — Hero with CTA, 4 feature cards, 4-step creation flow, persona card (trait bars + knowledge tags), agent gallery (4 agents)
- **Dynamic Custom Subjects** — `SubjectManager` dialog: add/delete disciplines, `SubjectId`→`string`, localStorage-persisted, 12-color palette auto-assigned
- **PWA Support** — `manifest.webmanifest`, `sw.js` service worker, installable on iOS (Add to Home Screen) and Android (Chrome Install)
- **Mobile Bottom Tab Bar** — 6-tab fixed nav: Home / AI Tutor / Exam / Knowledge Hub / Planner / DNA
- **Custom App Icon** — 4 sizes (favicon 32, apple-touch 180, PWA 192/512) generated from user-provided icon
- **Invite Code Gate** — `tokentome222` required for login/registration
- **Knowledge Hub Resources** — Add/delete resources with localStorage persistence
- **Study Planner Task Creation** — Dialog with subject/priority/duration selectors
- **Cloudflare Tunnel** — `tunnel.bat` script for China access via `trycloudflare.com`

### Fixed
- **500 MIDDLEWARE_INVOCATION_FAILED** — Vercel env vars stored as literal `""` strings, `isSupabaseConfigured()` now strips quotes and validates URL format
- **Guest mode dead loop** — `document.cookie`→server-side `/api/guest` route with `mango_guest` cookie
- **Client-side hydration crash** — `new Date()`/`Math.random()` in render→`useEffect`+`useState`; `Record<string,unknown>`→`JsonObj` type alias for SWC compatibility
- **Duplicate toolbar buttons** — AI gen/import dialogs unified to single row in `exam-content.tsx`
- **Local dev cache corruption** — `.next/server/vendor-chunks/tailwind-merge.js` missing→`rm -rf .next` recovery documented

### Improved
- **Mobile Architecture** — Desktop/Mobile completely separate shells (`hidden md:flex` / `flex md:hidden`) with independent layouts
- **Apple Mobile Design** — Frosted glass header/nav (`.glass`), borderless shadow cards, SF Pro font stack, bold titles (1.5rem/700), 4px scrollbar, uppercase tracking dates
- **Bottom Nav** — Active-state `scale-105` + `strokeWidth` switching + opacity transitions
- **Dashboard** — All pages connected to `useStore()` live data; dynamic greeting, pending task count, real-time stats
- **Profile Page** — Stats computed from actual store data, not hardcoded mock
- **Study Planner** — Monthly overview replaced "coming soon" with subject-task completion chart
- **Knowledge Graph Tab** — Tag distribution + concept density visualization

### Breaking Changes
- `SubjectId` changed from `"ai"|"economics"|"finance"|"math"|"english"` → `string` — all components that iterate subjects must use `useSubjects()` hook
- `seedNewUser()` auto-seed removed — new accounts start empty
- `SUBJECTS` export removed from `lib/navigation.ts` — use `useSubjects()` or `getStoredSubjects()`

---

## [1.1.0] — 2026-06-04

### Added
- Mobile/Desktop separate app shells
- Bottom tab bar navigation
- PWA manifest + service worker
- Custom app icon generation
- Invite code gate

### Fixed
- 500 middleware crash
- Guest mode entry
- Supabase env var parsing

---

## [1.0.0] — Initial Release

### Core Modules
- Dashboard — stats, tasks, weekly goals, subject progress, activity
- AI Tutor — streaming chat + quiz generation (DeepSeek)
- Study Planner — daily/weekly/monthly/semester views
- Knowledge Hub — notes, flashcards (SM-2), resources
- Exam Mode — weakness analysis from quiz history
- Profile — XP, achievements, reflections
- Auth — Supabase email/password + guest mode
