# MangoLearningOS — Project State

**Updated:** 2026-06-09 | **Version:** V14.8.1 Outcome Loop + Agent Enforcement | **Branch:** `main`

## Stack (v7)
Next.js 15.5 (App Router) · React 19 · TypeScript 5.8 · Tailwind CSS 4.1
shadcn/ui (New York) · Supabase (PostgreSQL + RLS) · DeepSeek AI · Vercel

## Design System (v6 Warm Paper Wellness — unchanged)
- Palette: oklch(0.978 0.005 60) bg | oklch(0.58 0.16 75) primary | oklch(0.85 0.04 140) accent
- Typography: Cormorant Garamond (serif display) + Inter (geometric sans)
- Surface: 6-level (paper/card/floating/glass/focus/hero)
- Shadow: 0 8px 30px rgb(0,0,0,0.04)

## Mobile UI State (2026-06-07 Codex)
- Mobile visual system now uses premium cinematic shell: charcoal background, mango-gold accent, translucent glass cards, warm paper content surfaces, safe-area bottom navigation, 44px touch targets, and reduced-motion CSS guard.
- Four primary mobile tabs: Today (`/hub`), Generate (`/exam`), Agent (`/agent`), Profile (`/profile`).
- Secondary mobile modules remain accessible: Notes/Forest/Graph through `/exam?tab=...`, Planner (`/planner`), Grow (`/grow`), Voice (`/voice`), DNA (`/dna`).
- Protected backend/business paths untouched for this pass.

## Architecture (V14.8.1)

### Core Systems
- **Research Orchestrator (11 providers):** Web (DuckDuckGo), GitHub, Academic (arXiv), Bilibili, Douyin, Open Library, Free Dictionary, Gutendex, Local Files, **Tavily Search (1K/mo free)**, **Jina Reader (10M tokens free)**
- **Content Quality Engine v4:** 7-gate validation + requiredFixes + needsAdminReview + citationCount (hard 90 gate for Pro/Admin)
- **Agent Execution Pipeline:** Pro/Admin mandatory research → source collection → AI synthesis → Quality Gate v4 → auto-deepen (up to 2 rounds if <90)
- **Outcome Loop:** 5-table persistence (agent_runs, outcome_documents, outcome_versions, outcome_sources, outcome_exports) + Admin Review + Research QC
- **Fluid Compute:** `after()` background processing → runId → polling + Supabase Realtime zero-latency updates
- **Export API:** ezPDF server-side PDF + HTML/Markdown export
- **Feature Output Contracts:** 6 feature contracts (exam-review, tutor, mind-garden, knowledge-capture, career, research)
- **Exam Review Module:** Full pipeline (input → research → 18-section handout → Word/PDF/MD export)
- **Mind Garden v2:** 10 safe modes, crisis detection, privacy toggle (local/cloud)
- **Knowledge Forest v4:** Notion-style sidebar + 5 content tabs + rich content
- **Rich Text Editor:** Formatting toolbar, edit/preview toggle, properties panel, cover image
- **PaddleOCR Client:** HTTP service wrapper for superior OCR (Docker deployment)
- **Dual-mode persistence:** guest (localStorage) / cloud (Supabase + RLS)
- **AI layer:** DeepSeek via OpenAI-compatible (`streamChat`, `completeChat`, `extractJson`)

## Routes (7 windows)

| Route | Window | Key Modules |
|-------|--------|-------------|
| `/exam` | Mangoing | Exam Review, Knowledge Forest v4, Notes (RichEditor), Resources |
| `/agent` | Mango Tutor | AgentChat, ConceptExplainer, ExerciseGenerator |
| `/hub` | Mangosum | HubWelcome, MagicCard, Onboarding, UpdateModal (内测版) |
| `/grow` | Mango Friend | Mind Garden Pro (10 modes), Journal, CBT, Companion |
| `/planner` | Mango Plan | AI plan generation, Task management |
| `/dna` | Mango DNA | Persona profile, agent gallery |
| `/profile` | Mango | XP, level, stats, contact card |

## API Routes (V14.8.1 — 24 groups)
- `/api/agent/execute` — Agent pipeline: research → quality gate → outcome persistence → export
- `/api/agent/status` — Agent run polling (runId → status/progress)
- `/api/ai/chat` — Streaming AI chat (SSE)
- `/api/ai/quiz` — Quiz generation
- `/api/exam-review/generate` — Full exam handout (18 sections)
- `/api/exam-review/export` — Word/PDF/Markdown/HTML export
- `/api/exam/github-sync` — GitHub raw URL import/export
- `/api/export` — HTML/PDF server-side export (ezPDF)
- `/api/mind-garden/reflect` — 10-mode safe mental wellness + crisis detection
- `/api/forest/enrich` — Multi-source forest enrichment
- `/api/notes/enrich` — AI note enrichment
- `/api/notes/import/file` — File import (Word/PDF/MD)
- `/api/notes/import/url` — URL content fetch
- `/api/cognitive/mindmap` — Cognitive mindmap generation
- `/api/wechat/webhook` — WeChat Official Account webhook
- `/api/wecom/webhook` — WeCom bot webhook
- `/api/cron/wechat-daily` — Daily WeChat content push
- `/api/admin/*` — Admin Review + Research QC pages
- `/api/data/*` — Data export/analytics

## Research Providers (11 total)
| Provider | Status | API Key |
|----------|--------|---------|
| Web Search (DuckDuckGo) | ✅ Free | None |
| Tavily Search | ✅ 1K/mo free | TAVILY_API_KEY |
| Jina Reader | ✅ Free 10M tokens | None |
| GitHub | ✅ Free 60/h | GITHUB_TOKEN optional |
| Academic (arXiv) | ✅ Free | None |
| Bilibili (哔哩哔哩) | ✅ Free | None |
| Douyin (抖音) | ✅ Fallback URL | None |
| Open Library | ✅ Free | None |
| Free Dictionary | ✅ Free | None |
| Gutendex (Gutenberg) | ✅ Free | None |
| Local Files | ✅ | User upload |

## Database (Supabase)
- 26 tables (V14.8.1: +5 outcome loop tables + mango_codes) — all deployed ✅
- Outcome tables: agent_runs, outcome_documents, outcome_versions, outcome_sources, outcome_exports
- All tables RLS-protected

## Agent Collaboration and Synchronization Rules

- **ClaudeCoda** owns product implementation, UI/UX refinement, interaction polish, visual consistency, new experience construction.
- **Codex** owns engineering audit, production readiness, bug fixing, regression testing, TypeScript/data-flow hardening, export reliability, persistence verification, mock/fake logic detection, necessary architecture cleanup.
- Agents sync through Git commits, branches, and project-memory files — NOT implicit knowledge.
- No two agents on the same branch simultaneously.
- No two agents modifying the same core directories without coordination.
- Codex's first task must be audit-only (no code changes).
- Codex changes reviewed through diff before merge.
- Production readiness = lint + typecheck + build + core workflow verification.
- Stability > visual decoration or new feature expansion.

## Current Auth Codes (v7.3)
- Guest / First entry: `sillyfind2025`
- Login / Register: `tokentome222`
