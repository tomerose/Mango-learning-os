# MangoLearningOS — 功能·交互·UI 完整手册

**版本: V6 Final | 部署: https://mangoleaningos.top | 日期: 2026-06-06**

---

## 一、产品概述

MangoLearningOS 是一个 AI 原生的个人学习操作系统。核心理念：**把焦虑变成准备。**

设计参考: Headspace / Calm / Readwise / Apple Journal / Linear
技术栈: Next.js 15.5 + React 19 + Tailwind CSS 4 + Supabase + DeepSeek AI + Deepgram Voice

---

## 二、系统架构 (6 窗口 + Voice OS)

| 窗口 | 路由 | 定位 |
|------|------|------|
| **Mangosum** | `/hub` | 学习仪表盘 — 每日概览 |
| **Mango Tutor** | `/agent` | AI 学习伴侣 — 对话/身份/技能 |
| **Mangoing** | `/exam` | 知识操作系统 — 森林/网络/笔记 |
| **Mango Plan** | `/planner` | 执行系统 — 任务/计划/考试/闪卡 |
| **Mango Friend** | `/grow` | 心灵花园 — 日记/情绪/CBT/陪伴 |
| **Mango Voice** | `/voice` | 全屏语音 OS — 实时对话 |
| **Mango Profile** | `/profile` | 个人中心 — XP/成就/统计 |

---

## 三、完整学习闭环

```
Learn → Capture → Connect → Practice → Master → Evolve
```

| 环节 | 输入 | 输出 | 涉及窗口 |
|------|------|------|---------|
| **Learn** | 用户问题/语音/森林选择 | AI 6 步结构化回答 + 语音播报 | Agent / Voice |
| **Capture** | 对话内容 | 结构化笔记 + 自动标签 + 自动闪卡 | Agent → Exam |
| **Connect** | 笔记标签 | 3D 球面知识网络 (学科→概念→笔记→资源) | Exam |
| **Practice** | 闪卡数据 | SM-2 间隔重复 (again/hard/good/easy) | Planner |
| **Master** | 考试资料 | AI 生成复习包 + 模拟考 + 弱项分析 | Planner |
| **Evolve** | 学习数据 | 技能树 + XP 等级 + 芒宝进度 | Agent / Profile |

---

## 四、各窗口功能详情

### 4.1 Mangosum (`/hub`)

**输入:** 用户每日登录
**输出:** 今日概览 + AI 推荐 + 自主决策

| 模块 | 功能 | 用户交互 |
|------|------|---------|
| Hero 卡片 | 问候语 + 日期 + streak + XP 条 | 查看 / 点击芒宝打开 Magic |
| Life Command Center (V9) | 关键行动 / 风险预警 / 强制执行任务 / 日程 | 点击执行 / 展开详情 |
| Cognitive Flows (V10) | English Flow / World Intelligence / Learning Plan | 点击流程 → 加载 RSS 内容 |
| 今日学习 | 任务计数 + 闪卡计数 + 学习分钟 | 点击跳转对应页面 |
| 核心能力 | Voice / 森林 / SRS / AI 伴侣 | 点击跳转 |
| 学习空间 | 6 个模块卡片 | 点击跳转 |
| 芒宝伴侣 | 视频动画 + 语音气泡 + 快捷面板 | 拖拽 / 点击打开面板 |

### 4.2 Mango Tutor (`/agent`)

**输入:** 用户文字/语音 + 科目选择 + 身份选择
**输出:** AI 流式回答 + 知识捕获 + 计划生成

| 模块 | 功能 | 用户交互 |
|------|------|---------|
| AI 对话 | DeepSeek 流式对话 (6 步教学框架) | 输入 → SSE 流式输出 |
| 概念讲解 | 结构化解释任何概念 | 输入主题 → 生成 |
| 智能练习 | AI 生成选择题 + 自动评分 | 逐题作答 |
| 知识导入 | 上传 PDF/DOCX → 提取文字 → 保存笔记 | 拖拽文件 |
| 学习身份 | 3 个默认身份 (IELTS/AI/TOPIK) + 5 个人格 | 点击选择 |
| DNA 技能树 | SVG 进度环 + 可点击技能 → 4 操作 | 点击技能 |
| 知识捕获 | 对话后 "保存到知识库" 按钮 | 一键保存 |
| 计划生成 | 对话后 "生成学习任务" 按钮 | 一键生成任务 |

### 4.3 Mangoing (`/exam`)

**输入:** 笔记 + 标签 + 学习目标
**输出:** 知识森林 + 知识网络 + 资源推荐

| 模块 | 功能 | 用户交互 |
|------|------|---------|
| 知识森林 (3D) | 学科大球 → 概念小球 → 笔记面板 | 鼠标拖动旋转 / 点击展开 |
| 知识网络 (4 层) | 学科 → 概念节点 → 笔记 → 资源推荐 | 逐层点击展开 |
| 笔记 | 创建/查看/标签管理 | CRUD 操作 |
| 资源 | 外部链接 + AI 资源推荐 | 添加/删除 |
| AI 森林生成器 | 输入目标 → AI 生成完整知识体系 | 输入 + 点击生成 |
| 官方森林 | IELTS/TOEFL/AI/CFA (4 个) | 一键加载 |

### 4.4 Mango Plan (`/planner`)

**输入:** 任务 / 学习目标 / 考试资料
**输出:** 任务列表 + AI 计划 + 闪卡复习 + 考试包

| 模块 | 功能 | 用户交互 |
|------|------|---------|
| 任务管理 | 添加/勾选/优先级/科目 | CRUD + 复选框 |
| AI 计划生成 | 目标 → AI 结构化计划 | 输入 + 点击生成 |
| 考试备战 | 上传资料 → AI 生成复习包 → 练习 | 6 步流程 |
| 闪卡复习 | SM-2 + 3D 翻转 | 点击翻转 → 四级评分 |

### 4.5 Mango Voice (`/voice`)

**输入:** 语音 (Chrome/Edge) 或 文字 (所有浏览器)
**输出:** AI 语音回答 + 对话历史 + 知识保存

| 功能 | 技术 | 用户交互 |
|------|------|---------|
| 实时语音对话 | Deepgram STT → DeepSeek AI → TTS | 点击麦克风 → 说话 → 自动识别 |
| 文字回退 | 输入框始终可见 | 输入 + 发送 |
| 5 种人格 | IELTS/韩语/AI/创业/学术 | 顶部芯片切换 |
| 对话保存 | "保存到知识库" | 一键保存 |
| 实时搜索增强 | Wikipedia + DuckDuckGo → AI prompt | 自动运行 |

### 4.6 Mango Friend (`/grow`)

**输入:** 心情/日记/负面想法
**输出:** 情绪追踪 + CBT 重构 + AI 陪伴

| 模块 | 功能 | 用户交互 |
|------|------|---------|
| 日记 | 心情选择 + 文字日记 | 输入 + 保存 |
| 情绪追踪 | 7 日心情时间线 | 查看 |
| CBT 重构 | 负面想法 → AI 认知重构 | 输入 → 生成 |
| AI 陪伴 | 暖心对话 | 输入 → 回复 |

---

## 五、全局系统

| 系统 | 说明 |
|------|------|
| **芒宝伴侣** | 视频动画 + 右下角浮动 + 可拖拽 + 语音气泡 + 快捷面板 + 等级系统 |
| **设计系统** | 暖纸调色板 (oklch) + Cormorant Garamond 衬线 + Inter 无衬线 + 6 层表面 |
| **认证** | Guest (tokentome111) / Login (tokentome222) + 图形验证码 |
| **数据** | Guest localStorage 50 次 / Cloud Supabase 自动 seed + 登录合并 |
| **AI** | Content Engine 统一 (12 模式) + Memory 闭环 + 7 要素质量验证 |
| **Voice** | Deepgram API (生产) + 浏览器 STT (回退) + SpeechSynthesis TTS |
| **搜索** | Wikipedia + DuckDuckGo + Arxiv (免费, 无需 Key) |
| **PWA** | manifest + service worker + 安装提示 → 原生 App 体验 |

---

## 六、设计系统

### 色彩

| 用途 | 色值 |
|------|------|
| 背景 | `oklch(0.978 0.005 60)` 暖纸白 |
| 主色 | `oklch(0.58 0.16 75)` 芒果琥珀 |
| 辅色 | `oklch(0.85 0.04 140)` 鼠尾草绿 |
| 文字 | `oklch(0.25 0.03 140)` 深森林石板 |

### 排版

| 层级 | 字体 | 桌面字号 | 手机字号 |
|------|------|---------|---------|
| Display | Cormorant Garamond | clamp(2rem, 5vw, 3.5rem) | 1.75rem |
| Title | Cormorant Garamond | clamp(1.5rem, 3.5vw, 2.125rem) | 1.375rem |
| Body | Inter | 0.9375rem | 0.9375rem |
| Caption | Inter | 0.75rem | 0.75rem |

### 6 层表面

| 层级 | 用途 | 样式 |
|------|------|------|
| card-paper | 基础画布 | 纯背景 |
| card-card | 普通卡片 | 浅表面 + 细边框 |
| card-floating | 浮动卡片 | 阴影 + 边框 |
| card-glass | 毛玻璃 | blur + 半透明 |
| card-focus | 焦点 | 主色边框 + 光晕 |
| card-hero | Hero | 最大阴影 + 最大圆角 |

### 手机端适配

- 44px 最小触控区域
- Tab 水平滑动 + snap
- 卡片 1rem 内边距
- 3D 球面 340px 最大宽度
- 芒宝 56px + 底部留白
- 底部导航 + 安全区域

---

## 七、API 端点

| 端点 | 用途 |
|------|------|
| `/api/ai/chat` | AI 流式对话 |
| `/api/ai/generate` | 统一内容生成 (12 模式) |
| `/api/ai/agent` | Agent 增强对话 + Memory |
| `/api/voice/chat` | Voice 聊天 (增强 prompt + 搜索) |
| `/api/voice/deepgram` | Deepgram 配置 + 可用性检查 |
| `/api/data/rss` | RSS 代理抓取 |
| `/api/data/daily-digest` | 每日摘要 (3 流) |
| `/api/data/structure` | AI 知识结构化 (Card/Chain/Tree) |
| `/api/data/ocr` | OCR 提取 (PaddleOCR 就绪) |
| `/api/cron/daily-digest` | Vercel Cron 定时任务 |

---

## 八、React Native 移动端计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| 1 | Expo SDK 52 + 设计 token 迁移 | 待开始 |
| 2 | Hub + 芒宝 Lottie + 水彩背景 | 待开始 |
| 3 | Voice OS + Deepgram SDK | 待开始 |
| 4 | 知识森林 + Skia 3D | 待开始 |
| 5 | 打磨: haptics + 字体 + 60fps | 待开始 |
