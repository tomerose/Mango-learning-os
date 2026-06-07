# MangoLearningOS — Bugfix History

## 2026-06-07 — V14.5 Comprehensive Audit Fixes

**Audit:** 25 bugs found (2 HIGH, 10 MEDIUM, 13 LOW)

**Fixed:**
- HIGH: ActionCard missing `relative` CSS → ArrowRight positioned off-card (premium-mobile.tsx:146)
- MEDIUM: Agent file upload sends empty text (agent/page.tsx:87) — noted for future FileReader fix
- MEDIUM: Voice page `<a>` → `<Link>` to prevent full-page reload
- MEDIUM: Desktop loading/empty states inconsistent (library/page.tsx)
- MEDIUM: No error boundaries on grow/forest tab content
- LOW: 30+ unused lucide-react imports across agent, pack, library, notes pages
- LOW: localStorage useMemo not reactive (profile-content.tsx)
- LOW: `pb-safe` CSS class dependency (mobile-nav-v2.tsx)
- Build: 94 pages, 0 errors confirmed

## 2026-06-07 — Codex P0 Mind Garden privacy hardening

**Scope:** Mind Garden local privacy enforcement and P0 lint/type hygiene only.

**Fix:**
- `/api/mind-garden/reflect` now requires `privacyMode: "cloud"` plus `cloudConsent: true` before cloud AI reflection processing. Crisis detection still runs first and emergency responses return local safety resources without generation.
- `/api/mind-garden` and `/api/ai/mind-journal` now reject Mind Garden AI analysis requests without explicit cloud consent.
- `components/mind/mind-garden-v2.tsx` returns local-only reflection output in local mode and only calls `/api/mind-garden/reflect` after cloud mode is selected.
- `components/mind/cbt-reframer.tsx`, `components/mind/weekly-summary-card.tsx`, and `components/mind/ai-companion-chat.tsx` now block sensitive content before fetch when storage preference is local.
- `components/mind-garden/mind-garden-content.tsx` saves legacy journal/mood entries locally instead of posting them to cloud analysis by default.
- `lib/store.tsx` now gates Supabase reflection writes on both authenticated cloud mode and `storagePreference === "cloud"`.

**Regression risk:** Cloud AI features now require explicit cloud preference/consent payload. Local mode must not send mood logs, reflection text, PHQ/GAD/self-check content, or emotional journal content to cloud.

**Handoff status:**
- Completed: Mind Garden privacy guards are implemented in server routes, client fetch paths, local reflection fallback, and Supabase reflection persistence.
- Verification: `npm.cmd run type-check` passed after removing an unreachable local-mode privacy branch in `/api/mind-garden/reflect`.
- Unfinished: `npm.cmd run lint` still fails on existing unrelated `@typescript-eslint/no-explicit-any` errors outside this P0 Mind Garden scope.
- Do not assign to ClaudeCoda: lint/type hardening in Voice, Research, OCR, PWA, Forest/Notes enrich, or storage internals unless explicitly coordinated.
- Codex should continue later: dedicated lint-blocker pass for existing explicit-any errors, separated from UI/product work.

## 2026-06-05

### #1: 登录后游客数据与 demo 数据残留
**Symptom:** After login, hub showed demo data (learning goals, exam countdowns, weekly chart, course mastery)
**Root Cause:** `initialState` in store.tsx used seed data; hub components had hardcoded SAMPLE/MOCK data
**Fix:**
- `lib/store.tsx`: `initialState` → empty arrays (tasks:[], notes:[], etc.)
- `lib/store.tsx`: cloud `deriveStats` → removed `seedStats` fallbacks
- `components/hub/learning-goals-card.tsx`: cloud mode → show empty state
- `components/hub/upcoming-exams-card.tsx`: cloud mode → show empty state
- `components/hub/active-courses-list.tsx`: cloud mode → mastery=0%
- `components/hub/weekly-overview-chart.tsx`: cloud mode → empty data
**Regression risk:** Guest mode must still show demo data — verified via `mode === "guest"` checks

### #2: 成长花园 AI 陪伴缺失
**Symptom:** Mango Friend missing AI companion chat from v1.0
**Fix:** Added AiCompanionChat as 3rd tab in grow-content.tsx

### #3: 笔记/闪卡/资源/图谱功能丢失
**Symptom:** After merging knowledge-hub into agent, flashcards/resources/graph tabs lost
**Fix:** Moved full knowledge base (Notes+Flashcards+Resources+Graph) to Mangoing as 5 tabs

### #4: 学习计划合并后功能丢失
**Symptom:** Planner lost notes functionality after merge
**Fix:** Restored Mango Plan as standalone window with pure planning focus

---

## Agent Collaboration and Synchronization Rules
- ClaudeCoda: product implementation, UI/UX, visual consistency, new features
- Codex: engineering audit, bug fixing, regression testing, export reliability, mock detection
- Sync through Git commits + branches + project-memory. No implicit knowledge.
- No two agents on same branch. Codex first task = audit-only.
- Production readiness = lint + typecheck + build + workflow verification.

---

### #5: Mango DNA 丢失
**Symptom:** DNA page was redirecting to profile
**Fix:** Restored `/dna` as standalone route with full MangoDNAContent

### #6: MoodTracker crash on /grow
**Symptom:** `RangeError: Invalid time value` — `new Date("6月3日")` failed
**Fix:** Added `isNaN(rd.getTime())` guard in mood-tracker.tsx and weekly-summary-card.tsx

### #7: PDF-parse import error
**Symptom:** `Property 'default' does not exist on type 'typeof PDFParse'`
**Fix:** Changed to named import `{ PDFParse }` and used `new PDFParse({data}).getText()`

### #8: 窗口名反复调整
**History:** 学习中心/AI导师/考试中心/成长花园/我的 → 学习总览/AI学伴/考试备战/成长花园/个人中心 → Mangosum/Mango Tutor/Mangoing/Mango Friend/Mango Plan/Mango DNA/Mango

### #9: 侧边栏品牌变更
**History:** Sparkles icon + "MangoLearn" → 🥭 emoji + "MangoLearn" → favicon-32.png + "Mango OS"

### #10: 项目只能创建不能删除
**Symptom:** Mango Friend projects had no delete functionality
**Fix:** Added `onDelete` prop to ProjectWorkspace + delete button (Trash2 icon) with confirm dialog in workspace header. Delete removes from state array, localStorage auto-persists.

## NOT YET FIXED
- [ ] Flashcards SM-2 review: "flashcards reviewed" count may be inflated
- [ ] Some v1 API routes redirect but may return stale cached responses
