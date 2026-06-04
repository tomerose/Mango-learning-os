# Mango Learning OS

为大学生打造的 AI 学习操作系统。AI 导师、学习计划、知识管理、考试冲刺、成长追踪 —— 在一个无干扰的工作流里闭环。Web 优先，架构为 PWA / iOS / Android 的未来演进预留扩展。

> **第三自习室出品 · 把焦虑变成准备**

**状态**：**生产就绪** — `npm run build` 通过（16 路由零警告），Supabase 云端数据 + RLS 安全隔离已接入，游客模式与登录模式无缝切换，移动端/平板完整适配。

---

## ✨ 核心功能

| 模块 | 功能 |
|---|---|
| **Dashboard** | 今日任务、本周目标、学科掌握度、连续天数、等级 XP、近期动态 |
| **AI 导师** | 流式对话讲解 + 测验生成（DeepSeek / OpenAI 兼容），覆盖 AI、经济、金融、数学、英语 |
| **Study Planner** | 日/周/月/学期四级计划，目标进度追踪 |
| **Knowledge Hub** | 笔记管理 + SM-2 间隔重复闪卡 + 资源库 |
| **Exam Mode** | 倒计时备考 + **真实弱点分析**（基于测验历史）+ 针对性练习深链 |
| **Profile** | 等级 XP、成就墙、终身统计、每日反思记录 |

**特色闭环**：AI 导师生成测验 → 成绩落库 → Exam Mode 按学科诊断最弱点 → 深链跳回测验预填主题 → 再测验 → 持续提升。

---

## 🧱 技术栈

- **前端**: Next.js 15.5.19 (App Router) · React 19 · TypeScript strict · TailwindCSS v4 · Shadcn/UI (new-york)
- **后端**: Supabase (PostgreSQL + Auth + RLS) — schema 见 `docs/architecture/database-schema.sql`
- **AI**: DeepSeek（OpenAI 兼容）· 可插拔多 provider · SSE 流式
- **设计**: Apple HIG · 深色/浅色双模式 · 响应式移动优先 · 触摸目标≥44px · iOS 安全区适配

---

## 🚀 快速开始

### 1. 克隆 & 安装

```bash
git clone https://github.com/tomerose/Mango-learning-os.git
cd Mango-learning-os
npm install
```

### 2. 配置环境变量

**游客模式（零配置）**：不设置任何环境变量也能跑 — 点"以游客身份继续"，数据存本地 localStorage。

**云端模式（推荐）**：复制模板并填入你的凭证：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
# ─── Supabase（云端数据 + 账号登录）─────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_secret（仅服务端）

# ─── AI Provider（DeepSeek / OpenAI 兼容）──────────────
AI_API_KEY=sk-你的密钥
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

**获取凭证**：
- **Supabase**：[supabase.com](https://supabase.com) 创建项目 → Settings → API → 复制 URL 和两个 keys。然后在 SQL Editor 跑 `docs/architecture/database-schema.sql`（建表 + RLS 策略）。
- **DeepSeek**：[platform.deepseek.com](https://platform.deepseek.com) 注册 → 创建 API Key。或换成 OpenAI / 其他兼容 provider。

### 3. 启动

```bash
npm run dev          # http://localhost:3000
```

打开浏览器：
- **游客模式**：点"以游客身份继续"，立即体验（数据存本地）
- **云端模式**：注册账号，数据云端同步 + RLS 物理隔离

### 4. 生产构建

```bash
npm run build        # 验证编译
npm start            # 运行生产版本
npm run type-check   # TypeScript 类型检查
```

---

## 📁 项目结构

```
Mango-learning-os/
├── app/
│   ├── (dashboard)/              # 应用主壳（sidebar + 6 页面）
│   │   ├── dashboard/
│   │   ├── ai-tutor/            # AI 对话 + 测验生成
│   │   ├── study-planner/
│   │   ├── knowledge-hub/       # 笔记 + SM-2 闪卡
│   │   ├── exam-mode/           # 弱点分析 + 针对练习
│   │   └── profile/
│   ├── (auth)/                   # 登录/注册页
│   ├── api/ai/{chat,quiz}/      # 流式 AI 路由（服务端）
│   ├── auth/{callback,signout}/ # Supabase 认证路由
│   ├── globals.css              # Tailwind v4 设计令牌 + 移动端优化
│   └── layout.tsx
├── components/
│   ├── ui/                      # Shadcn 基础组件
│   ├── {dashboard,ai-tutor,exam-mode,...}/  # 业务组件
│   ├── sidebar.tsx · user-menu.tsx · theme-toggle.tsx
├── lib/
│   ├── ai/                      # client.ts (可插拔) · prompts.ts
│   ├── supabase/                # client · server · middleware · mappers · queries
│   ├── types.ts                 # 领域类型（单一真理源）
│   ├── store.tsx                # React Context 双模式（云端 / 游客）
│   ├── srs.ts                   # SM-2 间隔重复算法
│   ├── weakness.ts              # 测验弱点聚合算法
│   └── mock-data.ts · navigation.ts
├── docs/                        # 研究 · 产品 · 设计 · 架构 · 测试文档
├── middleware.ts                # Supabase 会话刷新 + 路由保护
└── .env.local.example           # 环境变量模板
```

---

## 🏛 架构亮点

### 双模式数据层（游客 / 云端无缝切换）

- **游客模式**：`localStorage` 持久化，立即可用，无需注册
- **云端模式**：Supabase PostgreSQL + RLS，数据物理隔离（`auth.uid() = user_id`）
- **切换零成本**：填上 Supabase 凭证即自动切云端，代码零改动

### 测验→弱点分析闭环

1. AI 导师生成测验 → 提交成绩
2. 成绩落库（`quiz_attempts` 表）
3. Exam Mode 按学科+主题池化正确率 → 识别最弱点
4. "针对性练习"深链跳回 AI 导师 → 预填弱点主题
5. 再测验 → 持续提升

### 移动端/平板优化

- 响应式布局（桌面侧边栏 / 移动抽屉）
- 移动顶栏含主题切换 + 用户菜单（朋友手机也能登出）
- 触摸目标≥44px（iOS HIG 规范）
- iOS 安全区适配（刘海 / Home Indicator）
- `-webkit-tap-highlight-color: transparent`（无点击闪烁）

### Clean Architecture

- **类型安全**：`lib/types.ts` 是领域模型单一真理源，DB schema 与之镜像
- **可插拔 AI**：换 provider 只改 `AI_BASE_URL` / `AI_MODEL`
- **分层清晰**：UI → store → queries → DB，每层可独立测试

---

## 🚢 部署指南

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tomerose/Mango-learning-os)

1. 点击上方按钮 fork + 部署
2. 在 Vercel 项目设置 → Environment Variables 填入：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`
3. Redeploy

### 自托管

```bash
npm run build
npm start  # 监听 http://localhost:3000
```

用 PM2 / Docker 部署：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🗺 路线图

- **✅ 现在 (V1)**: 16 路由生产就绪、Supabase 云端数据 + RLS、测验闭环、游客/云端双模式、移动端优化
- **🔜 下一步**: 知识图谱可视化、习惯追踪日历、AI 生涯规划中心
- **未来**: 多智能体学习系统、PWA 离线、iOS / Android 原生

---

## 🤝 贡献

欢迎 Issue 和 PR！提交前请：
1. `npm run type-check` 通过
2. `npm run build` 通过
3. 遵循现有代码风格（Prettier / ESLint 已配置）

详见 `CONTRIBUTING.md`（如有）。

---

## 📄 License

MIT

---

**第三自习室出品 · 把焦虑变成准备**
