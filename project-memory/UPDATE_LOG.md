# MangoLearningOS — Update Log

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
