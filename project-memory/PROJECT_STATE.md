# MangoLearningOS — Project State

**Updated:** 2026-06-06 | **Version:** v7.3 内测版 | **Branch:** `claude/v10-study-pack`

## Stack (v7)
Next.js 15.5 (App Router) · React 19 · TypeScript 5.8 · Tailwind CSS 4.1
shadcn/ui (New York) · Supabase (PostgreSQL + RLS) · DeepSeek AI · Vercel

## Design System (v6 Warm Paper Wellness — unchanged)
- Palette: oklch(0.978 0.005 60) bg | oklch(0.58 0.16 75) primary | oklch(0.85 0.04 140) accent
- Typography: Cormorant Garamond (serif display) + Inter (geometric sans)
- Surface: 6-level (paper/card/floating/glass/focus/hero)
- Shadow: 0 8px 30px rgb(0,0,0,0.04)

## Architecture
- **Research Orchestrator (9 providers):** Web (DuckDuckGo), GitHub, Academic (arXiv), Bilibili, Douyin, Open Library, Free Dictionary, Gutendex, Local Files
- **Content Quality Engine v2:** 7-gate validation (relevance, grounding, structure, completeness, anti-generic, formatting, actionability)
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

## API Routes (v7.3)
- `/api/exam-review/generate` — Full exam handout (online research → AI → 18 sections)
- `/api/exam-review/export` — Word/PDF/Markdown/HTML export
- `/api/mind-garden/reflect` — 10-mode safe mental wellness + crisis detection
- `/api/forest/enrich` — Multi-source forest enrichment (Wikipedia + GitHub + web)
- `/api/notes/enrich` — AI note enrichment (Wikipedia + DDG)
- `/api/notes/import/file` — File import (Word/PDF/MD)
- `/api/notes/import/url` — URL content fetch
- `/api/wechat/webhook` — WeChat Official Account webhook
- `/api/wecom/webhook` — WeCom bot webhook
- `/api/cron/wechat-daily` — Daily WeChat content push

## Research Providers (9 total)
| Provider | Status | API Key |
|----------|--------|---------|
| Web Search (DuckDuckGo) | ✅ Free | None |
| GitHub | ✅ Free 60/h | GITHUB_TOKEN optional |
| Academic (arXiv) | ✅ Free | None |
| Bilibili (哔哩哔哩) | ✅ Free | None |
| Douyin (抖音) | ✅ Fallback URL | None |
| Open Library | ✅ Free | None |
| Free Dictionary | ✅ Free | None |
| Gutendex (Gutenberg) | ✅ Free | None |
| Local Files | ✅ | User upload |

## Database (Supabase)
- 21 tables (unchanged from v6)
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
