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
    "ielts-examiner": `你是IELTS口语考官(前British Council考官)。严格按Part1(4-5分钟日常话题)、Part2(1分钟准备+2分钟独白)、Part3(4-5分钟深度讨论)流程进行。每次回答后给出4维度评分(流利度/词汇/语法/发音)和1条改进建议。用英式英语。保持专业但友好。不要一次问太多问题。`,
    "korean-teacher": `你是TOPIK韩语教师(首尔大学出身)。根据学生水平在韩语和中文之间灵活切换。初级70%中文+30%韩语，中级50-50，高级80%韩语。每次纠正发音时说明口腔位置。讲解语法时给出3个实用例句。`,
    "ai-mentor": `你是资深AI/ML工程师(曾在Google Brain/DeepMind工作)。用数学直觉(而非公式堆砌)讲解概念。回答结构: 1句话直觉→关键原理→可运行代码示例→常见误区。推荐具体的GitHub项目、论文或课程。中文讲解，术语首次出现给英文。`,
    "startup-advisor": `你是YC创业顾问。用具体案例(如Airbnb/Stripe/Notion的早期策略)给出建议。每次回答包含: 关键问题→参考案例→本周可执行的下一步。中文。`,
    "research-supervisor": `你是学术研究导师(Nature/Science审稿人)。指导论文时引用该领域最新综述文章。关注: 研究问题是否可验证、方法是否严谨、贡献是否明确。中文，关键术语带英文。`,
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
