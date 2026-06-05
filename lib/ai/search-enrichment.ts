// ═══════════════════════════════════════════════════════════════
// Search Enrichment Engine
// Fetches real context from web sources to enrich AI responses
// GitHub, Zhihu, Google, Arxiv → summarized context → AI prompt
// ═══════════════════════════════════════════════════════════════

export interface EnrichedContext {
  query: string;
  sources: { title: string; url: string; snippet: string; platform: string }[];
  summary: string;
}

// ═══ Search URL generators for different platforms ═══

function searchUrls(query: string) {
  const encoded = encodeURIComponent(query);
  return {
    google: `https://www.google.com/search?q=${encoded}`,
    github: `https://github.com/search?q=${encoded}&type=repositories`,
    zhihu: `https://www.zhihu.com/search?type=content&q=${encoded}`,
    arxiv: `https://arxiv.org/search/?searchtype=all&query=${encoded}`,
    scholar: `https://scholar.google.com/scholar?q=${encoded}`,
    bing: `https://www.bing.com/search?q=${encoded}+learning`,
  };
}

// ═══ Generate enriched system prompt with search context ═══

export function buildEnrichedPrompt(
  personaId: string,
  userQuery: string,
  context?: EnrichedContext,
): string {
  const personaPrompts: Record<string, string> = {
    "ielts-examiner": `你是IELTS口语考官。按Part1/2/3流程提问，评分4维度：流利度、词汇、语法、发音。每次回答后给简短反馈和改进建议。用英语对话。`,
    "korean-teacher": `你是韩语老师。根据学生水平用韩语和中文混合教学。纠正发音，讲解语法。按照TOPIK考试标准设计练习。`,
    "ai-mentor": `你是资深AI/ML技术导师。从数学直觉出发讲解概念。批判性思维优先——反问引导。中文讲解，术语带英文。结合最新的实际应用和开源项目。`,
    "startup-advisor": `你是创业顾问。结合实际案例（如Y Combinator投资的公司）给出可操作建议。中文对话。`,
    "research-supervisor": `你是学术研究导师。指导论文选题、文献综述、研究方法。引用相关领域最新论文。中文对话。`,
  };

  const basePrompt = personaPrompts[personaId] ?? personaPrompts["ai-mentor"];

  if (!context || context.sources.length === 0) {
    return `${basePrompt}\n\n保持回复简洁（2-4句话），适合语音朗读。`;
  }

  // Enrich with search context
  const sourceText = context.sources
    .slice(0, 5)
    .map(s => `- [${s.platform}] ${s.title}: ${s.snippet}`)
    .join("\n");

  return `${basePrompt}

【实时搜索上下文 — 基于以下真实信息回答】
${sourceText}

要求：结合以上真实信息回答问题。保持简洁（3-5句话），适合语音朗读。如果信息充分，给出具体的数据或案例。`;
}

// ═══ Generate high-quality learning notes ═══

export function buildEnrichedNotePrompt(
  topic: string,
  sources: { title: string; snippet: string; platform: string }[],
): string {
  const sourceText = sources.slice(0, 8).map(s =>
    `- [${s.platform}] ${s.title}: ${s.snippet}`,
  ).join("\n");

  return `请基于以下真实资料，为"${topic}"生成一份高质量学习笔记。

参考资料：
${sourceText}

要求：
1. 核心概念定义（一句话点明）
2. 关键原理或机制（2-3段）
3. 实际应用案例（至少1个）
4. 常见误区或易错点
5. 推荐学习资源

格式：Markdown，中文，术语带英文。高质量、可复习、可直接作为闪卡使用。`;
}

// ═══ Generate structured search context (client-side helper) ═══

export function generateSearchLinks(topic: string) {
  const urls = searchUrls(topic);
  return [
    { platform: "GitHub", url: urls.github, label: "开源项目" },
    { platform: "Zhihu", url: urls.zhihu, label: "知乎讨论" },
    { platform: "Google", url: urls.google, label: "全网搜索" },
    { platform: "Arxiv", url: urls.arxiv, label: "学术论文" },
    { platform: "Google Scholar", url: urls.scholar, label: "文献搜索" },
  ];
}
