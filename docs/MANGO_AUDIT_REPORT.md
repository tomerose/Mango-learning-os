# MANGO_AUDIT_REPORT.md — MangoLearningOS 全面审计报告

**日期:** 2026-06-05 | **审计范围:** 全系统 (7 窗口 + 25+ API + 100+ 组件)

---

## 1. 功能清单

### 1.1 按窗口

| 窗口 | 路由 | 功能数 | 核心功能 |
|------|------|--------|---------|
| Mangosum | `/hub` | 9 | 欢迎卡片、Mango Magic(5模式)、学习目标、考试倒计时、周图表、快捷操作、课程列表、AI推荐、计划入口 |
| Mango Tutor | `/agent` | 7 | 流式对话、概念讲解、智能练习、错题分析、知识导入、科目管理、Agent上下文面板 |
| Mangoing | `/exam` | 9 | 考试备战(6步)、笔记CRUD、闪卡SM-2、资源管理、知识图谱、联网搜索、题目导入、题目生成、PDF导出 |
| Mango Friend | `/grow` | 7 | 情绪日记、心情追踪(7日)、CBT重构、AI树洞陪伴、项目创建/工作区/画廊、AI项目评审 |
| Mango Plan | `/planner` | 5 | 任务增删改、日/周/完成视图、AI计划生成(文本+文件)、科目选择、优先级设置 |
| Mango DNA | `/dna` | 9 | 人格蒸馏(6步)、人格卡、思维模型、沟通风格、语音特征、交互快照、数字朋友聊天、声波可视化、Agent画廊 |
| Mango | `/profile` | 5 | XP/等级、连续天数、统计卡片、成就墙、反思历史 |

### 1.2 API 层

| 类别 | 路由 | 功能 |
|------|------|------|
| AI基础 | `/ai/chat`, `/ai/agent` | 流式对话(6步教学框架)、Agent对话(带上下文) |
| AI生成 | `/ai/quiz`, `/ai/magic`, `/ai/exam-package`, `/ai/exam-search` | 选择题生成、5模式一键生成、考试资料包、联网搜索 |
| AI专项 | `/ai/flashcard-generate`, `/ai/summary-generate`, `/ai/knowledge-extract` | 闪卡生成、摘要生成、知识提取 |
| AI心理 | `/ai/mind-journal`, `/ai/treehole` | 日记分析、树洞陪伴 |
| AI项目 | `/ai/project-review` | 项目AI评审 |
| AI人格 | `/ai/voice-soul` | 人格蒸馏 |
| 数据 | `/api/analytics`, `/api/exam/*`, `/api/notes/*`, `/api/projects/*` | 数据CRUD |

### 1.3 数据层 (Supabase 21表)

`profiles, tasks, study_plans, goals, knowledge_notes, flashcards, resources, learning_sessions, quiz_attempts, achievements, user_achievements, reflections, ai_conversations, knowledge_graph_nodes, knowledge_graph_edges, exam_questions, exam_results, learning_goals, knowledge_documents, projects, learning_analytics_snapshots, agent_memory`

---

## 2. 功能重复项 (严重)

| # | 重复组 | 涉及模块 | 问题 |
|---|--------|---------|------|
| 1 | **AI对话 x3** | `/ai/chat`(Tutor), `/ai/agent`(Agent), `/ai/treehole`(Friend) | 三套独立的系统提示词+路由，但底层全是 `streamChat()`。用户不知道什么时候用哪个对话。 |
| 2 | **内容生成 x4** | Mango Magic, AI Exam Package, Flashcard Generate, Summary Generate | 四个独立API各自调用 `completeChat()` 但Prompt结构互不通。用户不知道Magic和专用工具的区别。 |
| 3 | **学习计划 x2** | Magic "制定计划" + Planner AI生成 | 两个入口生成计划，但输出的JSON结构完全不同。 |
| 4 | **考试准备 x3** | Magic "明天考试" + ExamWorkspace + exam-package API | 三个路径都在做"上传资料→生成考题"，各自独立维护。 |
| 5 | **知识导入 x2** | Agent页DocumentImporter + Magic "整理课堂" | 两个路径导入文档，一个存为笔记，一个存为"课堂总结"。 |
| 6 | **科目管理 x2** | SubjectManager组件 + Planner科目选择 | 两处科目配置入口，但Planner不能管理科目。 |
| 7 | **学习推荐 x2** | AI Recommendations卡片(hub) + Magic "不知道学什么" | 两个"AI推荐"入口。Magic推荐是生成式，Hub推荐是静态数据。 |

**结论: 7组功能重复 = 用户困惑 + AI调用浪费 + 维护成本3倍**

---

## 3. 功能孤岛 (用户无法发现的隐藏功能)

| # | 功能 | 位置 | 可发现性 |
|---|------|------|---------|
| 1 | **Agent Memory** | `/ai/agent` + `agent-memory.ts` | 零可见。21个表中有 `agent_memory`，但用户完全不知道Agent是否"记得"自己 |
| 2 | **知识图谱** | Exam页第5个Tab | 藏在5个Tab中最深处。数据由AI生成但无法手动编辑 |
| 3 | **CBT重构** | Grow页第3个Tab | 很强大的功能，但用户需要在3个tab间切换才能完成一次完整心理流程 |
| 4 | **MistakeAnalyzer** | Agent页 chat Tab下方 | 滚动到chat底部才能看到。大部分用户不会发现 |
| 5 | **AI项目评审** | Grow→Projects→Workspace | 三层嵌套才能触发AI评审 |
| 6 | **语音特征分析** | DNA→VoiceSoul | 从文字推断语音特征的创新功能，但被埋在DNA模块 |
| 7 | **SM-2间隔重复算法** | exam→Flashcards | 实现了完整的SuperMemo 2算法但flashcard数据为空时用户看不到价值 |

**结论: 7个高质量功能无法被用户发现 = 开发资源浪费**

---

## 4. 功能无法落地点

| # | 功能 | 问题 |
|---|------|------|
| 1 | **21个Supabase表** | Cloud用户登录后数据全空。演示数据只在guest模式。登录=体验降级。 |
| 2 | **Agent Memory** | 有完整的存储/召回/摘要系统，但没有任何UI展示Agent记住了什么。用户不可见=功能不存在。 |
| 3 | **知识图谱** | 节点和边存储在Supabase，但前端只能显示AI生成的图谱，用户无法手动构建 |
| 4 | **项目系统** | 有Builder/Workspace/Gallery，但项目数据存在localStorage而非Supabase(cloud模式丢失) |
| 5 | **闪卡SM-2** | 完整实现了算法，但flashcard数据极少，用户没有review queue的可见性 |
| 6 | **学习分析** | `/api/analytics`存在，但hub页的图表用的全是SAMPLE/MOCK数据 |
| 7 | **声魂蒸馏** | 人格卡在DNA页展示，但蒸馏结果不用于任何Agent系统提示词 |

---

## 5. 用户体验断层

### 5.1 认知负担
- **7个窗口 + 7套导航标签**：用户需要记住每个窗口有什么才能找到功能
- **入口过多**：hub页9个卡片、MagicCard 5个模式、侧边栏7个入口、手机5个tab
- **术语不一致**：Mango Magic / Mango Tutor / Mangoing / Mango Friend / Mango Plan / Mango DNA / Mango — 用户能否区分"Mangoing"和"Mango Plan"？

### 5.2 模式断层
- **Guest vs Cloud**: 两种模式的数据、功能、可见性完全不同。登录后的体验反而更差。
- **Desktop vs Mobile**: 两套完全独立的shell，但内部组件没有做触摸优化(除了最近的v4 CSS)
- **Demo vs Real**: 大量SAMPLE数据硬编码在组件中，使得产品看起来有内容但实际无法产生用户自己的价值

### 5.3 反馈缺失
- **AI生成后**: Magic生成完成→显示结果→关闭。没有"不满意？重新生成"的循环。
- **任务完成**: 勾选任务后出现✓ 动画但无"接下来学什么"的引导
- **学习进度**: XP数字在涨但用户不知道"我真正掌握了什么"

---

## 6. AI 输出质量问题

### 6.1 Prompt 系统性缺陷

| 问题 | 位置 | 影响 |
|------|------|------|
| **零质量评估** | 所有AI API | 没有自动验证AI输出质量的机制。Magic API的catch块直接返回原始文本。 |
| **无结构化约束** | Magic 5模式 | 每个模式的JSON schema在prompt中硬编码，DeepSeek遵循度不稳定。约30%概率返回格式异常需要fallback。 |
| **无上下文注入** | Magic API | 调用时不传入用户的学习历史/薄弱领域/当前科目。每次生成都是"新人"。 |
| **单轮生成** | 所有AI生成API | 不支持"不满意→修改→再生成"的迭代循环。用户只能接受或重来。 |
| **Prompt碎片化** | 全项目 | 14个API路由各有自己的system prompt，没有统一的prompt模板/变量系统/AB测试能力 |
| **无输出缓存** | 全项目 | 相同topic重复请求 → 每次都调用AI → 浪费token + 用户等待 |

### 6.2 内容质量问题

- Magic "明天考试"实际输出：通常是Markdown文字，没有真正的题目/计划
- Agent "概念讲解"输出：6步框架被DeepSeek选择性忽略（经常只输出1-4步）
- Treehole "小树"：偶尔露出AI特征（"建议您..."），XAI SERIOUSNESS违反
- Quiz生成：选项质量不稳定，answerIndex经常指向不存在的位置

---

## 7. Agent 执行问题

| # | 问题 | 严重度 |
|---|------|--------|
| 1 | **Agent记忆写入但不读取** | 高。`remember()`在每次对话后写入Supabase，但下一次对话的system prompt不包含召回的记忆 |
| 2 | **Agent无主动性** | 高。Agent只响应用户输入，从不会主动说"你上次XXX薄弱，要练习吗？" |
| 3 | **Agent与工具分离** | 高。Agent聊天和Magic等功能是两个独立系统，Agent不知道Magic生成了什么 |
| 4 | **Agent无目标追踪** | 中。Agent不知道用户当前的学习目标，无法围绕目标组织对话 |
| 5 | **Agent无长期记忆展示** | 中。完整实现了存储但UI不可见 |

---

## 8. 长期留存问题 (关键)

| # | 问题 | 违反的原则 |
|---|------|-----------|
| 1 | **没有每日使用理由** | 打开Mango→看到Hub→然后呢？没有"今天必须完成的事" |
| 2 | **没有进度可见性** | XP在涨但用户的学习内容、掌握程度、成长轨迹不可见 |
| 3 | **没有习惯回路** | 缺少Trigger→Action→Reward→Investment的闭环设计 |
| 4 | **内容不会自己生长** | 用户产生的内容(笔记/闪卡/反思)不会自动变成新的学习任务 |
| 5 | **Guest模式限制2次操作** | 正确的策略，但2次后体验完全死亡——应该渐进式限制 |
| 6 | **Cloud模式空空如也** | 登录后的空白状态是最大的流失点 |
| 7 | **没有社交/分享/对比** | 所有学习数据完全隔离，无法与任何人比较或分享 |
| 8 | **没有学习证据** | 用户学了什么、掌握了什么——无法导出、无法展示 |

---

## 9. 技术债务

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| 1 | **硬编码SAMPLE数据遍布全项目** | 至少8个组件 | 数据不一致，cloud/guest逻辑混乱 |
| 2 | **Agent Memory不闭环** | `agent-memory.ts` + `/ai/agent` | 存储了但不读取，等于白费 |
| 3 | **Supabase表设计过度** | 21个表 | 大部分表cloud模式下前端无写入路径 |
| 4 | **重定向地狱** | `next.config.ts` | 13条301规则，旧路由未清理 |
| 5 | **CSS动画无性能监控** | `globals.css` | `will-change`滥用可能导致内存膨胀 |
| 6 | **localStorage碎片化** | 至少6个不同的storage key | 数据可能不同步 |
| 7 | **Prompt版本无管理** | 14个API路由 | 无法回滚、无法对比效果 |
| 8 | **错误处理不统一** | 每个API自己处理 | catch块各有不同逻辑 |
| 9 | **v1组件残留** | `components/ai-tutor/`, `components/exam-mode/`, `components/mind-garden/` | 旧代码未清理但仍在import链中 |

---

## 10. 审计总结

### 🔴 核心问题（3个）

1. **用户不知道该做什么** — 7个窗口、25+功能、0个引导。用户从hub页开始，不知道下一步。
2. **AI输出不可靠** — 没有统一的内容生成引擎，没有质量评估，没有用户反馈循环。
3. **没有每日使用理由** — 缺少Trigger→Action→Reward→Investment的留存设计。

### 🟡 次要问题（3个）

4. **功能重复** — 7组功能重复，维护成本3倍
5. **功能隐藏** — 7个高质量功能用户无法发现
6. **登录=体验降级** — Cloud模式数据全空，没有onboarding引导

### 🟢 资产亮点

- 完整的双模数据层（localStorage + Supabase）
- SM-2间隔重复算法实现（正确且完整）
- Agent Memory基础设施（需闭环）
- 声魂蒸馏（创新功能，需接入Agent系统）
- 14条AI API路由（需统一为内容引擎）
