import * as fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  AlignmentType,
  WidthType,
  ShadingType,
} from "docx";

const BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "CCCCCC",
};

function cell(text, opts = {}) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), size: 18, ...opts })],
        spacing: { before: 40, after: 40 },
      }),
    ],
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function headerCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), size: 18, bold: true, color: "FFFFFF" })],
        spacing: { before: 40, after: 40 },
      }),
    ],
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
    shading: { type: ShadingType.SOLID, color: "E8760B" },
  });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 32, bold: true, color: "E8760B" })],
    spacing: { before: 360, after: 200 },
    heading: HeadingLevel.HEADING_1,
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 26, bold: true, color: "333333" })],
    spacing: { before: 280, after: 160 },
    heading: HeadingLevel.HEADING_2,
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, bold: true, color: "555555" })],
    spacing: { before: 200, after: 120 },
    heading: HeadingLevel.HEADING_3,
  });
}

function para(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: { before: 80, after: 80 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 20 })],
    spacing: { before: 40, after: 40 },
    bullet: { level: 0 },
  });
}

function table(headers, rows) {
  return new Table({
    rows: [
      new TableRow({ children: headers.map((h) => headerCell(h)) }),
      ...rows.map((row) => new TableRow({ children: row.map((c) => cell(c)) })),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════

const doc = new Document({
  sections: [
    // ── TITLE ────────────────────────────────────────────────
    {
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "MangoLearningOS 完整功能清单",
              size: 44,
              bold: true,
              color: "E8760B",
            }),
          ],
          spacing: { before: 400, after: 100 },
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "供 Claude AI 分析 — 产品重构参考文档",
              size: 22,
              color: "888888",
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "版本: v1.2.0 (Apple Glass)  |  日期: 2026-06-05  |  技术栈: Next.js 15.5 + React 19 + Tailwind 4 + Supabase + DeepSeek",
              size: 18,
              color: "AAAAAA",
            }),
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.CENTER,
        }),

        // ═══ 1. PRODUCT OVERVIEW ═══
        h1("一、产品概览"),

        para(`MangoLearningOS（芒果学习操作系统）是一个面向大学生和研究生的 AI 学习平台。产品采用 7 窗口架构（侧边栏导航），每位窗口对应一个独立的学习场景。底层为 Supabase(云端) + localStorage(游客) 双模持久化，AI 层基于 DeepSeek API（14 条 API 路由）。`),

        para("产品当前处于 v1.2.0，部署于 Vercel (https://mangoleaningos.top)，GitHub 开源 (tomerose/Mango-learning-os)。"),

        h2("1.1 技术架构"),
        table(["层次", "技术选型", "说明"], [
          ["前端框架", "Next.js 15.5 (App Router)", "React 19 + TypeScript 5.8"],
          ["样式", "Tailwind CSS 4.1 + shadcn/ui (New York)", "自定义设计系统 v4 (Paper Premium)"],
          ["动效", "Framer Motion 12 + GSAP", "BackgroundBeams / BlurText / ScrollReveal"],
          ["数据库", "Supabase (PostgreSQL + RLS)", "21 张表，RLS 保护"],
          ["AI", "DeepSeek API (OpenAI 兼容)", "14 条 AI API 路由"],
          ["认证", "Supabase Auth (邮箱/密码)", "+ Guest 模式 (mango_guest cookie)"],
          ["部署", "Vercel (自动部署)", "自定义域名 mangoleaningos.top"],
          ["图标", "Lucide React 0.511", "~1000+ 图标"],
          ["图表", "Recharts", "学习数据可视化"],
          ["状态管理", "React Context (lib/store.tsx)", "双模: localStorage + Supabase"],
          ["移动端", "独立 Shell (flex md:hidden)", "PWA + Service Worker"],
        ]),

        h2("1.2 导航结构"),
        para("侧边栏 7 个一级入口，移动端 5 个 Tab + '更多' Bottom Sheet："),
        table(["ID", "窗口名称", "路由", "图标", "描述"], [
          ["hub", "Mangosum", "/hub", "Sparkles", "AI 学习驾驶舱，进度总览与分析"],
          ["agent", "Mango Tutor", "/agent", "Bot", "AI 对话 · 概念讲解 · 智能练习 · 知识导入"],
          ["exam", "Mangoing", "/exam", "GraduationCap", "考试备战 · 笔记 · 闪卡 · 资源 · 图谱"],
          ["grow", "Mango Friend", "/grow", "Heart", "心灵日记 · AI 陪伴 · 项目实践"],
          ["planner", "Mango Plan", "/planner", "CalendarCheck", "智能生成计划 · 任务管理"],
          ["dna", "Mango DNA", "/dna", "Dna", "AI 人格档案 · Agent 画廊 · 声魂蒸馏"],
          ["profile", "Mango", "/profile", "User", "成就 · XP · 统计 · 设置"],
        ]),

        // ═══ 2. WINDOW-BY-WINDOW ═══
        h1("二、窗口功能详表"),

        // ── 2.1 Mangosum ──
        h2("2.1 Mangosum (总览驾驶舱) — /hub"),
        para("首页仪表盘。9 个功能模块，展示学习概览和快捷入口。v4 版本已升级为 Bento Grid 非对称布局 + Hero 动画背景。"),

        h3("功能模块"),
        table(["序号", "组件", "功能描述", "数据来源", "交互方式"], [
          ["1", "HubWelcome (Hero)", "时间问候(早/中/晚) + 日期 + 连续天数 + XP进度条 + 芒果球Magic按钮。BackgroundBeams 流动光束背景，BlurText 模糊渐显文字", "useStore().stats", "鼠标跟随水彩blob + 点击芒果球打开Magic"],
          ["2", "MagicButton", "旋转芒果SVG按钮 + 呼吸光晕 + 粒子环。页面中央视觉锚点", "无", "hover放大→click打开MagicCard"],
          ["3", "MagicCard", "全屏弹窗。5种AI生成模式: 明天考试/整理课堂/制定计划/学习新领域/不知道学什么。选择→输入→生成→复制结果", "AI API: /api/ai/magic", "5模式网格选择→Textarea输入→⌘+Enter生成→结果卡片"],
          ["4", "LearningGoalsCard", "学习目标列表(最多3个)。每项目标: 科目图标+进度条+截止日期+状态标签", "SAMPLE_GOALS (guest) / 空(cloud)", "hover高亮→点击跳转Planner"],
          ["5", "UpcomingExamsCard", "考试倒计时列表(3场)。显示: 距今天数+科目+考试名+准备按钮。3日内标红", "SAMPLE_EXAMS (guest) / 空(cloud)", "hover→点击跳转考试页"],
          ["6", "WeeklyOverviewChart", "本周每日学习时长柱状图(Recharts)。带总计/日均统计+较上周增长%", "generateSampleData() 随机 (guest) / 空(cloud)", "hover查看每天分钟数"],
          ["7", "QuickActions", "4个快捷操作: 专注会话/复习卡片/参加测验/写反思日记。每个带彩色图标+说明", "静态配置", "hover scale→click跳转对应窗口"],
          ["8", "ActiveCoursesList", "已选科目列表。每个科目: 颜色标识+科目名+掌握度%+进度条", "useSubjects() + seedSubjectProgress", "hover→点击可跳转Agent"],
          ["9", "AiRecommendations", "3条AI学习推荐。每条: 图标+标题+描述+箭头按钮", "静态配置(RECOMMENDATIONS)", "hover→click跳转对应操作"],
        ]),

        h3("MagicCard 5 种 AI 生成模式详表"),
        table(["模式ID", "名称", "图标", "描述", "API参数", "输出内容"], [
          ["exam", "明天考试", "GraduationCap", "生成复习资料、题目、冲刺计划", "mode=exam + input", "summary + lecture(MD) + exercises[题目] + plan7Days + knowledgeGraph"],
          ["notes", "整理课堂", "FileText", "生成课堂总结、笔记、思维导图、卡片", "mode=notes + input", "notes(MD) + flashcards[前后] + summary"],
          ["plan", "制定计划", "CalendarCheck", "生成学习计划、目标拆解、时间规划", "mode=plan + input", "plan(MD) + milestones[] + resources[]"],
          ["learn", "学习新领域", "Lightbulb", "生成学习路线图、知识框架、推荐资源", "mode=learn + input", "roadmap(MD) + keyConcepts[] + resources[]"],
          ["recommend", "不知道学什么", "Compass", "分析个人情况，推荐最值得学的内容", "mode=recommend + input", "profile + recommendations[] + dailyFocus"],
        ]),

        // ── 2.2 Mango Tutor ──
        h2("2.2 Mango Tutor (AI导师) — /agent"),
        para("4 个 Tab 的 AI 导师工作台。支持科目切换、流式对话、结构化教学、智能练习、文档导入。"),

        h3("Tab 详表"),
        table(["Tab", "组件", "功能描述", "API", "交互方式"], [
          ["对话 (chat)", "AgentChat", "流式AI对话。6步教学框架(概念→直觉→推导→例子→易错→下一步)。支持Markdown渲染。底部AgentSuggestions推荐问题 + MistakeAnalyzer错题分析", "/api/ai/agent", "输入→SSE流式输出→自动滚动。AgentSuggestions点击填充问题。50条消息上限"],
          ["概念讲解 (explain)", "ConceptExplainer", "结构化概念讲解。输入主题→AI生成6部分内容。可保存为笔记", "/api/ai/agent (内置)", "输入主题→生成→折叠式展示→保存按钮"],
          ["智能练习 (practice)", "ExerciseGenerator", "AI生成练习题。选择主题+数量+难度→生成题目→逐题作答→自动评分+解析", "/api/ai/quiz", "配置参数→生成→逐题展示→选择答案→查看解析"],
          ["知识导入 (knowledge)", "DocumentImporter", "上传PDF/DOCX→提取文本→保存为笔记。支持拖拽上传", "/api/notes/import/file", "拖拽文件→提取文字→预览→保存笔记"],
        ]),

        h3("Agent 辅助组件"),
        table(["组件", "功能", "说明"], [
          ["SubjectManager", "动态增删科目。12色自动分配。localStorage持久化", "全局科目管理对话框"],
          ["AgentContextPanel", "右侧面板。显示当前科目+薄弱领域+学习目标+最近主题", "从AgentMemory读取（cloud模式）"],
          ["AgentSuggestions", "4个情景推荐问题。根据当前科目动态生成", "点击→填充到AgentChat输入框"],
          ["MistakeAnalyzer", "错题根因分析。输入题目+错误答案→AI诊断思维误区", "在Chat标签页底部"],
        ]),

        // ── 2.3 Mangoing ──
        h2("2.3 Mangoing (考试备战+知识库) — /exam"),
        para("5 个 Tab。考试备战包含完整 6 步流程(上传→配置→AI生成→复习→练习→导出)。知识库包含笔记/闪卡/资源/图谱。"),

        h3("Tab 详表"),
        table(["Tab", "核心组件", "功能描述", "API"], [
          ["考试备战 (exam)", "ExamWorkspace + MaterialUploader + WebSearch + ReviewBooklet + KnowledgeMapView + PracticeSession + MockExamPlayer + PDFExportButton", "6步流程: ①上传材料(PDF/DOCX/PPTX/TXT)或联网搜索 ②配置参数(主题/题量/难度) ③AI生成复习包 ④查看讲义+知识图谱 ⑤进入练习模式(MCQ/填空/大题) ⑥导出PDF或保存", "/api/ai/exam-package + /api/ai/exam-search"],
          ["笔记 (notes)", "NotesTab + ImportNoteDialog", "增删改查笔记。导入Word/PDF/URL→AI自动整理。标签+科目分类", "/api/notes/* + /api/ai/knowledge-extract"],
          ["闪卡 (flashcards)", "FlashcardsTab", "SM-2间隔重复系统。正面→翻转→4级评分(again/hard/good/easy)→算法更新间隔", "lib/srs.ts (客户端SM-2)"],
          ["资源 (resources)", "ResourcesTab", "外部资源链接管理。按科目分类。添加/删除", "localStorage"],
          ["图谱 (graph)", "GraphTab", "知识图谱可视化。概念节点+关系边。d3-force布局", "Supabase: knowledge_graph_nodes/edges"],
        ]),

        h3("SM-2 间隔重复算法"),
        para("Flashcard 模块实现了完整的 SuperMemo 2 算法 (Wozniak 1990)。核心参数："),
        bullet("easiness factor: 初始 2.5，最低 1.3，每次复习后更新"),
        bullet("4 级评分 → SM-2 quality: again=2 / hard=3 / good=4 / easy=5"),
        bullet("间隔计算: 第1次→1天, 第2次→6天, 后续→round(interval × ease)"),
        bullet("失误(q<3): 重置 repetitions=0, interval=1天"),
        bullet("Pure function: lib/srs.ts，无副作用，单元可测"),

        // ── 2.4 Mango Friend ──
        h2("2.4 Mango Friend (成长花园) — /grow"),
        para("3 个 Tab: 心灵花园(心理支持) + AI陪伴(树洞聊天) + 项目实践(学以致用)。"),

        h3("Tab 详表"),
        table(["Tab", "组件", "功能描述", "API/存储"], [
          ["心灵花园 (mind)", "JournalEditor + MoodTracker + CbtReframer", "JournalEditor: 心情选择(😊😐😢😡🤔)+压力/动力滑块+文字日记→保存。MoodTracker: 7日心情时间线emoji展示。CbtReframer: 输入负面想法→AI认知重构", "/api/ai/mind-journal"],
          ["AI陪伴 (companion)", "AiCompanionChat", "匿名情感支持AI「小树」。温暖、非评判、不诊断。流式对话。玫瑰色主题", "/api/ai/treehole"],
          ["项目实践 (projects)", "ProjectCard + ProjectBuilder + ProjectWorkspace + ProjectGallery", "ProjectBuilder: 创建项目向导(名称/科目/描述/目标)。ProjectWorkspace: 3Tab(学习/构建/提交)+ AI评审。ProjectGallery: 已完成项目展示。支持删除(AlertDialog确认)", "localStorage + /api/ai/project-review"],
        ]),

        // ── 2.5 Mango Plan ──
        h2("2.5 Mango Plan (学习计划) — /planner"),
        para("AI 智能生成 + 手动任务管理的学习计划系统。"),

        h3("功能模块"),
        table(["模块", "功能描述", "API/存储"], [
          ["任务管理", "添加任务(标题/科目/优先级/截止日期)。日/周/完成 3种视图切换。复选框勾选完成+XP奖励", "useStore().tasks (localStorage / Supabase)"],
          ["AI计划生成(文本模式)", "输入学习目标+时长→AI生成结构化计划。Markdown输出", "/api/ai/chat (复用)"],
          ["AI计划生成(文件模式)", "上传PDF/Word/图片→AI提取内容→生成计划", "/api/ai/chat (复用)"],
          ["科目+时间框架选择", "选择目标科目+计划周期(日/周/月/学期)", "客户端"],
        ]),

        // ── 2.6 Mango DNA ──
        h2("2.6 Mango DNA (数字人格) — /dna"),
        para("AI 人格蒸馏 + Agent 画廊 + 数字挚友。旗舰功能。"),

        h3("功能模块"),
        table(["模块", "组件", "功能描述", "API"], [
          ["声魂蒸馏", "VoiceSoulContent + UploadStage + DistillationEngine", "上传聊天记录/文字材料→6步蒸馏(语言→人格→思维→情感→声音→档案)→生成完整人格卡", "/api/ai/voice-soul"],
          ["人格卡", "PersonalityCard", "展示: 称呼+MBTI+性格标签+能量水平+情感模式", "API输出"],
          ["思维模型", "ThinkingModel", "展示: 逻辑风格+决策模式+价值观+口头禅+话题偏好", "API输出"],
          ["沟通风格", "CommunicationStyle", "展示: 正式程度+回复长度+幽默风格+emoji使用频率+温暖度(0-100)", "API输出"],
          ["语音特征", "VoiceProfile", "从文字推断: 语速+能量感+停顿习惯+语气词列表", "API输出"],
          ["交互快照", "InteractionSnapshot", "展示典型: 问候/告别/鼓励/冲突回应", "API输出"],
          ["数字朋友聊天", "DigitalFriendChat", "用蒸馏出的人格作为System Prompt进行流式对话", "/api/ai/chat (复用)"],
          ["Agent 画廊", "MangoDNAContent", "展示4个预设AI Agent形象卡片", "静态"],
        ]),

        // ── 2.7 Mango ──
        h2("2.7 Mango (个人中心) — /profile"),
        para("用户统计、成就和反思。"),

        h3("功能模块"),
        table(["模块", "功能描述", "数据来源"], [
          ["头像+等级+XP", "显示头像、当前等级、总XP、升级进度条", "useStore().stats"],
          ["统计卡片", "连续天数+总XP+学习分钟+完成任务数。4项核心指标", "useStore().stats"],
          ["成就墙", "6个成就: 首次7天连续/完成10个练习/创建50张闪卡/完成5个项目/总分1000XP/30天连续。锁定/解锁状态", "静态预设(未与store联动)"],
          ["反思历史", "显示保存的反思日记列表。mood+日期+内容", "useStore().reflections"],
          ["存储偏好", "切换 local / cloud 存储模式", "localStorage preference"],
        ]),

        // ═══ 3. AI LAYER ═══
        h1("三、AI 层完整清单"),

        h2("3.1 AI API 路由 (14条)"),
        table(["路由", "功能", "请求方式", "模型调用", "输出格式", "限速"], [
          ["/api/ai/chat", "流式AI对话(6步教学框架)", "POST {subject, messages[]}", "streamChat()", "SSE text/plain stream", "20/min"],
          ["/api/ai/agent", "Agent增强对话(带学习上下文)", "POST {subject, messages[], context?, userId?}", "streamChat() + AgentMemory", "SSE text/plain stream", "15/min"],
          ["/api/ai/quiz", "AI生成选择题", "POST {subject, topic, count, difficulty}", "completeChat() + JSON parse", "JSON {questions[]}", "10/min"],
          ["/api/ai/magic", "Mango Magic 5模式一键生成", "POST {mode, input, subject?, timeframe?}", "completeChat()", "JSON (模式不同schema不同)", "无单独限速"],
          ["/api/ai/exam-package", "考试资料包生成", "POST {subject, topic, materials[]}", "completeChat()", "JSON {lecture, exercises[], flashcards[]}", "无单独限速"],
          ["/api/ai/exam-search", "AI联网搜索学习资料", "POST {query, subject}", "completeChat()", "JSON {results[]}", "无单独限速"],
          ["/api/ai/knowledge-extract", "从文档提取知识点", "POST {text, subject}", "completeChat()", "JSON {concepts[], summary}", "无单独限速"],
          ["/api/ai/flashcard-generate", "AI生成闪卡", "POST {text, subject, count}", "completeChat()", "JSON {flashcards[]}", "无单独限速"],
          ["/api/ai/summary-generate", "AI生成摘要", "POST {text, subject}", "completeChat()", "JSON {summary, keyPoints[]}", "无单独限速"],
          ["/api/ai/mind-journal", "AI分析日记/心情", "POST {mood, content}", "completeChat()", "JSON {analysis, suggestions[]}", "无单独限速"],
          ["/api/ai/treehole", "树洞情感陪伴聊天(小树人格)", "POST {messages[]}", "streamChat()", "SSE text/plain stream", "无单独限速"],
          ["/api/ai/project-review", "AI项目评审", "POST {project, files[]}", "completeChat()", "JSON {feedback, score, suggestions[]}", "无单独限速"],
          ["/api/ai/voice-soul", "人格蒸馏分析", "POST {text, mode}", "completeChat()", "JSON {personalityCard, thinkingModel, ...}", "无单独限速"],
          ["/api/ai/transcribe", "语音转文字(Whisper API预留)", "POST {audio}", "(预留)", "JSON {text}", "无单独限速"],
        ]),

        h2("3.2 AI Client 层 (lib/ai/client.ts)"),
        table(["函数", "功能", "参数", "降级行为"], [
          ["streamChat(messages, opts)", "流式聊天（SSE管道转换）", "messages[], temperature?, subject?", "无API_KEY时返回mockStream，模拟token流式输出"],
          ["completeChat(messages, opts)", "非流式完成（用于结构化输出）", "messages[], temperature?", "无API_KEY时返回mock字符串"],
          ["extractJson(text)", "从AI回复中提取JSON（处理markdown code block）", "text: string", "N/A"],
          ["getAIConfig()", "读取环境变量获取AI配置", "无", "默认DeepSeek"],
          ["isAIConfigured()", "检查API_KEY是否真实配置", "无", "返回boolean"],
        ]),

        h2("3.3 Prompt 系统 (lib/ai/prompts.ts)"),
        table(["函数/Prompt", "用途", "结构"], [
          ["buildTutorMessages(subject, history)", "构建教学对话的System+User消息", "System: 学科Persona + 6步教学框架。User: 历史消息"],
          ["buildQuizPrompt(subject, topic, count, difficulty)", "构建出题Prompt", "System: 学科Persona + 出题引擎。User: 主题+数量+难度+JSON schema要求"],
          ["buildErrorAnalysisPrompt(subject, question, userAnswer, correctAnswer)", "构建错题分析Prompt", "System: 错题分析专家。User: 题目+学生答案+正确答案+分析要求(4项)"],
          ["buildStructuredLearnPrompt(topic)", "构建结构化学习Prompt", "3层输出: 教学内容(5部分) + 知识图谱(JSON) + 学习路径"],
          ["STRUCTURED_LEARN_SYSTEM", "结构化学习引擎System Prompt", "约150行。类教材+AI导师混合风格"],
          ["isLearningIntent(text)", "检测用户输入是否为学习请求", "关键词匹配: 讲解/什么是/解释/帮我理解/教我/学习/推导/原理/为什么/怎么做/概念/分析"],
          ["SUBJECT_PERSONA[5科]", "5个学科的导师人格Prompt", "AI/经济学/金融学/数学/英语。每科约1-2句话"],
          ["TUTOR_FRAMEWORK", "6步教学框架模板", "核心概念→直觉理解→推导步骤→例子→易错点→下一步"],
        ]),

        h2("3.4 Agent Memory 系统 (lib/ai/agent-memory.ts)"),
        table(["函数", "功能", "存储方式", "备注"], [
          ["remember(userId, type, key, value)", "存储一条记忆。Upsert语义(重复key=更新)", "Cloud: Supabase agent_memory表。Guest: localStorage", "type∈{goal, weak_area, topic, preference, summary}"],
          ["recall(userId, type?)", "召回记忆。可按type过滤。最新在前", "同上", "⚠️当前Agent路由写了但未在下次对话中读取"],
          ["forget(userId, key)", "删除一条记忆", "同上", ""],
          ["summarizeContext(userId)", "生成用户学习档案摘要文本。用于注入System Prompt", "调用recall()后格式化", "⚠️存在但未被Agent路由使用"],
        ]),

        // ═══ 4. DATA LAYER ═══
        h1("四、数据层完整清单"),

        h2("4.1 状态管理 (lib/store.tsx)"),
        para("React Context 双模持久化。800行。核心数据模型和操作。"),
        table(["数据字段", "类型", "Cloud存储", "Guest存储"], [
          ["tasks[]", "Task[] (id/title/subject/done/priority/dueLabel/estimatedMin)", "Supabase tasks表", "localStorage → tasks[]"],
          ["notes[]", "Note[] (id/title/subject/body/tags/updatedLabel)", "Supabase knowledge_notes表", "localStorage → notes[]"],
          ["flashcards[]", "Flashcard[] (id/deck/subject/front/back/ease/intervalDays/repetitions/dueOn)", "Supabase flashcards表", "localStorage → flashcards[]"],
          ["reflections[]", "Reflection[] (id/dateLabel/mood/body)", "Supabase reflections表", "localStorage → reflections[]"],
          ["quizAttempts[]", "QuizAttempt[] (id/subject/topic/total/correct/createdAt)", "Supabase quiz_attempts表", "localStorage → quizAttempts[]"],
          ["stats", "DashboardStats (streakDays/totalXp/level/xpToNextLevel/minutesToday/tasksDoneToday...)", "Supabase profiles表", "seedStats + session XP"],
        ]),
        para("操作: toggleTask / addTask / addNote / deleteNote / addReflection / reviewCard(含SM-2更新) / recordQuiz / syncLocalToCloud"),

        h2("4.2 Supabase 数据库 (21 张表)"),
        table(["表名", "用途", "RLS", "前端读写状态"], [
          ["profiles", "用户档案(XP/streak/level)", "✅", "读/写"],
          ["tasks", "学习任务", "✅", "读/写"],
          ["study_plans", "学习计划", "✅", "写(少用)"],
          ["goals", "学习目标", "✅", "未用"],
          ["knowledge_notes", "笔记", "✅", "读/写"],
          ["flashcards", "闪卡(SM-2)", "✅", "读/写"],
          ["resources", "外部资源链接", "✅", "未用"],
          ["learning_sessions", "学习会话记录", "✅", "未用"],
          ["quiz_attempts", "测验记录", "✅", "读/写"],
          ["achievements", "成就定义", "✅", "读(前端硬编码)"],
          ["user_achievements", "用户成就", "✅", "未用"],
          ["reflections", "反思日记", "✅", "读/写"],
          ["ai_conversations", "AI对话历史", "✅", "未用"],
          ["knowledge_graph_nodes", "知识图谱节点", "✅", "读(AI生成)"],
          ["knowledge_graph_edges", "知识图谱边", "✅", "读(AI生成)"],
          ["exam_questions", "考题库", "✅", "读/写"],
          ["exam_results", "考试结果", "✅", "读/写"],
          ["learning_goals", "学习目标(细粒度)", "✅", "未用"],
          ["knowledge_documents", "知识文档", "✅", "未用"],
          ["projects", "项目", "✅", "未用(前端用localStorage)"],
          ["learning_analytics_snapshots", "学习分析快照", "✅", "未用"],
          ["agent_memory", "Agent记忆(键值对)", "✅", "写(Agent路由) / 读(未闭环)"],
        ]),

        h2("4.3 科目系统 (lib/subjects.tsx)"),
        para("动态自定义科目。5个默认科目(AI/经济/金融/数学/英语) + 用户可增删。12色自动分配。localStorage持久化。"),
        table(["默认科目", "ID", "简称", "颜色"], [
          ["人工智能", "ai", "AI", "var(--chart-1)"],
          ["经济学", "economics", "经济", "var(--chart-2)"],
          ["金融学", "finance", "金融", "var(--chart-3)"],
          ["数学", "math", "数学", "var(--chart-4)"],
          ["英语", "english", "英语", "var(--chart-5)"],
        ]),

        // ═══ 5. UX & ANIMATION ═══
        h1("五、UI/UX 设计系统"),

        h2("5.1 设计系统版本"),
        bullet("v4 Paper Premium 设计系统（2026-06-05最新）"),
        bullet("6级表面系统: flat / card / elevated / glass / floating / hero"),
        bullet("排版等级: display-xl/lg/md → heading-xl/lg/md → body-lg/text/sm → label/caption"),
        bullet("动效token: 6种缓动曲线 + 6种持续时间(80ms~800ms)"),
        bullet("色彩: 暖纸白底(oklch 0.978) + 精炼芒果琥珀主色(oklch 0.58) + 鼠尾草绿辅色"),

        h2("5.2 动效组件 (v4 新增)"),
        table(["组件", "来源", "效果"], [
          ["BackgroundBeams", "Aceternity UI", "19条流动光束(芒果暖色: amber→gold→rose)。Hero背景"],
          ["BlurText", "Reactbits", "逐字从模糊(8px)→清晰显现。0.06s间隔。用于Hero问候语"],
          ["ScrollReveal", "Motion Primitives", "滚动触发淡入。from 40px下方→to原位。6个BentoCell交错"],
          ["BentoGrid + BentoCell", "Aceternity", "不对称网格布局。6种surface variant。colSpan/rowSpan"],
          ["LoadingSpinner", "自制", "4变体: spinner/dots/pulse/mango。品牌加载指示器"],
          ["EmptyState", "自制", "3尺寸(sm/md/lg)。图标+标题+描述+CTA按钮"],
          ["GradientText", "自制", "4色渐变文字(primary/secondary/accent/mango)"],
        ]),

        h2("5.3 Onboarding (首次体验)"),
        para("MangoOnboarding: 5阶段沉浸式欢迎。纯黑背景。"),
        bullet("Logo Reveal (1200ms Apple风格) → Welcome Message (双语渐现) → Feature Cards (6张, 120ms stagger) → Hub Preview (模糊→清晰) → Enter Button (呼吸动画→淡出)"),
        bullet("ParticleBackground: 30个低透明度浮动粒子。鼠标跟随。"),
        bullet("GradientLights: 橙/紫/蓝三色慢速环境光。20-30s循环。"),
        bullet("localStorage 7天内不重复显示。"),

        h2("5.4 移动端适配"),
        bullet("独立 Mobile Shell (flex md:hidden)"),
        bullet("5 Tab Bottom Nav + '更多' Sheet"),
        bullet("Framer Motion layoutId 活跃指示条 + spring scale(0.85) tap反馈"),
        bullet("@media (hover: none) 触摸设备检测: 44px最小tap target, 禁用hover-lift, 动量滚动"),
        bullet("Bottom Sheet 拖拽手柄视觉提示 (::before 36px横条)"),
        bullet("Tab snap滚动 (scroll-snap-type: x mandatory)"),
        bullet("PWA支持: manifest.webmanifest + sw.js"),

        // ═══ 6. MISC ═══
        h1("六、其他系统"),

        h2("6.1 Auth 系统"),
        bullet("Supabase邮件/密码注册登录"),
        bullet("Guest模式: mango_guest=1 cookie → Middleware放行 → 2次操作限制(mango-guest-action-count)"),
        bullet("Invite codes: tokentome111(Guest) / tokentome222(Login)"),
        bullet("Signout: 设置guest cookie → 无缝重新进入"),

        h2("6.2 路由重定向 (next.config.ts)"),
        para("13条301永久重定向 (v1 → v2 路由)"),
        bullet("/dashboard, /ai-tutor, /study-planner, /knowledge-hub, /knowledge-tree → /agent"),
        bullet("/exam-mode, /exam-master → /exam"),
        bullet("/mind-garden, /mind, /projects → /grow"),
        bullet("/mango-dna → /dna"),
        bullet("/analytics → /hub"),

        h2("6.3 组件文件统计"),
        table(["目录", "文件数", "说明"], [
          ["components/ui/", "16", "基础UI(shadcn): accordion/alert-dialog/avatar/badge/button/card/dialog/dropdown-menu/input/label/progress/separator/sheet/skeleton/surface/tabs/textarea/tooltip"],
          ["components/hub/", "8", "Hub页组件: welcome/magic-button/magic-card/goals/exams/chart/actions/courses/recommendations"],
          ["components/agent/", "6", "Agent页: chat/suggestions/context-panel/concept-explainer/exercise-generator/mistake-analyzer"],
          ["components/exam/", "8", "Exam页: workspace/uploader/review-booklet/knowledge-map/practice-session/mock-exam-player/pdf-export/predicted-topics"],
          ["components/mind/", "5", "Grow页(心理): journal-editor/mood-tracker/cbt-reframer/ai-companion-chat/growth-timeline/weekly-summary"],
          ["components/projects/", "5", "Grow页(项目): builder/card/workspace/gallery/ai-review-panel"],
          ["components/knowledge-hub/", "5", "知识库: notes-tab/flashcards-tab/resources-tab/graph-tab/import-note-dialog"],
          ["components/mango-dna/", "3", "DNA: content/voice-soul/VoiceRecorder"],
          ["components/onboarding/", "3", "Onboarding: MangoOnboarding/ParticleBackground/GradientLights"],
          ["components/layout/", "3", "布局: sidebar-v2/mobile-nav-v2/page-shell"],
          ["components/analytics/", "7", "分析: stat-overview/focus-gauge/goal-timeline/knowledge-radar/learning-hours/streak-calendar/weak-topics/weekly-heatmap"],
          ["legacy/", "10+", "旧版本组件(仍在引用链中)"],
        ]),
        para("总计约 100+ .tsx 组件文件。"),

        h2("6.4 已知问题清单"),
        table(["#", "问题", "影响"], [
          ["1", "Agent Memory写入后未在下次对话中读取", "Agent不知道用户历史"],
          ["2", "SAMPLE/MOCK 数据硬编码在8+组件中", "Cloud用户看到的数据≠真实数据"],
          ["3", "Cloud模式登录后数据全空", "登录=体验降级,最大流失点"],
          ["4", "7组功能重复(3套AI对话+4套内容生成+...)", "用户困惑+开发维护成本3倍"],
          ["5", "7个高质量功能用户无法发现(AgentMemory/知识图谱/CBT/SM-2...)", "开发资源浪费"],
          ["6", "21个Supabase表中有11个前端无写入路径", "数据库过度设计"],
          ["7", "AI输出没有质量评估/缓存/用户反馈循环", "输出质量不稳定"],
          ["8", "Guest 2次操作后体验完全死亡", "转化率为0"],
          ["9", "项目数据存储在localStorage而非Supabase", "Cloud模式项目丢失"],
          ["10", "Flashcards SM-2算法完整但数据极少", "用户看不到间隔重复的价值"],
        ]),
      ],
    },
  ],
});

// ═══════════════════════════════════════════════════════════════
// WRITE FILE
// ═══════════════════════════════════════════════════════════════
const buffer = await Packer.toBuffer(doc);
const outPath = "D:/Claudecoda学习/AI-Learning-OS/docs/MangoLearningOS_功能清单.docx";
fs.writeFileSync(outPath, buffer);
console.log(`✅ Written: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
