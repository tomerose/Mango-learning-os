# MangoOS Product/Function/UI Status Report

**Generated:** 2026-06-07 | **Branch:** `claude/v10-study-pack` | **Commit:** `cabbf88`
**Report Type:** Read-only audit — no code modified

---

## 1. Product Positioning Summary

### What MangoOS Claims To Be
AI-native learning operating system for university students. Turns courses, files, exams, anxiety, and learning goals into concrete outputs.

### What It Actually Delivers
A Next.js web app with 7 windows + 50+ API routes. Real features: AI chat (DeepSeek), Knowledge Forest (static rich content), Notes CRUD (RichEditor), Mind Garden (10 modes with privacy), Research Orchestrator (9 providers). Partial features: Exam Review (API exists, UI wired, export works — but research provider quality varies). Broken/missing: Voice page (unstable on mobile), 7 parallel "exam" routes (confusing), mobile nav missing key pages.

### Main User Value Proposition
- Free AI tutor + knowledge organization for Chinese university students
- Privacy-first mental wellness (Codex P0 hardened)
- Self-contained — works without Supabase or API keys in guest mode

### Current Strongest Scenario
Knowledge Forest browsing (4 enriched official forests with real content) + Mind Garden Pro (10 modes, local privacy)

### Current Weakest Scenario
Exam Review end-to-end: requires AI_API_KEY, research quality depends on provider availability, Word export produces HTML-as-doc (not true .docx), PDF is browser print dialog only, no session history saved

---

## 2. Full Feature Inventory

### 2.1 Final Exam Review / Study Pack

| Property | Value |
|----------|-------|
| **Route** | `/exam` → "期末备考" tab |
| **Status** | **PARTIAL** — API functional, UI wired, export works |
| **Target problem** | Student needs complete exam review handout from course info |
| **Required input** | courseName (required), school/professor/textbook/examScope/targetScore/timeLeft (optional), uploaded files |
| **Actual input** | Form fields + file upload (Word/PDF/MD via `/api/notes/import/file`) |
| **Expected output** | 18-section study handout: cover, TOC, overview, scope map, knowledge graph, chapters, logic framework, high-freq points, formula table, problem methods, examples, traps, checklist, review plan, mock exam, answer key, sprint sheet, references |
| **Actual output** | JSON with all 18 sections + Word/PDF/MD export |
| **Uses real data?** | ✅ Uses Research Orchestrator (9 providers, real HTTP calls) + AI synthesis |
| **Saves history?** | ❌ No session persistence — generated content lost on page refresh |
| **Supports export?** | ✅ Word (.doc as HTML), PDF (browser print), Markdown, HTML |
| **Known issues** | Research providers may return empty results; Word export is HTML-wrapped not true .docx; PDF is browser print dialog only; quality score displayed but regenerated content not persisted |
| **Files involved** | `app/api/exam-review/generate/route.ts`, `app/api/exam-review/export/route.ts`, `components/knowledge-hub/exam-review-tab.tsx`, `lib/ai/research-orchestrator.ts`, `lib/ai/content-quality-v2.ts` |

### 2.2 Research Orchestrator

| Property | Value |
|----------|-------|
| **Status** | **REAL** — 9 providers, real HTTP calls, real AI synthesis |
| **Providers** | DuckDuckGo (Web), GitHub API, arXiv API, Bilibili API, Douyin (URL fallback), Open Library API, Free Dictionary API, Gutendex API, Local Files |
| **Actual behavior** | Query expansion → parallel provider search → dedup by URL → relevance scoring → reliability scoring → AI summarization per source → synthesized context |
| **Known issues** | GitHub rate-limited to 60 req/h without token; Bilibili API may return empty for niche queries; Douyin has no real API — only search URL; provider errors silently caught (no user-facing degradation indicator) |
| **Files** | `lib/ai/research-orchestrator.ts` |

### 2.3 Content Quality Engine v2

| Property | Value |
|----------|-------|
| **Status** | **REAL** — 7-gate validation, runs on exam review output |
| **Gates** | Feature relevance, source grounding, structure, completeness, anti-generic, formatting, actionability |
| **Actual behavior** | Validates content after generation → returns QualityReport with pass/fail + score + per-gate details + regeneration prompt builder |
| **Known issues** | Only applied to exam-review; not wired to Mango Tutor, Mind Garden, or other content generators |
| **Files** | `lib/ai/content-quality-v2.ts` |

### 2.4 Exam Review Export

| Property | Value |
|----------|-------|
| **Status** | **PARTIAL** — Functional, but formats are workarounds |
| **Formats** | docx (HTML-in-.doc wrapper), pdf (print dialog), md (true Markdown), html (true HTML) |
| **Word quality** | Opens in Word/WPS but is HTML, not native .docx. Images/formulas may not render correctly. |
| **PDF quality** | Requires user to print from browser. No server-side PDF generation (no puppeteer/react-pdf). |
| **Files** | `app/api/exam-review/export/route.ts` |

### 2.5 Mango Tutor (/agent)

| Property | Value |
|----------|-------|
| **Status** | **REAL** — Streaming AI chat via DeepSeek |
| **Features** | AgentChat (SSE streaming), ConceptExplainer (structured explanation), ExerciseGenerator (quiz gen), MistakeAnalyzer, DocumentImporter |
| **Uses real AI?** | ✅ DeepSeek via `lib/ai/client.ts` — real API calls when AI_API_KEY is set |
| **Mock fallback** | Deterministic mock stream when no API key (clearly labeled "演示模式") |
| **Known issues** | No research grounding by default; ConceptExplainer doesn't use Research Orchestrator; DocumentImporter only extracts raw text |
| **Files** | `app/(dashboard)/agent/page.tsx`, `components/agent/*`, `app/api/ai/chat/route.ts`, `app/api/ai/quiz/route.ts` |

### 2.6 Mind Garden (/grow)

| Property | Value |
|----------|-------|
| **Status** | **REAL + HARDENED** (Codex P0) |
| **Modes** | 10: journal, vent, structured, CBT, grounding, breathing, sleep, self-compassion, stress-recovery, mood-report |
| **Privacy** | Local mode: client-side crisis detection + local reflection generation, ZERO cloud calls. Cloud mode: requires explicit cloudConsent + privacyMode:"cloud" |
| **Crisis detection** | Dual-layer: client-side LOCAL_CRISIS_PATTERNS + server-side CRISIS_PATTERNS |
| **Emergency resources** | Chinese 24h hotlines displayed for crisis-level input |
| **Files** | `components/mind/mind-garden-v2.tsx`, `app/api/mind-garden/reflect/route.ts`, `components/mind/cbt-reframer.tsx`, `components/mind/ai-companion-chat.tsx`, `components/mind/weekly-summary-card.tsx`, `components/mind-garden/mind-garden-content.tsx` |

### 2.7 Knowledge Forest (/exam → 知识森林)

| Property | Value |
|----------|-------|
| **Status** | **REAL** — Rich static content + AI generation capability |
| **Official forests** | 4: IELTS 7.5+ (12 topics/8 resources/10 notes/14 flashcards), AI Engineer (12/8/6/8), CFA L1 (10/6/5/6), TOEFL 100+ (7/3/2/3) |
| **Content quality** | High — detailed 200-400 word notes, real resource URLs, structured flashcards |
| **Community forests** | localStorage-based upload with file/URL/manual import; persists across sessions |
| **UI** | Notion-style: sidebar + 5 content tabs (topics, notes, resources, learning path, flashcards) + inline editor |
| **Known issues** | Content is static (not enriched from web on each load); community forests shared via localStorage only (not cloud); forest generation uses AI but doesn't persist results |
| **Files** | `components/knowledge-hub/knowledge-forest.tsx`, `lib/ai/forest-generator.ts`, `app/api/forest/enrich/route.ts` |

### 2.8 Notes + Rich Editor (/exam → 笔记)

| Property | Value |
|----------|-------|
| **Status** | **REAL** — Full CRUD + RichEditor |
| **Editor features** | Formatting toolbar (bold/italic/underline/strikethrough/code/link), block toolbar (H1/H2/H3/lists/checkboxes/quotes/code blocks/hr), edit/preview toggle, properties panel (tags), cover image, AI enrich button |
| **Persistence** | localStorage (guest) / Supabase (cloud) |
| **Import** | File (Word/PDF/MD/Evernote/CSV), URL, paste — with AI auto-organize |
| **Export** | Word (.doc), PDF (print), all-notes bulk export |
| **Known issues** | AI enrich uses Wikipedia+DDG (not Research Orchestrator); cover image is URL-only (no upload) |
| **Files** | `components/knowledge-hub/notes-tab.tsx`, `components/knowledge-hub/rich-editor.tsx`, `app/api/notes/enrich/route.ts`, `app/api/notes/import/file/route.ts`, `app/api/notes/import/url/route.ts` |

### 2.9 Mangosum (/hub)

| Property | Value |
|----------|-------|
| **Status** | **REAL** — Dashboard with multiple widgets |
| **Components** | HubWelcome, MagicButton+MagicCard, LearningGoals, UpcomingExams, WeeklyChart, AI Recommendations, QuickActions, ActiveCourses |
| **Guest mode** | Shows demo data |
| **Cloud mode** | Starts empty (seeded on first login) |
| **Onboarding** | 3-stage: logo → greeting+features → enter. 7-day persistence. |
| **Known issues** | Many widgets are informational only; MagicCard has 5 modes but some are basic; chart is recharts with demo data |
| **Files** | `app/(dashboard)/hub/page.tsx`, `components/hub/*`, `components/onboarding/*` |

### 2.10 Mango Plan (/planner)

| Property | Value |
|----------|-------|
| **Status** | **PARTIAL** — AI plan generation works, task CRUD works |
| **Known issues** | Generated plans are AI text output (no structured persistence); tasks are simple CRUD; no calendar integration |
| **Files** | `app/(dashboard)/planner/page.tsx`, `components/study-planner/planner-content.tsx` |

### 2.11 Mango DNA (/dna)

| Property | Value |
|----------|-------|
| **Status** | **MOCK** — Static demo content, labeled "v2.0 即将上线" |
| **Known issues** | Not a real feature yet — placeholder UI |
| **Files** | `components/mango-dna/mango-dna-content.tsx` |

### 2.12 Mango Voice (/voice)

| Property | Value |
|----------|-------|
| **Status** | **PARTIAL** — Web Speech API, unstable on mobile |
| **Known issues** | iOS Safari blocks speechSynthesis without user gesture; Android Chrome chunks audio poorly; no Deepgram integration wired to main voice page; WeChat voice webhook exists but separate |
| **Files** | `app/(dashboard)/voice/page.tsx`, `app/api/voice/chat/route.ts` |

### 2.13 Legacy/Redirect Routes

| Route | Status | Redirects to |
|-------|--------|-------------|
| `/dashboard` | Redirect | `/hub` |
| `/ai-tutor` | Redirect | `/agent` |
| `/study-planner` | Redirect | `/planner` |
| `/knowledge-hub` | Redirect | `/agent` |
| `/exam-mode` | Redirect | `/exam` |
| `/exam-master` | Redirect | `/exam` |
| `/mind-garden` | Redirect | `/grow` |
| `/mango-dna` | Redirect | `/dna` |
| `/analytics` | Redirect | `/hub` |
| `/projects` | Redirect | `/grow` |
| `/mind` | Redirect | `/grow` |
| `/knowledge-tree` | Redirect | `/agent` |

---

## 3. Input-Output Contract Table

| Feature | User Input | Processing | Data Used | Output | Export | Save | Quality | Gap |
|---------|-----------|------------|-----------|--------|--------|------|---------|-----|
| **Exam Review** | Course name + scope + files | Research Orchestrator (9 providers) → AI synthesis → 18-section handout | Real web search + AI | Full study handout (JSON) | Word/PDF/MD/HTML | ❌ No session save | Gate-checked (7 gates) | No history; Word is HTML-as-doc; PDF is print-only |
| **Mango Tutor** | Text question | Direct AI call (DeepSeek) | AI knowledge only (no research grounding) | Streaming text | ❌ | ❌ (chat history in state only) | ❌ No QA | No research grounding; no export; no persistence |
| **Mind Garden** | Text + mode + mood | Local (client-side patterns) or Cloud (AI API with consent gate) | Real crisis patterns + AI (cloud mode) | Structured reflection | ❌ | ✅ localStorage or Supabase | ✅ Crisis detection + privacy | No export; no mood history graph; self-check not wired |
| **Knowledge Forest** | Topic selection or AI generation prompt | Static content (official) or AI generation | Pre-built content + optional AI | Structured forest JSON | ✅ Save to notes + flashcards | ✅ localStorage (community) | ❌ No QA | AI generation doesn't persist; enrichment optional |
| **Notes** | Title + body + tags + files | File parse + optional AI enrich | Wikipedia + DDG (not Research Orchestrator) | Note with tags | Word/PDF | ✅ localStorage or Supabase | ❌ No QA | AI enrich uses different pipeline than Research Orchestrator |
| **Planner** | Text goal + files | Direct AI call | AI knowledge only | Plan text + tasks | ❌ | ✅ localStorage or Supabase | ❌ No QA | No structured plan persistence; no calendar |
| **DNA** | None | Static demo | Mock data | Demo UI | ❌ | ❌ | ❌ | Not a real feature |

---

## 4. Desktop Web UI Report

### Homepage Information Hierarchy
- ✅ Onboarding flow (first visit) — clean, Apple-style
- ✅ Update modal — shows version + features
- ⚠ Hub has 8+ widgets — information density is high, no clear primary action
- ❌ No "continue where you left off" — user always starts fresh

### Navigation Clarity
- ✅ Desktop sidebar: 7 items with icons, labels, descriptions — clear
- ✅ 301 redirects for all legacy routes
- ⚠ "Mango Voice" in sidebar but unstable on desktop (no microphone flow)
- ❌ "Mangoing" label is confusing — contains Exam Review + Knowledge Forest + Notes + Resources

### Visual Consistency
- ✅ Consistent warm paper palette across all pages
- ✅ shadcn/ui New York variants throughout
- ✅ PageTransition + ModuleBackgrounds on all windows
- ⚠ Some legacy exam components still use old styling
- ❌ MagicCard overlay feels disconnected from the rest of the UI

### Feature Discoverability
- ❌ Exam Review is buried as a tab within `/exam` — hard to find
- ❌ Mind Garden Pro (10 modes) is a tab within `/grow` — not obvious it exists
- ❌ Knowledge Forest's 4 official forests hidden behind sidebar selection
- ✅ QuickActions on hub surface key modules

### Loading/Empty/Error States
- ⚠ Exam Review has researching animation but no progress percentage
- ⚠ Research Orchestrator silently swallows provider failures (no user-facing warning)
- ❌ Most pages lack skeleton loading states
- ❌ Mind Garden cloud mode — no loading indicator while waiting for AI

### Design System Consistency
- ✅ 6-level surface system (paper/card/floating/glass/focus/hero)
- ✅ Typography: Cormorant Garamond + Inter
- ✅ Consistent spacing scale
- ⚠ Unused icons imported in some components (lucide-react tree-shaking not guaranteed)
- ⚠ Some components use inline styles instead of Tailwind classes

---

## 5. Mobile UI Report

### Mobile Homepage
- ✅ Floating glass pill bottom nav (5 items)
- ✅ "更多" drawer for overflow items
- ❌ **Critical: Mangoing (考试备战) is NOT in mobile bottom nav** — the primary Exam Review feature is inaccessible from mobile without opening the drawer
- ❌ Mobile nav labels mismatch: navItemsV2[5] is Mango Voice, not Mango DNA

### Touch & Spacing
- ✅ Bottom nav has safe-area-inset-bottom padding
- ✅ Touch targets adequate (44px+) on nav items
- ⚠ Card padding can be tight on small screens (320px width)
- ⚠ Mode selector grid (Mind Garden) overflows on small screens — 5 columns too many

### Mobile Feature Flows
- ❌ Exam Review: form too wide for mobile; source cards require horizontal scroll
- ❌ Knowledge Forest: sidebar collapses on mobile — no way to navigate forests
- ⚠ Mind Garden: mode selector grid wraps awkwardly on small screens
- ⚠ Rich Editor: toolbar overflows horizontally on mobile
- ❌ Document reader (export preview): 600px max-height with overflow — not mobile-optimized

### Mobile-First Redesign Needed For
1. Exam Review — full form + source cards + section viewer
2. Knowledge Forest — sidebar navigation replacement
3. Mind Garden — mode selector (grid → scrollable pills)
4. Rich Editor — toolbar (horizontal scroll → dropdown menu)

---

## 6. MangoOS Unique Style Assessment

| Quality | Current | Notes |
|---------|---------|-------|
| Warm intelligence | ✅ | Warm paper + Morandi palette achieves this |
| Academic clarity | ⚠ | Good typography but content density hides clarity |
| Study cockpit feeling | ❌ | Hub has too many widgets; no focused "command center" |
| Soft productivity | ✅ | Gentle animations, spring transitions, rounded corners |
| Mango identity | ⚠ | Mango amber is used but subtly — not distinctive enough |
| Premium minimalism | ✅ | Generous whitespace, 8px grid, Apple-level spacing |
| Calm focus | ✅ | Slow animations, no jarring transitions |
| Companion-like (not childish) | ✅ | Professional tone, no emoji overload |
| Futuristic (not cold) | ✅ | Warm palette + clean layout |

**Key issue:** The product feels like a well-designed dashboard framework, not a distinctive Mango-branded learning OS. The 芒果 identity is too subtle.

---

## 7. Engineering Boundaries

### What Codex Changed (P0)
- Mind Garden privacy: local mode now client-side only, API requires explicit cloud consent
- `components/mind/mind-garden-v2.tsx` — added LOCAL_CRISIS_PATTERNS, LOCAL_EMERGENCY_RESOURCES, buildLocalReflection()
- `app/api/mind-garden/reflect/route.ts` — added cloudConsent gate
- `app/api/mind-garden/route.ts` — added cloud consent enforcement
- `app/api/ai/mind-journal/route.ts` — added cloud consent enforcement
- `components/mind/cbt-reframer.tsx` — blocks sensitive content before fetch in local mode
- `components/mind/weekly-summary-card.tsx` — blocks sensitive content before fetch
- `components/mind/ai-companion-chat.tsx` — blocks sensitive content before fetch
- `components/mind-garden/mind-garden-content.tsx` — saves locally instead of cloud analysis
- `lib/store.tsx` — gates Supabase reflection writes on cloud preference

### What ClaudeCoda Must NOT Overwrite
- Mind Garden privacy enforcement (all files listed above)
- Auth invite code logic (`components/auth/auth-form.tsx` — verifyCode mode-specific)
- `lib/store.tsx` storagePreference gating

### Safe for UI Work
- `components/knowledge-hub/exam-review-tab.tsx` — Exam Review UI
- `components/knowledge-hub/knowledge-forest.tsx` — Knowledge Forest UI
- `components/knowledge-hub/notes-tab.tsx` — Notes UI
- `components/knowledge-hub/rich-editor.tsx` — Rich Editor
- `app/(dashboard)/exam/page.tsx` — exam page tab structure
- `app/(dashboard)/hub/page.tsx` — hub layout
- `components/onboarding/MangoOnboarding.tsx` — onboarding flow
- `components/update-modal.tsx` — update modal content
- `components/layout/*` — navigation components

### Caution Required
- `lib/ai/research-orchestrator.ts` — provider behavior, don't break provider interfaces
- `app/api/exam-review/generate/route.ts` — generation pipeline, don't break section structure
- `app/api/exam-review/export/route.ts` — export format, don't break download

### Do NOT Touch
- `components/mind/*` — Codex P0 privacy hardened
- `components/mind-garden/*` — Codex P0 privacy hardened
- `app/api/mind-garden/*` — Codex P0 privacy hardened
- `app/api/ai/mind-journal/route.ts` — Codex P0 privacy hardened
- `components/auth/auth-form.tsx` — Auth codes + verify logic
- `lib/store.tsx` — storagePreference gating

---

## 8. Recommended UI Upgrade Plan

### P0: Must Fix Before UI Work
- [ ] Add session persistence to Exam Review (generated packages lost on refresh)
- [ ] Add Mangoing to mobile bottom nav (currently inaccessible)
- [ ] Fix mobile nav label: Mango Voice → correct label
- [ ] Fix Mind Garden mode grid overflow on small screens
- [ ] True .docx export (use docx.js or similar library — currently HTML-as-doc)

### P1: Desktop UI
- [ ] Dedicated Exam Review landing page (not buried as a tab)
- [ ] Hub simplification — reduce to 4-5 primary widgets
- [ ] "Continue where you left off" on hub
- [ ] Research progress timeline during generation (showing provider status)
- [ ] Source card redesign with reliability badges
- [ ] Document reader with proper typography and page-like layout

### P1: Mobile UI
- [ ] Responsive Exam Review form (single column, stacked)
- [ ] Mobile Knowledge Forest navigation (bottom sheet or full-screen picker)
- [ ] Rich Editor mobile toolbar (overflow menu instead of scroll)
- [ ] Mobile source cards (vertical stack instead of horizontal scroll)
- [ ] Mobile document reader with proper margins and font size

### P2: Visual Polish
- [ ] Stronger Mango brand identity (distinctive mango-inspired gradient treatment)
- [ ] Micro-interactions on key actions (generate, export, save)
- [ ] Skeleton loading states for all data-dependent components
- [ ] Empty state illustrations (not just text)
- [ ] Smooth page transitions between windows

### P2: Design System Cleanup
- [ ] Audit and remove unused component imports
- [ ] Consolidate duplicate "exam" components (exam-master, exam-mode, exam-workspace → exam-review-tab)
- [ ] Remove or hide Mango DNA until it's a real feature
- [ ] Remove or merge legacy redirect-only pages

### P3: Future
- [ ] Mango Voice → real-time Deepgram WebSocket (already have API key)
- [ ] Calendar integration for Mango Plan
- [ ] Collaborative community forests (Supabase-backed)
- [ ] Mobile PWA with offline support
- [ ] Mango mascot character (芒宝) Live2D integration

---

## 9. Final Recommendation

### Is MangoOS Ready for UI Upgrade?
**Yes, with caution.** The core infrastructure (Research Orchestrator, Quality Engine, Mind Garden privacy, export pipeline) is solid. UI work should preserve Codex P0 hardening and not touch auth/store/mind-garden backend. Focus on: Exam Review UX, mobile responsiveness, feature discoverability.

### Which Pages to Upgrade First
1. `/exam` — Exam Review deserves a dedicated, prominent entry point
2. `/hub` — Simplify, add "continue where you left off"
3. Mobile bottom nav — Add Mangoing, fix labels
4. Knowledge Forest mobile UX

### Features to Preserve
- Mind Garden Pro (10 modes + privacy) — Codex hardened, do not touch
- Knowledge Forest official content — rich, well-structured
- Notes + RichEditor — working well
- Auth flow — working, mode-specific invite codes

### Features to Merge or Hide
- Merge: exam-master + exam-mode → exam (already redirected, remove standalone pages)
- Hide: Mango DNA (not a real feature, labeled "v2.0 即将上线")
- Merge: knowledge-tree → knowledge-hub components (already redirected)

### Features NOT Real Enough to Highlight
- Mango DNA — purely mock/demo
- Mango Voice — unstable on mobile, not production-ready
- Career/Skill modules — don't exist yet (in feature contracts but not implemented)
- Weekly chart on hub — recharts with demo data only

### Next Concrete Task
**P0: Mobile nav fix + Exam Review session persistence**
1. Add Mangoing to `mobileNavItemsV2` (currently missing)
2. Fix mobile nav label mapping (Mango Voice vs Mango DNA confusion)
3. Save generated Exam Review packages to localStorage (guest) or Supabase (cloud)
4. Add "My Review History" section to Exam Review tab

---

## Files Inspected
`AGENTS.md`, `CODEX.md`, `project-memory/PROJECT_STATE.md`, `project-memory/FEATURES.md`, `project-memory/UPDATE_LOG.md`, `project-memory/BUGFIX_HISTORY.md`, `project-memory/REGRESSION_CHECKLIST.md`, `project-memory/AGENT_WORKFLOW.md`, `lib/navigation-v2.ts`, `app/api/exam-review/generate/route.ts`, `app/api/exam-review/export/route.ts`, `app/api/exam-master/route.ts`, `app/api/mind-garden/reflect/route.ts`, `components/mind/mind-garden-v2.tsx`, `components/layout/mobile-nav-v2.tsx`, `components/knowledge-hub/exam-review-tab.tsx`, all page routes, all API routes, all lib modules

## Files Changed
1 file created: `project-memory/MANGOOS_STATUS_REPORT.md`
No code modified. Read-only audit.
