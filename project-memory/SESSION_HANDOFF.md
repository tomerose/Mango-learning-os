# MangoLearningOS — Session Handoff

> **Last session:** 2026-06-06 (v6 Warm Paper Wellness complete) | **Next session starts here**

## Quick Start
```bash
cd "D:\Claudecoda学习\AI-Learning-OS"
npm run dev -- -p 3030
# Tunnel: cloudflared tunnel --url http://localhost:3030 --no-autoupdate
# Production: https://mangoleaningos.top (Vercel auto-deploy)
```

## Current State
- **Version:** v7 Knowledge OS | **Commit:** `c7b0be2` on `main`
- **Stack:** Next.js 15.5 + React 19 + Tailwind 4 + shadcn/ui + Supabase + DeepSeek
- **Design System:** oklch warm paper palette, 6-level surface, Cormorant Garamond + Inter
- **TypeScript:** zero errors | **Build:** passing

## Architecture (7 Windows → 4-core)
| Route | Name | Key Changes v6 |
|-------|------|---------------|
| `/hub` | Mangosum | Hero card + AmbientOrbs SVG + FloatingParticles + StaggerReveal |
| `/agent` | Mango Tutor | Warm-paper tokens, PageTransition, unified Content Engine |
| `/exam` | Mangoing | 6-step StepWizard + 3D flashcard flip + SM-2 review |
| `/grow` | Mango Friend | De-emoji moods, watercolor blobs, PageTransition |
| `/planner` | Mango Plan | Warm-paper styling |
| `/dna` | Mango DNA | SkillTree SVG progress rings + demo data |
| `/profile` | Mango | Stats + achievements |

## Design System v6
- **Palette:** oklch(0.978 0.005 60) warm paper bg | oklch(0.58 0.16 75) mango amber primary
- **Secondary:** oklch(0.85 0.04 140) soft sage | **Text:** oklch(0.25 0.03 140) deep forest slate
- **Typography:** Cormorant Garamond (serif display) + Inter (geometric sans body)
- **6-level surface:** card-paper/card-card/card-floating/card-glass/card-focus/card-hero
- **Shadows:** 0 8px 30px rgb(0,0,0,0.04) per spec

## Key Components (12 premium)
- `components/ui/ambient-orbs.tsx` — SVG radial gradient orbs + floating particles
- `components/ui/learning-cards.tsx` — 6-step expandable concept cards
- `components/ui/step-wizard.tsx` — Horizontal step flow with AnimatePresence
- `components/ui/skill-tree.tsx` — SVG progress rings + organic branches
- `components/ui/motion-system.tsx` — StaggerReveal/FadeIn/ScaleIn/BreathingElement
- `components/ui/module-backgrounds.tsx` — 6 unique ambient backgrounds
- `components/layout/page-transition.tsx` — AnimatePresence route transitions
- `components/auth/captcha.tsx` — Canvas math challenge CAPTCHA

## Core Architecture
- **Content Engine:** `lib/ai/content-engine.ts` — 12-mode unified AI generation
- **Quality:** `lib/ai/quality.ts` — 7-element validation + LRU cache + retry
- **Templates:** `lib/ai/templates.ts` — Unified prompt templates with oklch theme
- **Memory Loop:** Agent route reads `summarizeContext()` before each call
- **Auth:** Guest `tokentome111`, Login `tokentome222`, CAPTCHA on signup
- **Data:** Cloud auto-seed demo data, Guest 50 actions

## v7 Knowledge OS Architecture
- **Knowledge Engine:** `lib/ai/knowledge-engine.ts` — AI auto-extraction from notes
- **KnowledgeNetwork v2:** 4-layer (Subjects→Concepts→Notes→Resources)
- **Mango Plan:** 3 tabs (Tasks / AI Plan / Flashcards)
- **Exam functions moved to Plan:** Flashcards, SM-2, Exam prep tools
- **Resource Intelligence:** auto resource recommendations per concept

## Known Gaps (next session)
- [ ] GSAP ScrollTrigger not fully utilized (useGsapScroll hook exists)
- [ ] Mobile verification needed on real devices (iPhone 15/16 Pro)
- [ ] StepWizard on exam page shows descriptions but doesn't control tab switching
- [ ] LearningCards in ConceptExplainer needs AI data flow to show content
- [ ] VoiceSoul/DNA distillation not connected to Agent system prompt
