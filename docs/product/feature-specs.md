# 功能规格 (Feature Specifications) — AI Learning OS MVP

> 文档类型: Product · 实现契约
> 版本: v1.0 · 重建于 2026-06-04（原 workflow 卡死丢失，手动重建并对齐已实现代码）
> 说明: 标注 ✅ = MVP 已实现（mock 数据层）；🔶 = 已建结构，逻辑后置；⬜ = 未来

---

## 通用验收标准 (Global AC)
- 所有页面响应式（移动优先），深色/浅色双模式 ✅
- Server Components 优先 + Suspense 流式加载 + 骨架屏 ✅
- 类型安全（TS strict，`lib/types.ts` 单一真理源）✅
- 数据层异步接口，可无缝从 mock 切换到 Supabase ✅
- 无障碍：语义化标签、ARIA、键盘可达、对比度 ✅

---

## 1. Dashboard（仪表盘）✅

**User Story**: 作为学生，我想一眼看到今天要做什么、整体进度如何，以便快速进入状态。

| 模块 | 规格 | 状态 |
|---|---|---|
| 统计卡 | 连续天数 / 等级XP / 今日专注 / 任务完成度 | ✅ |
| 今日任务 | 学科色标、优先级、预估时长、完成态 | ✅ |
| 本周目标 | 进度条 + 当前/目标值 | ✅ |
| 学科掌握度 | 环形进度 + 周学习时长 | ✅ |
| 近期动态 | 时间轴，5 类事件 | ✅ |

**数据**: `getDashboardStats / getTasks / getWeeklyGoals / getSubjectProgress / getActivity`

---

## 2. AI Tutor（AI 导师）✅

**User Story**: 作为学生，我想就某个概念向 AI 提问并得到结构化讲解，以便真正理解而非死记。

| 模块 | 规格 | 状态 |
|---|---|---|
| 学科选择 | AI/经济/金融/数学/英语 切换 | ✅ |
| 流式对话 | SSE 逐字流式，自动滚动 | ✅ |
| 教学结构 | 概念→直觉→推导→例子→易错点→应用 | ✅ (prompts.ts) |
| 启动问题 | 每学科预置引导问题 | ✅ |
| 测验生成 | JSON 选择题 + 解析 | 🔶 (prompt 已写，UI 后置) |
| 错题分析 | 诊断思维误区 | 🔶 (prompt 已写) |
| 降级模式 | 无 API Key 时 mock 流式 | ✅ |

**契约**: `POST /api/ai/chat` `{subject, messages[]}` → text/plain 流。

---

## 3. Study Planner（学习计划）✅

**User Story**: 作为学生，我想把日/周/月/学期目标对齐，以便长期推进不迷失。

| 视图 | 规格 | 状态 |
|---|---|---|
| 每日 | 时间表，学科色标，完成态 | ✅ |
| 每周 | 负荷分布条形 | ✅ |
| 每月 | 日历聚合 | ⬜ (占位) |
| 学期 | 目标进度条 | ✅ |

---

## 4. Knowledge Hub（知识中心）✅

**User Story**: 作为学生，我想沉淀笔记、复习闪卡、收藏资源，构建第二大脑。

| Tab | 规格 | 状态 |
|---|---|---|
| 笔记 | 卡片网格，学科+标签+摘要+搜索 | ✅ |
| 闪卡 | 牌组卡片，待复习/已掌握，SM-2 | ✅ UI / 🔶 算法 |
| 资源 | 列表，类型标签 | ✅ |
| 图谱 | 概念关系可视化 | ⬜ (节点/边表已建) |

---

## 5. Exam Mode（考试模式）✅

**User Story**: 作为学生，临近考试我想知道差距在哪、怎么冲刺，把焦虑变成准备。

| 模块 | 规格 | 状态 |
|---|---|---|
| 即将考试 | 倒计时 + 备考完成度 | ✅ |
| 备考工具 | 重点/模拟/冲刺/错题 入口 | ✅ UI |
| 弱点分析 | 低正确率知识点 + 针对练习 | ✅ |

---

## 6. Profile（个人成长）✅

**User Story**: 作为学生，我想看到自己的成长轨迹和成就，获得持续动力。

| 模块 | 规格 | 状态 |
|---|---|---|
| 身份头部 | 头像/等级/XP 进度 | ✅ |
| 终身统计 | 连击/XP/时长/成就数 | ✅ |
| 成就墙 | 已解锁/锁定态 | ✅ |
| 反思记录 | 日期/心情/笔记 | ✅ |

---

## 扩展中心（已纳入信息架构，逐步落地）
- **University Exam Assistant** → 并入 Exam Mode ✅
- **AI Career Growth Center** → Roadmap/MCP路径/项目/作品集 ⬜ P2
- **Personal Growth Center** → 日/周/月复盘 + 习惯追踪（reflections 表已建）🔶
- **Knowledge Management System** → 并入 Knowledge Hub ✅

---

## 优先级总览 (MoSCoW)
- **Must（已交付）**: Dashboard, AI Tutor, Study Planner, Knowledge Hub, Exam Mode, Profile, 应用骨架, 深浅色, 流式 AI
- **Should（结构就绪）**: 闪卡 SM-2 调度、测验/错题 UI、Supabase 真实接入、认证
- **Could**: 知识图谱可视化、月历视图、习惯追踪
- **Future**: AI Career Center、多智能体学习系统、PWA、移动端
