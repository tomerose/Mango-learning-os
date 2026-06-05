// ═══════════════════════════════════════════════════════════════
// AI Knowledge Forest Generator
// User enters "IELTS 7.5" → AI generates full knowledge forest
// including: graph, notes, resources, learning path, flashcards
// ═══════════════════════════════════════════════════════════════

import { completeChat, extractJson } from "@/lib/ai/client";

export interface ForestTopic {
  name: string;
  type: "concept" | "skill" | "book" | "paper" | "topic" | "formula" | "project";
  summary: string;
  children: string[]; // related topic names
}

export interface ForestResource {
  title: string;
  type: "book" | "course" | "video" | "paper" | "website" | "project";
  url?: string;
  description: string;
  forTopic: string;
}

export interface ForestNote {
  title: string;
  topic: string;
  body: string;
  tags: string[];
}

export interface ForestPath {
  phase: string;
  duration: string;
  tasks: string[];
  topics: string[];
}

export interface KnowledgeForest {
  title: string;
  description: string;
  topics: ForestTopic[];
  resources: ForestResource[];
  notes: ForestNote[];
  learningPath: ForestPath[];
  flashcards: { front: string; back: string }[];
  tutorPrompts: string[];
  estimatedWeeks: number;
}

const FOREST_SYSTEM = `你是知识森林生成引擎。根据用户的学习目标，生成完整的知识体系。

输出严格JSON：
{
  "title": "森林标题",
  "description": "一句话描述",
  "estimatedWeeks": 8,
  "topics": [
    {"name":"主题名","type":"concept|skill|book|paper|topic|formula|project","summary":"一句话定义","children":["子主题1","子主题2"]}
  ],
  "resources": [
    {"title":"资源名","type":"book|course|video|paper|website|project","url":"","description":"简介","forTopic":"关联主题"}
  ],
  "notes": [
    {"title":"笔记标题","topic":"关联主题","body":"笔记内容(100-300字)","tags":["标签"]}
  ],
  "learningPath": [
    {"phase":"阶段名","duration":"2周","tasks":["任务"],"topics":["主题"]}
  ],
  "flashcards": [
    {"front":"问题","back":"答案"}
  ],
  "tutorPrompts": ["AI导师引导问题"]
}

要求：
- 生成8-15个知识主题节点
- 每个主题有简要定义
- 6-10个学习资源推荐
- 3-5条笔记
- 3-5个学习阶段
- 5-8张闪卡
- 主题之间有合理的层次关系
- 内容具体、准确、可操作`;

// ═══ Pre-built Official Forests (fallback when AI unavailable) ═══

export const OFFICIAL_FORESTS: Record<string, KnowledgeForest> = {
  "ielts-75": {
    title: "IELTS 7.5+ 知识森林",
    description: "雅思高分备考完整知识体系——听力、阅读、写作、口语全覆盖",
    estimatedWeeks: 12,
    topics: [
      { name: "听力理解", type: "skill", summary: "Section 1-4 题型与策略", children: ["填空题技巧", "地图题", "多选题策略"] },
      { name: "阅读理解", type: "skill", summary: "60分钟3篇文章的时间管理", children: ["T/F/NG判断", "Heading匹配", "Summary填空"] },
      { name: "写作Task1", type: "skill", summary: "图表描述与数据对比", children: ["线图", "柱状图", "流程图"] },
      { name: "写作Task2", type: "skill", summary: "议论文结构", children: ["观点类", "讨论类", "问题解决类"] },
      { name: "口语Part1-3", type: "skill", summary: "流利度与连贯性", children: ["话题卡技巧", "扩展回答", "发音训练"] },
      { name: "学术词汇", type: "topic", summary: "AWL 570词 + 话题词汇", children: ["教育", "科技", "环境"] },
      { name: "语法精要", type: "concept", summary: "7分语法结构", children: ["复合句", "被动语态", "条件句"] },
      { name: "模考策略", type: "skill", summary: "全真模拟与时间分配", children: ["听力模考", "阅读模考", "写作模考"] },
    ],
    resources: [
      { title: "Cambridge IELTS 14-19", type: "book", description: "官方真题集", forTopic: "模考策略" },
      { title: "IELTS Liz YouTube", type: "video", description: "免费技巧视频", forTopic: "写作Task2" },
      { title: "Anki IELTS词汇卡组", type: "website", description: "间隔重复记单词", forTopic: "学术词汇" },
      { title: "IELTS Advantage", type: "course", description: "在线写作课程", forTopic: "写作Task1" },
      { title: "BBC 6 Minute English", type: "video", description: "每日听力练习", forTopic: "听力理解" },
      { title: "Simon's IELTS Blog", type: "website", description: "前考官范文", forTopic: "写作Task2" },
    ],
    notes: [
      { title: "听力Section 3学术对话策略", topic: "听力理解", body: "Section 3通常是2-4人的学术讨论。关键词：信号词（actually, but, however）后面通常是答案。提前读题划关键词，预判答案类型（数字/名字/地点）。", tags: ["听力", "Section3", "技巧"] },
      { title: "Task2 四段式结构模板", topic: "写作Task2", body: "Introduction: 改写题目+明确立场。Body1: 第一个论点+解释+例子。Body2: 第二个论点+解释+例子。Conclusion: 总结+重申立场。每段用连接词开头。", tags: ["写作", "Task2", "结构"] },
      { title: "口语Part2 一分钟准备法", topic: "口语Part1-3", body: "拿到话题卡后：第一步圈关键词，第二步在纸上写4个bullet points（who/what/where/why），第三步每个点扩展2-3句话。不要写完整句子——只写关键词。", tags: ["口语", "Part2", "技巧"] },
      { title: "AWL Sublist 1 高频词", topic: "学术词汇", body: "analyse, approach, area, assess, assume, authority, available, benefit, concept, consist, constitute, context, contract, create, data, define, derive, distribute, economy, environment", tags: ["词汇", "AWL", "学术"] },
    ],
    learningPath: [
      { phase: "基础诊断", duration: "1周", tasks: ["完成一套完整模考", "分析各科分数", "设定目标分"], topics: ["模考策略"] },
      { phase: "技能训练", duration: "6周", tasks: ["每日听力30分钟", "每周2篇Task2", "每日口语自练15分钟"], topics: ["听力理解", "阅读理解", "写作Task2", "口语Part1-3"] },
      { phase: "词汇语法强化", duration: "3周", tasks: ["每日50个AWL词汇", "每周语法专项练习"], topics: ["学术词汇", "语法精要"] },
      { phase: "冲刺模考", duration: "2周", tasks: ["隔日一套模考", "错题回顾", "时间管理优化"], topics: ["模考策略", "写作Task1"] },
    ],
    flashcards: [
      { front: "IELTS听力有几个Section？", back: "4个Section。S1日常对话，S2独白，S3学术讨论，S4学术讲座。共40题，30分钟+10分钟誊写。" },
      { front: "Task2最低字数？建议时间分配？", back: "最低250字。建议40分钟：5分钟构思，30分钟写作，5分钟检查。" },
      { front: "口语评分四个维度？", back: "Fluency & Coherence流利连贯，Lexical Resource词汇，Grammatical Range语法，Pronunciation发音。各占25%。" },
      { front: "T/F/NG题型的核心区别？", back: "True=文章明确说了。False=文章说了相反的内容。Not Given=文章没提到。" },
      { front: "雅思总分如何计算？", back: "四科平均分，0.25进位到0.5，0.75进位到下一整数。如6.25→6.5，7.75→8.0。" },
    ],
    tutorPrompts: [
      "请模拟一次IELTS口语Part2考试",
      "请帮我批改这篇Task2作文",
      "听力Section3有哪些信号词？",
      "如何在一个月内提升词汇量？",
    ],
  },
  'toefl-100': {
  "title": "TOEFL 100+ 知识森林",
  "description": "托福高分备考——阅读、听力、口语、写作全覆盖",
  "estimatedWeeks": 10,
  "topics": [
    {
      "name": "阅读策略",
      "type": "skill",
      "summary": "学术文章速读与题型技巧",
      "children": [
        "事实信息题",
        "推理题",
        "词汇题"
      ]
    },
    {
      "name": "听力笔记",
      "type": "skill",
      "summary": "讲座与对话关键信息抓取",
      "children": [
        "信号词",
        "速记法",
        "态度题"
      ]
    },
    {
      "name": "口语独立",
      "type": "skill",
      "summary": "15秒准备45秒回答",
      "children": [
        "经历类",
        "观点类",
        "时间控制"
      ]
    },
    {
      "name": "综合写作",
      "type": "skill",
      "summary": "阅读+听力→写作整合",
      "children": [
        "对比结构",
        "信息整合"
      ]
    },
    {
      "name": "学术词汇",
      "type": "topic",
      "summary": "AWL核心+学科词汇",
      "children": [
        "自然科学",
        "社会科学"
      ]
    }
  ],
  "resources": [
    {
      "title": "Official TOEFL Tests",
      "type": "book",
      "description": "ETS官方真题",
      "forTopic": "阅读策略"
    },
    {
      "title": "TST Prep",
      "type": "video",
      "description": "免费技巧视频",
      "forTopic": "口语独立"
    }
  ],
  "notes": [
    {
      "title": "听力笔记符号",
      "topic": "听力笔记",
      "body": "上升↑ 下降↓ 导致→ 原因∵ 重要★。掌握10个符号高效记笔记。",
      "tags": [
        "听力",
        "笔记"
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "诊断",
      "duration": "1周",
      "tasks": [
        "完成TPO模考"
      ],
      "topics": [
        "阅读策略"
      ]
    },
    {
      "phase": "突破",
      "duration": "6周",
      "tasks": [
        "每日听力",
        "每周写作"
      ],
      "topics": [
        "听力笔记",
        "综合写作"
      ]
    },
    {
      "phase": "冲刺",
      "duration": "3周",
      "tasks": [
        "TPO模考",
        "错题分析"
      ],
      "topics": [
        "口语独立"
      ]
    }
  ],
  "flashcards": [
    {
      "front": "TOEFL满分？",
      "back": "120分。听说读写各30分。"
    }
  ],
  "tutorPrompts": [
    "模拟一次TOEFL口语题"
  ]
},

  'ai-engineer': {
  "title": "AI 工程师 知识森林",
  "description": "从零到AI工程师的完整学习路径",
  "estimatedWeeks": 24,
  "topics": [
    {
      "name": "Python编程",
      "type": "skill",
      "summary": "数据处理与算法",
      "children": [
        "NumPy",
        "Pandas"
      ]
    },
    {
      "name": "机器学习",
      "type": "concept",
      "summary": "监督与非监督学习",
      "children": [
        "回归",
        "分类",
        "聚类"
      ]
    },
    {
      "name": "深度学习",
      "type": "concept",
      "summary": "神经网络与反向传播",
      "children": [
        "CNN",
        "RNN",
        "Transformer"
      ]
    },
    {
      "name": "NLP",
      "type": "skill",
      "summary": "自然语言处理",
      "children": [
        "Tokenization",
        "Embeddings",
        "LLMs"
      ]
    },
    {
      "name": "MLOps",
      "type": "skill",
      "summary": "模型部署",
      "children": [
        "Docker",
        "FastAPI",
        "CI/CD"
      ]
    },
    {
      "name": "数学基础",
      "type": "concept",
      "summary": "线代·概率·优化",
      "children": [
        "矩阵运算",
        "梯度下降"
      ]
    }
  ],
  "resources": [
    {
      "title": "CS229 Stanford",
      "type": "course",
      "description": "吴恩达ML",
      "forTopic": "机器学习"
    },
    {
      "title": "Fast.ai",
      "type": "course",
      "description": "实用DL",
      "forTopic": "深度学习"
    },
    {
      "title": "HuggingFace",
      "type": "course",
      "description": "NLP实战",
      "forTopic": "NLP"
    }
  ],
  "notes": [
    {
      "title": "Transformer注意力",
      "topic": "深度学习",
      "body": "Q=XWq K=XWk V=XWv。Attention=softmax(QK^T/dk)V。多头并行后concat。",
      "tags": [
        "Attention"
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "编程+数学",
      "duration": "4周",
      "tasks": [
        "Python",
        "线代复习"
      ],
      "topics": [
        "Python编程",
        "数学基础"
      ]
    },
    {
      "phase": "ML+DL",
      "duration": "10周",
      "tasks": [
        "CS229",
        "Kaggle"
      ],
      "topics": [
        "机器学习",
        "深度学习"
      ]
    },
    {
      "phase": "专项+工程",
      "duration": "10周",
      "tasks": [
        "NLP项目",
        "部署模型"
      ],
      "topics": [
        "NLP",
        "MLOps"
      ]
    }
  ],
  "flashcards": [
    {
      "front": "过拟合？",
      "back": "训练好测试差。正则化/Dropout/早停/数据增强。"
    }
  ],
  "tutorPrompts": [
    "讲解反向传播",
    "CNN vs Transformer"
  ]
},

  'ml-basics': {
  "title": "机器学习基础 知识森林",
  "description": "ML核心理论与实践",
  "estimatedWeeks": 12,
  "topics": [
    {
      "name": "监督学习",
      "type": "concept",
      "summary": "有标签预测建模",
      "children": [
        "线性回归",
        "逻辑回归",
        "决策树",
        "SVM"
      ]
    },
    {
      "name": "无监督学习",
      "type": "concept",
      "summary": "无标签模式发现",
      "children": [
        "K-Means",
        "PCA",
        "DBSCAN"
      ]
    },
    {
      "name": "特征工程",
      "type": "skill",
      "summary": "数据预处理与构建",
      "children": [
        "归一化",
        "独热编码",
        "特征选择"
      ]
    },
    {
      "name": "模型评估",
      "type": "concept",
      "summary": "性能度量",
      "children": [
        "交叉验证",
        "ROC/AUC",
        "F1-Score"
      ]
    },
    {
      "name": "集成学习",
      "type": "concept",
      "summary": "组合模型提性能",
      "children": [
        "Bagging",
        "Boosting",
        "XGBoost"
      ]
    }
  ],
  "resources": [
    {
      "title": "Hands-On ML",
      "type": "book",
      "description": "Aurelien Geron",
      "forTopic": "监督学习"
    },
    {
      "title": "Kaggle",
      "type": "website",
      "description": "竞赛平台",
      "forTopic": "特征工程"
    }
  ],
  "notes": [
    {
      "title": "偏差-方差权衡",
      "topic": "模型评估",
      "body": "高偏差=欠拟合。高方差=过拟合。目标找到最优平衡点。",
      "tags": [
        "偏差",
        "方差"
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "理论",
      "duration": "4周",
      "tasks": [
        "监督/非监督"
      ],
      "topics": [
        "监督学习",
        "无监督学习"
      ]
    },
    {
      "phase": "实战",
      "duration": "4周",
      "tasks": [
        "Kaggle入门"
      ],
      "topics": [
        "特征工程",
        "模型评估"
      ]
    },
    {
      "phase": "高级",
      "duration": "4周",
      "tasks": [
        "XGBoost调参"
      ],
      "topics": [
        "集成学习"
      ]
    }
  ],
  "flashcards": [
    {
      "front": "过拟合vs欠拟合",
      "back": "欠拟合=都差。过拟合=训好测差。加数据/正则化。"
    }
  ],
  "tutorPrompts": [
    "偏差-方差权衡讲解",
    "特征选择方法"
  ]
},

  'cs-core': {
  "title": "计算机科学核心 知识森林",
  "description": "CS四大核心：数据结构、算法、OS、网络",
  "estimatedWeeks": 16,
  "topics": [
    {
      "name": "数据结构",
      "type": "concept",
      "summary": "数据组织与存储",
      "children": [
        "数组链表",
        "树与图",
        "哈希表",
        "堆栈"
      ]
    },
    {
      "name": "算法设计",
      "type": "concept",
      "summary": "问题求解方法论",
      "children": [
        "排序搜索",
        "动态规划",
        "贪心",
        "分治"
      ]
    },
    {
      "name": "操作系统",
      "type": "concept",
      "summary": "资源管理",
      "children": [
        "进程线程",
        "内存管理",
        "并发"
      ]
    },
    {
      "name": "计算机网络",
      "type": "concept",
      "summary": "通信协议栈",
      "children": [
        "TCP/IP",
        "HTTP/DNS",
        "安全"
      ]
    }
  ],
  "resources": [
    {
      "title": "CLRS算法导论",
      "type": "book",
      "description": "算法圣经",
      "forTopic": "算法设计"
    },
    {
      "title": "CS50 Harvard",
      "type": "course",
      "description": "哈佛CS入门",
      "forTopic": "数据结构"
    }
  ],
  "notes": [
    {
      "title": "时间复杂度",
      "topic": "算法设计",
      "body": "O(1)<O(log n)<O(n)<O(n log n)<O(n^2)<O(2^n)。n=10^6时O(n^2)不可行。",
      "tags": [
        "复杂度"
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "基础",
      "duration": "4周",
      "tasks": [
        "语言+数据结构"
      ],
      "topics": [
        "数据结构"
      ]
    },
    {
      "phase": "算法",
      "duration": "6周",
      "tasks": [
        "LeetCode日2题"
      ],
      "topics": [
        "算法设计"
      ]
    },
    {
      "phase": "系统",
      "duration": "6周",
      "tasks": [
        "OS课程"
      ],
      "topics": [
        "操作系统",
        "计算机网络"
      ]
    }
  ],
  "flashcards": [
    {
      "front": "栈vs队列",
      "back": "栈LIFO后进先出。队列FIFO先进先出。"
    }
  ],
  "tutorPrompts": [
    "动态规划核心思想",
    "TCP三次握手"
  ]
},

  'cfa-l1': {
  "title": "CFA Level 1 知识森林",
  "description": "CFA一级十大科目体系",
  "estimatedWeeks": 20,
  "topics": [
    {
      "name": "伦理标准",
      "type": "concept",
      "summary": "CFA道德准则",
      "children": [
        "七大准则",
        "GIPS"
      ]
    },
    {
      "name": "定量方法",
      "type": "concept",
      "summary": "统计与概率",
      "children": [
        "时间价值",
        "假设检验"
      ]
    },
    {
      "name": "财务报表分析",
      "type": "skill",
      "summary": "三表与比率",
      "children": [
        "利润表",
        "资产负债表",
        "杜邦分析"
      ]
    },
    {
      "name": "公司金融",
      "type": "concept",
      "summary": "资本预算",
      "children": [
        "NPV/IRR",
        "WACC"
      ]
    },
    {
      "name": "权益投资",
      "type": "concept",
      "summary": "股票估值",
      "children": [
        "DDM",
        "相对估值"
      ]
    },
    {
      "name": "固定收益",
      "type": "concept",
      "summary": "债券定价",
      "children": [
        "久期",
        "收益率曲线"
      ]
    },
    {
      "name": "投资组合",
      "type": "skill",
      "summary": "资产配置",
      "children": [
        "MPT",
        "CAPM"
      ]
    }
  ],
  "resources": [
    {
      "title": "CFA官方教材",
      "type": "book",
      "description": "CFA Institute",
      "forTopic": "伦理标准"
    },
    {
      "title": "Kaplan Notes",
      "type": "book",
      "description": "备考精讲",
      "forTopic": "财务报表分析"
    }
  ],
  "notes": [
    {
      "title": "杜邦分析",
      "topic": "财务报表分析",
      "body": "ROE=利润率×周转率×杠杆。三因子驱动。",
      "tags": [
        "杜邦",
        "ROE"
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "伦理+定量",
      "duration": "4周",
      "tasks": [
        "道德记忆"
      ],
      "topics": [
        "伦理标准",
        "定量方法"
      ]
    },
    {
      "phase": "核心科目",
      "duration": "10周",
      "tasks": [
        "财报深度"
      ],
      "topics": [
        "财务报表分析",
        "权益投资"
      ]
    },
    {
      "phase": "冲刺",
      "duration": "6周",
      "tasks": [
        "模考刷题"
      ],
      "topics": [
        "投资组合"
      ]
    }
  ],
  "flashcards": [
    {
      "front": "NPV决策规则",
      "back": "NPV=Σ(CFt/(1+r)^t)-初始投资。>0接受。"
    }
  ],
  "tutorPrompts": [
    "DCF估值流程",
    "有效市场假说"
  ]
},
};

export function getOfficialForest(key: string): KnowledgeForest | null {
  return OFFICIAL_FORESTS[key] ?? null;
}

export function listOfficialForests(): { key: string; title: string; desc: string }[] {
  return [
    { key: "ielts-75", title: "IELTS 7.5+", desc: "雅思高分备考" },
    { key: "toefl-100", title: "TOEFL 100+", desc: "托福高分备考" },
    { key: "ai-engineer", title: "AI工程师", desc: "从零到AI工程师" },
    { key: "ml-basics", title: "机器学习基础", desc: "ML核心理论" },
    { key: "cs-core", title: "计算机科学核心", desc: "CS四大核心" },
    { key: "cfa-l1", title: "CFA Level 1", desc: "CFA一级备考" },
    { key: "psych-101", title: "心理学入门", desc: "心理学主要流派" },
  ];
}

// ═══ AI Generator ═══

export async function generateForest(query: string): Promise<KnowledgeForest> {
  try {
    const raw = await completeChat([
      { role: "system", content: FOREST_SYSTEM },
      { role: "user", content: `请为以下学习目标生成知识森林：${query}` },
    ], { temperature: 0.5 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return {
      title: parsed.title ?? `${query} 知识森林`,
      description: parsed.description ?? "",
      estimatedWeeks: parsed.estimatedWeeks ?? 8,
      topics: parsed.topics ?? [],
      resources: parsed.resources ?? [],
      notes: parsed.notes ?? [],
      learningPath: parsed.learningPath ?? [],
      flashcards: parsed.flashcards ?? [],
      tutorPrompts: parsed.tutorPrompts ?? [],
    };
  } catch {
    // Return the IELTS forest as fallback
    return OFFICIAL_FORESTS["ielts-75"];
  }
}
