# MangoLearningOS — Update Log

## 2026-06-06 — v7.3 内测版
- **Branding:** 版本号改为"内测版"，update modal 重新触发
- **Auth 邀请码重构:**
  - 游客/首次进入: `sillyfind2025` (原 tokentome111)
  - 登录/注册: `tokentome222` (不变)
  - verifyCode 改为模式强制匹配：登录只能用登录码，游客只能用游客码
- **YouTube → Bilibili + 抖音:** 免费中文视频搜索，无需 API Key
- **Mind Garden v2 UI:** `/grow` 新增「心灵花园 Pro」标签页，10 模式选择器 + 危机检测卡片 + 隐私切换
- **Research Orchestrator:** 新增 Open Library + Free Dictionary + Gutendex 3 个免费 provider（共 9 个）

## 2026-06-06 — v7 Research Pipeline
- **Research Orchestrator:** Multi-source pipeline (query expansion → 5 providers → dedup/rank/score → AI synthesis)
- **Content Quality Engine v2:** 7-gate validation (relevance/grounding/structure/completeness/anti-generic/formatting/actionability)
- **Feature Output Contracts:** Standardized output specs for exam-review, tutor, mind-garden, knowledge-capture, career, research
- **Exam Review Module:** Full pipeline — course input → online research → 18-section handout → Word/PDF/MD export
- **Mind Garden v2:** 10 safe modes (journal/vent/structured/CBT/grounding/breathing/sleep/self-compassion/stress/mood-report), crisis detection, privacy-first
- **Knowledge Forest v4:** Notion-style redesign with sidebar + 5 content tabs + multi-source community import (file/URL/manual)
- **Rich Text Editor:** Notion-like with formatting toolbar, edit/preview toggle, properties panel, cover image, tag management
- **Official Forests:** Massively enriched — IELTS (12 topics/10 notes/14 flashcards), AI Engineer (12/6/8), CFA L1 (10/5/6), TOEFL (7/2/3)
- **New API routes:** `/api/exam-review/generate`, `/api/exam-review/export`, `/api/mind-garden/reflect`, `/api/forest/enrich`
- **New libs:** `research-orchestrator.ts`, `content-quality-v2.ts`, `feature-contracts.ts`, `rich-editor.tsx`

## 2026-06-06 — v6 Warm Paper Wellness (complete redesign)
- **Commit:** 401368a | **Deployed:** https://mangoleaningos.top
- **Design System:** oklch warm paper palette, Cormorant Garamond + Inter, 6-level surface
- **New Components (12):** AmbientOrbs, FloatingParticles, LearningCards, StepWizard, SkillTree, MotionSystem, ModuleBackgrounds, PageTransition, Captcha, ContentEngine, Quality, Templates
- **Auth:** Guest `tokentome111` / Login `tokentome222` + Canvas CAPTCHA on signup
- **AI:** Unified Content Engine (12 modes), Memory read loop fixed
- **Data:** Cloud auto-seed demo data, Guest 50 actions
- **Flashcards:** SM-2 3D flip animation (perspective + rotateY)
- **Hub:** Hero card + SVG gradient orbs + floating particles + staggered reveals
- **Exam:** 6-step StepWizard, 3D flashcard review
- **DNA:** SVG SkillTree with demo data
- **Mind Garden:** De-emoji mood labels, watercolor backgrounds
- **Layout:** PageTransition AnimatePresence on hub/agent/grow

## 2026-06-06 — Push to Production (v0.1)
- **Commit**: 02aaa3c — 123 files, 20,521 insertions
- **Deployed**: https://mangoleaningos.top (Vercel auto-deploy)
- **Tunnel**: https://devoted-turning-citizen-specialist.trycloudflare.com
- **Project**: D:\Claudecoda学习\AI-Learning-OS

### Final fixes before push
- Exam practice tab: null-safe optional chaining, crash-free
- Guest invite code: `tokentome111` for guest, `tokentome222` for login
- Signout: sets guest cookie → seamless re-entry
- First visit → /login, subsequent → /hub via `mango_visited` cookie
- All 7 windows verified HTTP 200
- Mobile responsive: single-column, safe-area, overflow prevention
- Notes/Resources export: Word (.doc) + PDF (print dialog)
- Mind Garden companion: caring therapist prompt, no interrogation
- Premium Onboarding: first-visit only, localStorage persisted
- Version unified: v0.1 except Mango DNA (v2.0)

### Known issues (next session)
- [ ] Flashcards SM-2: needs user-generated flashcards to demonstrate
- [ ] Whisper API: ready architecture, needs OPENAI_API_KEY
- [ ] Some components lack skeleton loading states
- [ ] Voice Soul: voice cloning needs TTS integration (ElevenLabs/Cartesia)
- [ ] Mangoing 刷题训练 quick-quiz button: input + API call functional but UI needs polish

## 2026-06-05 — 去AI化 + UI/UX Pro Max 优化

### 去AI化（标签重命名）
- "AI 学伴" → "Mango Tutor" (nav label unchanged, internal references)
- "AI 陪伴" → "心灵树洞" (grow page, navigation)
- "AI 智能生成学习计划" → "智能生成学习计划"
- "AI 搜索资料" → "联网搜索"
- "AI 推荐" → "学习推荐"
- "AI 生成题库" → "智能出题"
- "AI 整理" → "自动整理"
- 语言聚焦结果非技术：用户看到的是功能而非技术标签

### UI/UX Pro Max 应用
- **E-Ink/Paper** 风格: 纸纹理、高对比度、无闪光动画
- **Nature Distilled** 风格: 陶土色系、暖调、有机材质感
- **Tactile Digital** 风格: active:scale-[0.98]、spring 反馈
- **AlertDialog**: 替换 window.confirm() 用于项目删除
- **Focus states**: focus-visible:ring-2 全项目应用
- **Hover states**: cursor-pointer + 暖色反馈
- **Design system**: persisted from ui-ux-pro-max research

### 新增组件
- `components/ui/alert-dialog.tsx` — Radix AlertDialog wrapper
- Dependency: `@radix-ui/react-alert-dialog`

## 2026-06-05 — Morandi × Approachable Luxury UI
- Complete color palette migration: cold blue-gray → warm clay Morandi
- Background: pure white → warm off-white (oklch 0.978/0.004/75)
- Primary: cool indigo → warm mango-orange (oklch 0.62/0.17/62)
- All semantic colors: sage success, dusty rose accent, clay muted
- Paper grain texture: SVG feTurbulence noise overlay (opacity 0.035)
- Card layering system: card-layered (3-level shadow) + card-stacked (bordered)
- Watercolor blob utilities: .watercolor-mango, .watercolor-sage, .watercolor-rose
- Animations slowed: 300ms normal (was 250ms), 500ms slow (was 400ms)
- HubWelcome: watercolor blob decoration behind greeting
- MagicButton: watercolor radial gradient glow
- Border-radius increased: card 1.5rem, button 1rem, modal 1.75rem
- Spacing expanded: xs 0.375rem, sm 0.625rem, md 1.125rem
- Dark mode: full Morandi warm-dark palette

## 2026-06-05 — Premium Onboarding
- 5-stage immersive welcome: Logo → Welcome → Features → Hub Preview → Enter
- Particle background (30 dots, mouse-follow, ambient float)
- Gradient light system (orange/purple/blue, 20-30s loops)
- Sequential feature card reveal (6 cards, 120ms stagger, spring hover)
- Framer Motion animations throughout (no bounce, Apple-style easing)
- localStorage persistence (7-day hide)
- Pure black background (#000000), elegant white-on-black typography
- Enter button breathing animation → fade exit to dashboard

## 2026-06-05 — V2.0 Final

### Renamed Windows
Mangosum / Mango Tutor / Mangoing / Mango Friend / Mango Plan / Mango DNA / Mango

### Mango Magic Integration (NEW)
- 🥭 Rotating mango ball button with SVG gradient, breathing glow, particle ring
- Full-screen Magic Card: 5 AI generation modes (3+2 grid)
- `/api/ai/magic` — orchestrator API calling DeepSeek
- Auto-saves generated content as notes

### Knowledge Base Moved
- All 4 knowledge tabs (Notes/Flashcards/Resources/Graph) now in Mangoing
- Mango Plan: pure planning focus (AI gen + task management)

### Login Data Fix
- Cloud accounts start with clean empty slate
- Guest mode retains demo data for feature showcase
- All hub widgets: conditionally show demo vs empty state based on mode

### UI Polish
- Sidebar brand: `favicon-32.png` + "Mango OS"
- All icons regenerated from 图标.png using sharp
- All placeholder text Chinese
- Mind Garden components fully Chinese

### Added Features
- Mango Magic 5-mode generation
- Exam web search + URL import
- AI plan generation (prompt + file upload)
- Subject manager in Agent
- Planner restored as standalone window
- DNA restored as standalone window

## 2026-06-04 — V1.3
- Notes import (Word/PDF/URL/AI organize)
- Contact card, update modal
- Design system v5

## 2026-06-03 — V1.2
- Flashcards SM-2 spaced repetition
- Knowledge graph tab
- Resources tab

## 2026-06-02 — V1.1
- Exam mode (question bank, practice, results)
- AI quiz generation
- Weakness analysis

## 2026-06-01 — V1.0
- Initial release
- Dashboard, AI Tutor, Study Planner, Knowledge Hub, Mind Garden, Mango DNA, Profile
- Supabase auth + dual-mode persistence
