# MangoLearningOS — Bugfix History

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
