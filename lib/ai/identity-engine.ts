// ═══════════════════════════════════════════════════════════════
// Learning Identity Engine — Personas, Voice, Memory
// Each identity: goal + progress + memory + voice + knowledge
// ═══════════════════════════════════════════════════════════════

export interface LearningIdentity {
  id: string;
  name: string;
  goal: string;
  persona: VoicePersona;
  progress: number; // 0-100
  notes: string[];
  topics: string[];
}

export interface VoicePersona {
  id: string;
  name: string;
  role: string;
  prompt: string;
  teachingStyle: string;
  voice: "warm" | "precise" | "encouraging" | "analytical";
}

// ═══ Built-in Personas ═══

export const BUILTIN_PERSONAS: VoicePersona[] = [
  {
    id: "ielts-examiner",
    name: "IELTS 口语考官",
    role: "雅思口语考试模拟官",
    prompt: "你是IELTS口语考官。按Part1/2/3流程提问，评分4个维度：流利度、词汇、语法、发音。每次回答后给出简短反馈和改进建议。",
    teachingStyle: "结构化面试 — 严格控制时间，按真实考试流程",
    voice: "precise",
  },
  {
    id: "korean-teacher",
    name: "韩语老师",
    role: "TOPIK 韩语教师",
    prompt: "你是韩语老师。根据学生水平用韩语和中文混合教学，纠正发音，讲解语法。按照TOPIK考试标准设计练习。",
    teachingStyle: "沉浸式语言教学 — 70%目标语言 + 30%母语解释",
    voice: "encouraging",
  },
  {
    id: "ai-mentor",
    name: "AI 导师",
    role: "AI/ML 技术导师",
    prompt: "你是AI/ML导师。从数学直觉出发讲解概念，给出可运行的代码示例。批判性思维优先——不只讲怎么做，讲为什么。",
    teachingStyle: "苏格拉底式 — 反问引导，推导优先，不直接给答案",
    voice: "analytical",
  },
  {
    id: "startup-advisor",
    name: "创业顾问",
    role: "创业与产品顾问",
    prompt: "你是创业顾问。帮助分析市场、验证想法、设计MVP、规划融资。结合实际案例给出可操作建议。",
    teachingStyle: "教练式 — 提出关键问题，帮助理清思路",
    voice: "warm",
  },
  {
    id: "research-supervisor",
    name: "研究导师",
    role: "学术研究导师",
    prompt: "你是学术研究导师。指导论文选题、文献综述、研究方法、数据分析、学术写作。遵循学术规范，培养研究思维。",
    teachingStyle: "导师式 — 指引方向，审阅反馈，培养独立研究能力",
    voice: "precise",
  },
];

// ═══ Default Identities ═══

export const DEFAULT_IDENTITIES: LearningIdentity[] = [
  {
    id: "ielts-candidate",
    name: "IELTS Candidate",
    goal: "IELTS 7.5+",
    persona: BUILTIN_PERSONAS[0],
    progress: 35,
    notes: ["已完成听力S1-2训练", "写作Task2模板熟练"],
    topics: ["听力", "阅读", "写作", "口语"],
  },
  {
    id: "ai-engineer",
    name: "AI Engineer",
    goal: "成为AI工程师",
    persona: BUILTIN_PERSONAS[2],
    progress: 45,
    notes: ["完成CS229课程", "实现Transformer"],
    topics: ["机器学习", "深度学习", "NLP"],
  },
  {
    id: "korean-learner",
    name: "TOPIK Learner",
    goal: "TOPIK 4级",
    persona: BUILTIN_PERSONAS[1],
    progress: 20,
    notes: ["掌握韩语基础语法", "TOPIK1词汇200个"],
    topics: ["词汇", "语法", "听力", "阅读"],
  },
];
