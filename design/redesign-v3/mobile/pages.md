# Mobile Page Architecture — v3 Redesign

## Global Shell
```
┌─ Floating Pill Header (surface-glass, rounded-full) ─┐
│  [Icon] 第三自习室 · 把焦虑变成准备    [Theme] [User] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Page Content (px-4, py-6)                           │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Floating Pill Bottom Nav (surface-glass, 6 tabs)    │
│  [首页] [AI导师] [考试] [知识库] [计划] [DNA]        │
└──────────────────────────────────────────────────────┘
```

## Pages

### Dashboard
- Greeting: caption date + heading-xl + body-text motd
- Stats: 2×2 grid, surface-card, icon-top, value-large
- Tasks: surface-card, checkbox-left, badge-right
- Weekly Goals: surface-card, progress bars
- Subject Progress: surface-card, donut charts
- Activity Feed: timeline, dot-icons
- Brand Card: surface-card, gradient-icon, tag pills

### AI Tutor
- 4-tab bar: 对话讲解 | 测验练习 | Mind Garden | Exam Master
- Chat: message bubbles (user=right/primary, ai=left/card), input-bottom
- Quiz: subject chips, difficulty selector, question cards
- Mind Garden: embedded sub-tabs (树洞 | 写日记 | 历史 | 洞察)
- Exam Master: embedded sub-tabs (创建 | 查看 | 历史)

### Mind Garden
- TreeHole: Leaf icon hero, prompt chips, chat bubbles (emerald accent)
- Journal: mood emoji selector (5 levels), textarea, analyze button
- CBT: thought input → structured result cards (evidence, distortion, plan)
- Insights: 7-day bar chart, stats 2×2 grid

### Final Exam Master
- Create: subject dropdown, upload zone (dashed border), paste textarea, generate button
- View: 5 sub-tabs (Overview, Knowledge Map, Chapters, Exam Prep, Cheat Sheet)
- History: card list, tap to reload

### Knowledge Hub
- 4-tab bar: 笔记 | 闪卡 | 资源 | 图谱
- Notes: 2-col card grid, add FAB
- Flashcards: deck cards, review session with flip
- Resources: add dialog, link list with subject badges
- Graph: subject tag bubbles, concept density bars

### Study Planner
- 4-tab bar: 每日 | 每周 | 每月 | 学期
- Daily: task list with subject-color stripe
- Weekly: horizontal progress bars per day
- Monthly: subject completion grid
- Semester: goal progress cards

### Exam Mode
- 3-tab bar: 题库 | 练习 | 成绩
- Bank: filter dropdown, question list, batch select
- Exercise: question card (MCQ options / fill-blank input / problem textarea)
- Results: score banner, per-question review, history stats

### Profile
- Avatar header with XP progress
- Stats 2×2 grid
- Achievement wall (unlocked/locked cards)
- Reflection list with mood badges

### Mango DNA
- Hero banner with icon
- 2×2 feature grid
- Creation steps timeline
- Persona card (traits, knowledge, meta)
- Agent gallery (2×2 cards with status)
