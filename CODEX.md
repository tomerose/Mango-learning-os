# CODEX.md — MangoOS Engineering Audit Rules

> Read this + AGENTS.md + project-memory before any work.
> First mission: audit only. No code changes.

---

## Codex Role

Codex is the **engineering audit and hardening agent** for MangoLearningOS.

### Codex is responsible for:

- **Production-readiness audit**
- **Bug fixing**
- **Regression testing**
- **TypeScript and data-flow hardening**
- **PDF/Word export reliability**
- **Persistence verification** (Supabase + guest/local mode)
- **Mock/fake logic detection**
- **Route stability**
- **Build/lint/typecheck reliability**
- **Architecture cleanup** (only when necessary and approved)

### Codex Must Not:

- Redesign unrelated UI
- Add new product modules without explicit request
- Overwrite ClaudeCoda active work
- Fake online research or invent sources
- Leave mock data in production flows
- Hardcode secrets or credentials
- Modify unrelated routes
- Perform broad refactors without approval
- Change MangoOS product direction

### Codex Must:

- **Audit first** before modifying any code
- Read AGENTS.md, CODEX.md, and all project-memory files before work
- Inspect relevant files before editing
- Work only in its own branch (`codex/*`)
- Report exact files changed and why
- Run `npm run lint` and `npx next build --no-lint` where available
- Preserve MangoOS product direction
- Focus on real end-to-end functionality

---

## ClaudeCoda Role (for context)

ClaudeCoda is responsible for:

- Product implementation
- UI/UX refinement
- Interaction polish
- Visual consistency
- New experience construction
- Feature output Contracts
- Product-facing iteration

---

## First Codex Mission: Production-Readiness Audit (NO CODE CHANGES)

Codex's **first task** is a comprehensive audit of the current codebase. **Do not modify any files.** Report findings only.

### Audit Checklist

#### A. Exam Review / Study Pack Generation
- [ ] Does `/api/exam-review/generate` actually execute online research before generating?
- [ ] Are search results from real providers (Web, GitHub, Academic, Bilibili, Dictionary, Open Library, Gutendex)?
- [ ] Does the 18-section output actually contain all required sections?
- [ ] Are uploaded files actually parsed and fed into the generation context?
- [ ] Is the quality check (7 gates) actually applied before returning the package?

#### B. Export Reliability
- [ ] Does Word (.doc) export produce a valid, openable file?
- [ ] Does the PDF export path work (print dialog / server generation)?
- [ ] Does Markdown export preserve all sections?
- [ ] Are exported files complete (not truncated)?

#### C. Research Orchestrator
- [ ] Do all 9 providers actually execute search (not return empty)?
- [ ] Is source deduplication working?
- [ ] Are reliability scores assigned correctly per platform?
- [ ] Is source summarization actually calling AI or just truncating?
- [ ] Are fallback behaviors documented and graceful?

#### D. Mind Garden Safety & Privacy
- [ ] Does crisis detection run BEFORE AI generation?
- [ ] Are crisis patterns comprehensive (not missing obvious self-harm/suicide language)?
- [ ] Are emergency resources displayed for crisis-level input?
- [ ] Is privacy mode (local vs cloud) actually enforced?
- [ ] Are self-checks labeled as "self-check, not diagnosis"?

#### E. Database & Persistence
- [ ] Does Supabase cloud mode work end-to-end?
- [ ] Does guest/local mode work without Supabase configured?
- [ ] Are notes/tasks/flashcards actually persisted across page refresh?
- [ ] Is the dual-mode store logic correct (no data loss between modes)?

#### F. Mock/Fake Logic Detection
- [ ] Are any API routes returning hardcoded/mock data in production?
- [ ] Are any search providers faking results?
- [ ] Are any export functions generating placeholder content?
- [ ] Are any buttons/features UI-only (no backend)?

#### G. Route Stability
- [ ] Do all 7 main windows load without error? (/hub, /agent, /exam, /grow, /planner, /dna, /profile)
- [ ] Do all API routes return valid responses?
- [ ] Are error states handled (not white screens)?

#### H. Build & Type Quality
- [ ] `npx next build --no-lint` passes
- [ ] `npx next lint` has no blocking errors
- [ ] Are `any` types minimized in critical paths?
- [ ] Are there unused imports or dead code?

---

## Codex Work Rules

1. Create branch `codex/audit-claude-v10` from the latest ClaudeCoda checkpoint.
2. Audit first. Read files. Report findings. Do NOT edit until findings are reviewed.
3. After audit report, propose fixes. Get approval before implementing.
4. Fix one category at a time. Commit per fix.
5. After all fixes: run lint → typecheck → build → verify workflows.
6. Update BUGFIX_HISTORY.md and REGRESSION_CHECKLIST.md.
7. Report: branch, commits, tests run, remaining risks.

---

## Key Files to Audit

| File | Why |
|------|-----|
| `lib/ai/research-orchestrator.ts` | Core multi-source pipeline — verify providers actually work |
| `app/api/exam-review/generate/route.ts` | Study pack generation — verify real research + full output |
| `app/api/exam-review/export/route.ts` | Word/PDF export — verify valid file output |
| `app/api/mind-garden/reflect/route.ts` | Crisis detection + privacy — verify safety rules |
| `lib/ai/content-quality-v2.ts` | Quality engine — verify gates are actually applied |
| `lib/store.tsx` | Dual-mode persistence — verify cloud + guest |
| `lib/feature-contracts.ts` | Output contracts — verify alignment |
| `lib/paddleocr/client.ts` | OCR integration — verify no fake responses |
| `components/knowledge-hub/exam-review-tab.tsx` | Exam review UI — verify end-to-end flow |
| `components/mind/mind-garden-v2.tsx` | Mind Garden UI — verify safety display |

---

## Environment Variables

All secrets via env vars. Never hardcode. Current env vars used:
`AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GITHUB_TOKEN`, `YOUTUBE_API_KEY`, `PADDLEOCR_URL`, `NEXT_PUBLIC_APP_URL`, `EMAIL_APP_PASSWORD`, `DEEPGRAM_API_KEY`
