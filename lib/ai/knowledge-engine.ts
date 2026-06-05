// ═══════════════════════════════════════════════════════════════
// Knowledge Engine — AI auto-extraction from notes
// Notes → Concepts → Graph Nodes → Resources → Learning Paths
// ═══════════════════════════════════════════════════════════════

import { completeChat, extractJson } from "@/lib/ai/client";
import type { Note } from "@/lib/types";

// ═══ Types ═══

export interface ExtractedConcept {
  name: string;
  type: "concept" | "method" | "formula" | "project" | "person" | "book" | "topic";
  confidence: number; // 0-1
  summary: string;    // one-line description
}

export interface KnowledgeRelation {
  from: string;       // concept name
  to: string;         // related concept name
  relation: "explains" | "uses" | "depends_on" | "related_to" | "extends" | "supports" | "contradicts";
}

export interface ResourceRecommendation {
  title: string;
  type: "book" | "course" | "video" | "paper" | "article" | "project" | "website";
  url?: string;
  relevance: number; // 0-1
  why: string;
}

export interface ExtractionResult {
  concepts: ExtractedConcept[];
  relations: KnowledgeRelation[];
  autoTags: string[];
  summary: string;
  resources: ResourceRecommendation[];
  flashcards: { front: string; back: string }[];
  learningPath: string[];
  tutorQuestions: string[];
}

// ═══ Extraction Pipeline ═══

const EXTRACTION_SYSTEM = `你是知识提取引擎。从用户的学习笔记中自动提取结构化知识。

输出严格 JSON（不要 markdown 代码块）：
{
  "concepts": [
    {"name": "概念名", "type": "concept|method|formula|project|person|book|topic", "confidence": 0.95, "summary": "一句话定义"}
  ],
  "relations": [
    {"from": "概念A", "to": "概念B", "relation": "explains|uses|depends_on|related_to|extends|supports|contradicts"}
  ],
  "autoTags": ["标签1", "标签2"],
  "summary": "笔记摘要（100字以内）",
  "resources": [
    {"title": "推荐资源", "type": "book|course|video|paper|article|project|website", "relevance": 0.8, "why": "为什么推荐"}
  ],
  "flashcards": [
    {"front": "问题", "back": "答案"}
  ],
  "learningPath": ["前置概念1", "核心概念", "进阶概念2"],
  "tutorQuestions": ["AI导师可以问的引导性问题"]
}

要求：
- 提取 3-8 个核心概念
- 每个概念都要有类型和置信度
- 关系必须连接真实存在的概念
- 推荐资源要具体真实，不要编造
- 闪卡问题考查理解而非记忆
- 学习路径按依赖关系排列`;

export async function extractFromNote(note: Note): Promise<ExtractionResult> {
  const prompt = `请分析以下学习笔记：

标题：${note.title}
学科：${note.subject}
已有标签：${note.tags.join(", ")}
内容：
${note.body.slice(0, 4000)}

提取所有知识点、关系、标签、摘要、资源和学习建议。`;

  try {
    const raw = await completeChat([
      { role: "system", content: EXTRACTION_SYSTEM },
      { role: "user", content: prompt },
    ], { temperature: 0.3 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return {
      concepts: (parsed.concepts ?? []).slice(0, 8),
      relations: (parsed.relations ?? []).slice(0, 10),
      autoTags: parsed.autoTags ?? [],
      summary: parsed.summary ?? "",
      resources: (parsed.resources ?? []).slice(0, 6),
      flashcards: (parsed.flashcards ?? []).slice(0, 5),
      learningPath: parsed.learningPath ?? [],
      tutorQuestions: parsed.tutorQuestions ?? [],
    };
  } catch {
    // Return minimal extraction on failure
    return {
      concepts: [{ name: note.title, type: "topic", confidence: 0.5, summary: note.body.slice(0, 80) }],
      relations: [],
      autoTags: note.tags,
      summary: note.body.slice(0, 100),
      resources: [],
      flashcards: [],
      learningPath: [],
      tutorQuestions: [],
    };
  }
}

// ═══ Client-side extraction helper (when AI is unavailable) ═══

export function extractFallback(note: Note): ExtractionResult {
  // Simple keyword-based concept extraction
  const words = note.body.split(/\s+/).filter(w => w.length > 3 && /^[A-Z]/.test(w));
  const uniqueWords = [...new Set(words)].slice(0, 6);

  return {
    concepts: uniqueWords.map(w => ({
      name: w.replace(/[，。！？,.!?]/g, ""),
      type: "concept" as const,
      confidence: 0.3,
      summary: `${note.title}中的关键概念`,
    })),
    relations: [],
    autoTags: note.tags,
    summary: note.body.slice(0, 120),
    resources: [],
    flashcards: [],
    learningPath: [],
    tutorQuestions: [],
  };
}
