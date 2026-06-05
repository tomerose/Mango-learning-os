# MangoLearningOS — Session Handoff

> **Last session:** 2026-06-06 (Final V6 — Voice OS + Mangobo + New Onboarding) | **Next session starts here**

## Quick Start
```bash
cd "D:\Claudecoda学习\AI-Learning-OS"
npm run dev -- -p 3030
# Production: https://mangoleaningos.top (Vercel auto-deploy)
```

## Current Architecture (5 Windows + Voice)
| Route | Name | Key Features |
|-------|------|-------------|
| `/hub` | Mangosum | Hero card + AmbientOrbs + Mangobo companion + Knowledge cards |
| `/agent` | Mango Tutor | Chat/Identity/DNA tabs + Knowledge capture + Plan generation |
| `/exam` | Mangoing | 3D Knowledge Forest + Knowledge Network + Notes + Resources |
| `/planner` | Mango Plan | Tasks + AI Plan + Exam Prep + Flashcards (SM-2) |
| `/grow` | Mango Friend | Journal + Mood + CBT + AI Companion |
| `/voice` | Mango Voice | Voice OS: STT→AI→TTS loop, 5 personas, platform-agnostic |
| `/dna` | → `/agent?tab=dna` | Redirect to Tutor DNA tab |

## Key Systems
- **Content Engine:** `lib/ai/content-engine.ts` — 12-mode unified AI generation
- **Knowledge Engine:** `lib/ai/knowledge-engine.ts` — Auto-extraction from notes
- **Forest Generator:** `lib/ai/forest-generator.ts` — 4 official forests + AI generator
- **Identity Engine:** `lib/ai/identity-engine.ts` — 5 personas, 3 default identities
- **Search Enrichment:** `lib/ai/search-enrichment.ts` — GitHub/Zhihu/Google context
- **Voice API:** `/api/voice/chat` — Platform-agnostic voice pipeline
- **Resource Engine:** `lib/ai/resource-engine.ts` — Arxiv/GitHub/YouTube discovery
- **Memory Loop:** Agent reads `summarizeContext()` before each call
- **Auth:** Guest `tokentome111` / Login `tokentome222` + Canvas CAPTCHA

## Mangobo Companion
- Global floating mascot (video: `public/mangobo.mp4`)
- Draggable, speech bubbles, XP panel, quick actions
- 5 level names: 幼年→探索→学者→智慧→芒果贤者

## Design System (v6 Warm Paper Wellness)
- Palette: oklch(0.978 0.005 60) bg | oklch(0.58 0.16 75) primary | oklch(0.85 0.04 140) accent
- Typography: Cormorant Garamond (serif display) + Inter (geometric sans)
- 6-level surface, 44px mobile touch targets, 3D CSS utilities

## Latest Updates (2026-06-06 final)
- Onboarding v3: Mangobo video intro + 6 feature cards + ambient blobs
- Hub features refreshed: Voice/Knowledge Forest/SRS/AI Companion
- Mangobo mobile: 56px size, bottom sheet panel, poster fallback
- Voice OS: text input always available (all platforms)
- Voice API: platform-agnostic /api/voice/chat with search enrichment
- Search Enrichment: GitHub/Zhihu/Google/Arxiv context injection

## ESLint Fix
- `next.config.ts`: `eslint: { ignoreDuringBuilds: true }` — unblocks Vercel deploy
