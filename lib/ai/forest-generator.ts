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
};

export function getOfficialForest(key: string): KnowledgeForest | null {
  return OFFICIAL_FORESTS[key] ?? null;
}

export function listOfficialForests(): { key: string; title: string; desc: string }[] {
  return [
    { key: "ielts-75", title: "IELTS 7.5+", desc: "雅思高分备考完整知识体系" },
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
