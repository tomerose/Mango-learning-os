# MangoLearningOS — Session Handoff

> **Last session:** 2026-06-06 | **Next session starts here**

## Quick Start
```bash
cd "D:\Claudecoda学习\AI-Learning-OS"
npm run dev -- -p 3030
# Tunnel: cloudflared tunnel --url http://localhost:3030 --no-autoupdate
# Production: https://mangoleaningos.top (Vercel auto-deploy)
```

## Project State
- **Version:** 0.1 (Mango DNA stays as v2.0)
- **Commit:** 02aaa3c on `main`, pushed to `origin/main`
- **Stack:** Next.js 15.5 + React 19 + Tailwind 4.1 + shadcn/ui + Supabase + DeepSeek
- **TypeScript:** zero errors

## Architecture (7 Windows)
| Route | Name | Key Features |
|-------|------|-------------|
| `/hub` | Mangosum | Dashboard + Mango Magic (5 AI modes) + Onboarding |
| `/agent` | Mango Tutor | Chat · Explain · Practice · Knowledge Import + Subject Manager |
| `/exam` | Mangoing | Exam Prep + Notes + Flashcards + Resources + Knowledge Graph |
| `/grow` | Mango Friend | Mind Garden · AI Companion · Projects |
| `/planner` | Mango Plan | AI Plan Generation + Task Management |
| `/dna` | Mango DNA | AI Personality + Voice Soul Distillation |
| `/profile` | Mango | Stats · Achievements · Storage Pref · Cloud Sync |

## Key Files to Know
- `lib/store.tsx` — dual-mode state (guest localStorage / cloud Supabase), guest 2-use limit
- `lib/ai/client.ts` — OpenAI-compatible AI client (streamChat, completeChat, extractJson)
- `lib/ai/prompts.ts` — all system prompts including structured learning
- `lib/navigation-v2.ts` — nav items, redirect map, mobile nav
- `app/globals.css` — Morandi color palette, paper texture, mobile responsive
- `app/page.tsx` — root redirect (first visit → /login, subsequent → /hub)
- `components/auth/auth-form.tsx` — login/signup/guest with invite codes
- `components/onboarding/MangoOnboarding.tsx` — 5-stage welcome (first-visit only)

## Invite Codes
- Guest mode: `tokentome111`
- Login/Register: `tokentome222`

## Guest Limits
- 2 total actions (addNote, addTask, generate, etc.)
- Counter persisted in localStorage (`mango-guest-action-count`)
- Ref-based for instant reads (no race condition)

## Project Memory System
Read/write these before/after every task:
- `project-memory/PROJECT_STATE.md` — architecture reference
- `project-memory/FEATURES.md` — complete feature inventory
- `project-memory/BUGFIX_HISTORY.md` — bug history + known issues
- `project-memory/UPDATE_LOG.md` — chronological update history
- `project-memory/REGRESSION_CHECKLIST.md` — verify before push
- `project-memory/SESSION_HANDOFF.md` — this file

## Workflow
1. `cd D:\Claudecoda学习\AI-Learning-OS`
2. `npm run dev -- -p 3030`
3. `cloudflared tunnel --url http://localhost:3030 --no-autoupdate`
4. Develop → verify via tunnel → user approves → git push → Vercel deploy
5. Never overwrite existing features. Always log changes. Stability > new features.
