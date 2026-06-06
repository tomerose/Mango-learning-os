# MangoLearningOS — 产品功能与 UI 设计手册

**版本:** V6 Final | **部署:** https://mangoleaningos.top | **日期:** 2026-06-06

---

## 一、产品定位

MangoLearningOS 是 AI 原生的个人学习操作系统。设计理念：**把焦虑变成准备。**

- **设计参考:** Headspace / Calm / Readwise / Apple Journal / Linear
- **技术栈:** Next.js 15.5 + React 19 + Tailwind CSS 4 + shadcn/ui + Supabase + DeepSeek AI + Deepgram Voice
- **核心理念:** 不是 AI 工具，不是 SaaS 仪表盘 — 是温暖、专注、有陪伴感的学习环境

---

## 二、架构总览

| 窗口 | 路由 | 核心功能 |
|------|------|---------|
| **Mangosum** | /hub | Hero卡片 + 水彩光球 + 芒宝伴侣 + 今日学习 + 核心能力 + 学习空间 |
| **Mango Tutor** | /agent | AI对话 + 概念讲解 + 练习 + 学习身份(5人格) + DNA技能树 + 知识捕获 |
| **Mangoing** | /exam | 3D知识森林 + 4层知识网络 + 笔记 + 资源 + AI森林生成器 |
| **Mango Plan** | /planner | 任务管理 + AI计划生成 + 考试备战 + SM-2 3D闪卡复习 |
| **Mango Friend** | /grow | 情绪日记 + 心情追踪 + CBT认知重构 + AI暖心陪伴 |
| **Mango Voice** | /voice | Deepgram实时STT → DeepSeek AI → TTS + 5人格切换 + 全平台文字回退 |

---

## 三、完整学习闭环

> **Learn → Capture → Connect → Practice → Master → Evolve**

| 环节 | 实现 |
|------|------|
| **Learn** | AI Agent对话 / Voice语音对话 / 官方知识森林 / AI森林生成器 |
| **Capture** | 对话后「保存到知识库」→ 结构化笔记 + 自动标签 + 自动生成闪卡 |
| **Connect** | 3D球面知识森林(学科球→概念球→笔记面板) / 4层知识网络 |
| **Practice** | SM-2间隔重复算法 + 3D翻转闪卡(again/hard/good/easy四级评分) |
| **Master** | 考试备战(上传→AI复习包→模拟考试→弱项分析) |
| **Evolve** | 技能树(学习/练习/复习/笔记) + XP等级 + 芒宝进度面板 |

---

## 四、Mango Voice 语音系统

| 功能 | 技术 | 平台 |
|------|------|------|
| 实时语音对话 | Deepgram WebSocket Nova-2 STT → DeepSeek AI → TTS | Chrome/Edge |
| 文字对话回退 | 输入框始终可见 → /api/voice/chat | 全平台 |
| 5种人格 | IELTS考官 / 韩语老师 / AI导师 / 创业顾问 / 学术导师 | 全平台 |
| 对话保存 | 「保存到知识库」→ 结构化笔记 | 全平台 |
| 平台无关架构 | /api/voice/deepgram 统一端点 | Web/Desktop/Mobile/小程序 |

---

## 五、芒宝 AI 伴侣

| 特性 | 实现 |
|------|------|
| 动画 | 纯CSS SVG + Framer Motion — 浮动/眨眼/微笑/树叶摇摆 — 全平台零依赖 |
| 位置 | 右下角全局浮动 — 桌面72px/手机56px — 可拖拽 — 移动导航上方 |
| 语音气泡 | 毛玻璃气泡 — 5秒自动隐藏 — 8秒轮换5条问候语 |
| 交互面板 | 点击展开 — streak连续天数/XP进度/等级名/4个快捷操作 |
| 等级系统 | Lv1幼年芒宝 → Lv10探索芒宝 → Lv30学者芒宝 → Lv50智慧芒宝 → Lv100芒果贤者 |
| Lottie升级 | @lottiefiles/dotlottie-react已安装 — 替换动画仅需1行代码 |

---

## 六、知识森林系统

| 功能 | 说明 |
|------|------|
| 3D球面网络 | 学科(大球) → 概念(小球) → 笔记(面板) — 鼠标拖动旋转 — 悬停暂停 |
| 4层知识网络 | 学科 → 概念节点 → 相关笔记 → 资源推荐 — 逐层点击展开 |
| AI森林生成器 | 输入目标(如"IELTS 7.5") → AI自动生成完整知识体系 |
| 官方森林 | IELTS 7.5+ / TOEFL 100+ / AI工程师 / CFA Level 1 |
| 资源发现 | Arxiv/GitHub/YouTube/Coursera — 自动匹配概念推荐资源 |

---

## 七、设计系统 (Warm Paper Wellness v6)

### 色彩

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景 | `oklch(0.978 0.005 60)` | 暖纸白 — 类似纸质书的柔和底色 |
| 主色 | `oklch(0.58 0.16 75)` | 芒果琥珀 — CTA按钮和强调元素 |
| 辅色 | `oklch(0.85 0.04 140)` | 鼠尾草绿 — 成功状态和次级元素 |
| 文字 | `oklch(0.25 0.03 140)` | 深森林石板 — 高对比度但不刺眼 |

### 排版

| 层级 | 字体 | 字号 | 用途 |
|------|------|------|------|
| Display | Cormorant Garamond (衬线) | clamp(2rem, 5vw, 3.5rem) | Hero标题 |
| Title | Cormorant Garamond | clamp(1.5rem, 3.5vw, 2.125rem) | 段落标题 |
| Body | Inter (无衬线) | 0.9375rem | 正文 |
| Caption | Inter | 0.75rem | 辅助说明 |

### 6层表面系统

| 层级 | 用途 | 样式 |
|------|------|------|
| card-paper | 基础画布 | 纯背景色 |
| card-card | 普通卡片 | 浅表面 + 细边框 |
| card-floating | 浮动卡片 | 阴影 + 边框 |
| card-glass | 毛玻璃 | backdrop-blur + 半透明 |
| card-focus | 焦点卡片 | 主色边框 + 光晕 |
| card-hero | Hero卡片 | 最大阴影 + 最大圆角 |

---

## 八、技术亮点

- **统一AI内容引擎:** 12种生成模式 → 7要素质量验证 → LRU缓存 → 自动重试
- **Agent记忆闭环:** 每次对话前读取记忆 → 对话后存储 → 下次自动注入个性化上下文
- **双模数据层:** Guest (localStorage 50次操作) / Cloud (Supabase自动seed) → 登录自动合并
- **Deepgram语音:** WebSocket实时STT → Nova-2模型 → 浏览器API自动回退
- **SM-2间隔重复:** 完整Wozniak 1990算法 → 3D CSS翻转动画 → 四级评分
- **平台无关架构:** /api/voice/chat → Web/Desktop/Mobile/小程序统一端点
- **搜索丰富引擎:** GitHub/Zhihu/Google/Arxiv 上下文注入 → 高质量AI回答

---

## 九、React Native 移动端计划

| 阶段 | 内容 |
|------|------|
| 1 | Expo SDK 52 初始化 + 设计token迁移 + expo-router导航 |
| 2 | Hub页 + 芒宝Lottie动画 + 水彩背景 |
| 3 | Voice OS + Deepgram SDK集成 |
| 4 | 知识森林 + Skia 3D渲染 + 手势交互 |
| 5 | 打磨: haptics触觉 + 字体 + 60fps优化 |

**预计2-3周完成。**

---

## 十、环境变量

| Key | 用途 | 获取 |
|-----|------|------|
| DEEPGRAM_API_KEY | 生产级语音STT/TTS | https://console.deepgram.com |
| AI_API_KEY | DeepSeek AI 对话 | https://platform.deepseek.com |
| NEXT_PUBLIC_SUPABASE_URL | 数据库 | https://supabase.com |
