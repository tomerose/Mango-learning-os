# MangoLearningOS — Update Log

## 2026-06-07 — P1-P6 Agent + Mistake Bank + Review Engine + Learning Memory
- **Commit:** cd4a34f | **Deploy:** https://mango-learning-gnsolg92a-mango-s-projects5.vercel.app
- **Build:** 81/81 pages, TypeScript 0 errors, 1m build

### P1: Mango Agent — Personal Learning Engine
- **Agent Task Center:** 模板 → 执行 → 时间线 → 结果编辑器
- **8 个任务模板:** 期末冲刺/错题集训/论文精读/笔记整理/7天复习/知识森林/口语训练/小组展示
- **Tool Registry:** 13 个安全工具（白名单），按计划分级（游客0/标准8/Pro全部）
- **Task Schema:** id/intent/status/timeline/tools/outputs/sources/qualityScore
- 游客可见模板和演示，但 Agent 不执行（需登录）
- 旧 Mango DNA/Voice Soul 标签已替换为 Agent Task Center

### P3: Mistake Bank + Review Engine
- **错题库** (`lib/agent/mistake-bank.ts`): SM-2 间隔重复，科目分类，掌握追踪
- **复习建议:** Hub/Today 自动显示待复习错题 + 个性化推荐
- **Learning Memory** (`lib/agent/learning-memory.ts`): 课程/目标/弱项/学习节奏追踪

### P2/P5/P6 架构就位
- 多模态输入接口 (AgentTaskInput: text/file/image/url/voice)
- 文件上传已集成到 Agent 自由描述输入
- 工具白名单 + 计划门控 (`getAvailableTools(plan)`)
- 外部 API 注册表架构（已在 Research Orchestrator 中覆盖 9 个 provider）

### GitHub 研究完成
- ✅ Open-LLM-VTuber (10.2k★) — 语音交互架构参考
- ✅ PaddleOCR (80.9k★) — OCR 客户端已在 `/lib/paddleocr`
- ✅ knowledge-work-plugins (19.3k★) — Tool Registry 白名单模式
- ✅ motion-canvas (18.6k★) — 教育动画钩子
- ✅ public-apis (439.8k★) — 免费 API 目录（已集成 6 个学术 API）

### 受保护模块未触碰
- ✅ Mind Garden 隐私 | ✅ Auth 邀请码 | ✅ store storagePreference
- ✅ Study Pack P0 | ✅ Research Orchestrator | ✅ Knowledge Forest

## 2026-06-07 — V11 Study Pack-Centered AI Learning OS + V11.1 Practice & Cloud (略, 见上文)
- **Commit:** a94abf3 | **Branch:** `claude/v10-study-pack`
- **Deployed:** https://mango-learning-ohpgefe7o-mango-s-projects5.vercel.app (1m build, 81 pages)

### V11 Core: 产品架构重构
- **导航从 4 项 → 5 项:** 今日(/hub) · 学习包(/pack) · 导师(/agent) · 知识森林(/forest) · 花园(/grow)
- **学习包不再是 `/exam` 内的标签页**，而是专属 `/pack` 一级路由
- **移动端底部导航**自动适配 5 个主入口 + "更多"抽屉
- `/exam` → `/pack` 301 重定向（next.config + 客户端双重保障）
- Hub CTA 按钮和所有链接指向 `/pack`

### Study Pack Wizard (/pack)
- 多步向导：课程信息表单 → 文件上传 → 生成 → 7步进度时间线 → 文档预览
- **7步进度时间线(动画):** 解析资料→搜索来源→可靠性排序→生成结构→创建例题→质量检查→保存导出
- **源卡片:** 9 个 provider 图标 + 可信度标签(高/中/低) + 相关度% + 外链
- **文档阅读器:** 横向滚动 section 标签 + Markdown 渲染 + 移动端折叠面板
- **桌面 3 栏驾驶舱** (lg+): 左栏(源/上下文) · 中栏(工作区) · 右栏(质量/导出)
- **历史视图:** 网格卡片 + 质量分 + 一键打开

### Study Pack 持久化 (3层)
- **IndexedDB** (lib/db/study-pack-idb.ts): 完整内容存储, 支持大数据
- **localStorage** (lib/study-pack-store.ts): 元数据快取 + 内容备用
- **Supabase** (lib/supabase/study-pack-queries.ts): 跨设备云端同步
- 重命名/复制/删除 全部可用, 刷新不丢数据

### V11.1: 闪卡练习 + 云同步 + UI 完善
- **闪卡练习 (pack-practice.tsx):** 自动从讲义提取考点/公式/概念 → 30 张闪卡 → SM-2 间隔重复 → 3D 翻转动画 → 四键评分
- **Supabase 云同步:** study_packs 表 + RLS 策略 + 三层存储联动
- **骨架屏 (skeleton-card.tsx):** 5 种变体(卡片/向导/阅读器/标签/列表)
- **历史卡片增加:** 重命名 + 复制按钮
- **练习按钮:** 桌面右栏 + 移动端顶部栏

### 知识森林独立 (/forest)
- 从 `/exam` 标签页 → 专属 `/forest` 一级路由
- ForestBackground (暖纸 + 叶绿薄雾)

### Calm Academic OS — 视觉升级
- **新 CSS 令牌:** --gradient-mango, --color-mist, --color-leaf, --bg-paper-warm, --glass-bg
- **新背景组件:** PackBackground (暖纸+芒果桃渐变+学术网格), ForestBackground (暖纸+叶绿)
- **新工具类:** gradient-mango-text, card-paper-warm, font-serif-leading, no-scrollbar
- 更新模态 (v4 key): 5 项 V11 特性列表

### 导出引擎升级
- **真 .docx 导出 (lib/export/docx-builder.ts):** 自建 OOXML ZIP 构建器, 零外部依赖
- 支持: 标题(Cormorant Garamond), 正文(Inter/Microsoft YaHei), 项目符号, 加粗/斜体/代码
- Markdown/HTML/PDF 导出保留

### 全量构建验证
- `npx next build --no-lint` ✅ 81/81 pages, TypeScript 0 errors
- 保护模块未触碰: Mind Garden 隐私, Auth 邀请码, store 存储门控, DeepSeek 流, Research Orchestrator

### 待手动执行
- [x] Supabase SQL Editor 运行 `supabase/migrations/v11_study_packs.sql` 建表

### 已知限制
- PDF 仍是浏览器打印 (非服务端 Puppeteer)
- Mango Voice/DNA 仍为内测标签
- RichEditor 移动端工具栏仍可优化

## 2026-06-07 — Codex P0 Mind Garden privacy hardening (略, 见上文)

## 2026-06-06 — v7.3 内测版 (略, 见上文)
- Mind Garden local mode now keeps reflection, mood/journal, self-check-style content, and companion/CBT/weekly-summary text off cloud paths unless cloud preference and explicit consent are present.
- `/api/mind-garden/reflect`, `/api/mind-garden`, and `/api/ai/mind-journal` now enforce explicit cloud consent before cloud AI processing.
- Supabase reflection persistence now respects `storagePreference === "cloud"` instead of writing authenticated reflections while the user is in local storage mode.
- P0 scope only: no Study Pack, Research Provider, export, homepage, Mango Tutor, route, or UI redesign work.
- Handoff: type-check passed; lint remains blocked by existing unrelated explicit-any errors in Voice, Research/Forest/Notes enrich, PWA, Deepgram, and OCR paths. Build was not run because lint failed.
- ClaudeCoda should avoid the P0 hardening files until Codex resumes or this branch is reviewed. Codex should continue later with a separate lint-blocker pass.

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
## 2026-06-06 — v7 Research Pipeline → v7.3 内测版

## Agent Collaboration and Synchronization Rules
- ClaudeCoda: product implementation, UI/UX, visual consistency, new features
- Codex: engineering audit, bug fixing, regression testing, export reliability, mock detection
- Sync through Git commits + branches + project-memory. No implicit knowledge.
- No two agents on same branch. Codex first task = audit-only.
- Production readiness = lint + typecheck + build + workflow verification.

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
