# MangoLearningOS — Project State

**Updated:** 2026-06-06 | **Version:** v7 Research Pipeline

## Stack (v7)
Next.js 15.5 (App Router) · React 19 · TypeScript 5.8 · Tailwind CSS 4.1
shadcn/ui (New York) · Supabase (PostgreSQL + RLS) · DeepSeek AI · Vercel

## Design System (v6 Warm Paper Wellness — unchanged)
- Palette: oklch(0.978 0.005 60) bg | oklch(0.58 0.16 75) primary | oklch(0.85 0.04 140) accent
- Typography: Cormorant Garamond (serif display) + Inter (geometric sans)
- Surface: 6-level (paper/card/floating/glass/focus/hero)
- Shadow: 0 8px 30px rgb(0,0,0,0.04)

## Architecture (v7 additions)
- **Research Orchestrator:** `lib/ai/research-orchestrator.ts` — Multi-source pipeline (query expansion → 6 providers → dedup/rank/score → synthesis)
- **Content Quality Engine v2:** `lib/ai/content-quality-v2.ts` — 7-gate quality validation (relevance, grounding, structure, completeness, anti-generic, formatting, actionability)
- **Feature Output Contracts:** `lib/feature-contracts.ts` — Standardized output specs for 6 major features
- **Exam Review Module:** Full pipeline (input → research → generate → export Word/PDF/MD)
- **Mind Garden v2:** Safe structured mental wellness (10 modes, crisis detection, privacy-first)
- **Dual-mode persistence:** guest (localStorage) / cloud (Supabase + RLS)
- **AI layer:** `lib/ai/client.ts` — pluggable OpenAI-compatible (`streamChat`, `completeChat`, `extractJson`)

## Routes (7 windows + aux)

| Route | Window | Key Modules |
|-------|--------|-------------|
| `/exam` | Mangoing | **Exam Review Tab** (research→generate→export), Knowledge Forest, Knowledge Network, Notes, Resources |
| `/agent` | Mango Tutor | AgentChat, ConceptExplainer, ExerciseGenerator, MistakeAnalyzer |
| `/hub` | Mangosum | HubWelcome, MagicCard, LearningGoals, QuickActions |
| `/grow` | Mango Friend | Mind Garden (10 modes), Projects |
| `/planner` | Mango Plan | AI plan generation, Task management |
| `/dna` | Mango DNA | Persona profile, agent gallery |
| `/profile` | Mango | XP, level, achievements, stats |

## New API Routes (v7)
- `/api/exam-review/generate` — Full exam handout generation (online research + AI)
- `/api/exam-review/export` — Export to Word/PDF/Markdown/HTML
- `/api/mind-garden/reflect` — Safe structured mental wellness (10 modes + crisis detection)
- `/api/forest/enrich` — Multi-source forest enrichment (Wikipedia + GitHub + web)

## Research Providers
| Provider | Status | Requires |
|----------|--------|----------|
| Web Search (DuckDuckGo) | ✅ Free | None |
| GitHub | ✅ Free (60/h) / ✅ Token (5000/h) | GITHUB_TOKEN |
| Academic (arXiv) | ✅ Free | None |
| YouTube | ⚠ Fallback mode | YOUTUBE_API_KEY |
| Local Files | ✅ | User upload |

## Database (Supabase)
- 21 tables (unchanged from v6)
- All tables RLS-protected
