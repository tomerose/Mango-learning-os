/**
 * MangoOS V14.3 — Artifact → Flashcards / Quiz Bridge
 *
 * Converts any artifact section into SM-2 flashcards and quiz questions.
 */
import type { Artifact, ArtifactSection } from "@/lib/artifact/types";

// ── Flashcard ──────────────────────────────────────────────────

export interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
  sourceSection: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

/** Generate flashcards from artifact sections */
export function artifactToFlashcards(
  artifact: Artifact,
  maxCards: number = 20,
): GeneratedFlashcard[] {
  const cards: GeneratedFlashcard[] = [];
  const sections = artifact.sections.filter(
    s => s.importance === "critical" || s.importance === "high"
  );

  for (const section of sections) {
    const sectionCards = extractFlashcardsFromSection(section, artifact.tags);
    cards.push(...sectionCards);
  }

  return cards.slice(0, maxCards);
}

function extractFlashcardsFromSection(
  section: ArtifactSection,
  tags: string[],
): GeneratedFlashcard[] {
  const cards: GeneratedFlashcard[] = [];
  const text = section.content;

  // Pattern 1: Bolded terms "**term**" or "**term**：definition"
  const boldPattern = /\*\*(.+?)\*\*[：:]\s*(.+?)(?=\n|$)/g;
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    cards.push({
      id: `fc_${Date.now()}_${cards.length}`,
      front: match[1].trim(),
      back: match[2].trim().slice(0, 300),
      sourceSection: section.id,
      difficulty: "medium",
      tags: [...tags, section.title.slice(0, 20)],
    });
    if (cards.length >= 30) break;
  }

  // Pattern 2: Table rows (| term | definition |)
  const tablePattern = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;
  while ((match = tablePattern.exec(text)) !== null) {
    const front = match[1].replace(/[*_`]/g, "").trim();
    const back = match[2].replace(/[*_`]/g, "").trim();
    if (front.length > 2 && back.length > 2 && !front.startsWith("--") && !front.startsWith("类别") && !front.startsWith("术语")) {
      cards.push({
        id: `fc_${Date.now()}_${cards.length}`,
        front,
        back: back.slice(0, 300),
        sourceSection: section.id,
        difficulty: back.length > 100 ? "hard" : "easy",
        tags: [...tags, section.title.slice(0, 20)],
      });
    }
  }

  // Pattern 3: Numbered concepts "1. **term** — definition" or "1. term: definition"
  const listPattern = /^\d+\.?\s+(?:\*\*)?(.+?)(?:\*\*)?\s*[—\-:：]\s*(.+?)$/gm;
  while ((match = listPattern.exec(text)) !== null) {
    cards.push({
      id: `fc_${Date.now()}_${cards.length}`,
      front: match[1].trim().slice(0, 80),
      back: match[2].trim().slice(0, 300),
      sourceSection: section.id,
      difficulty: "medium",
      tags: [...tags, section.title.slice(0, 20)],
    });
    if (cards.length >= 30) break;
  }

  return cards;
}

// ── Quiz ───────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  type: "choice" | "fill" | "short_answer";
  question: string;
  options?: string[];       // for choice type
  correctAnswer: string;
  explanation: string;
  sourceSection: string;
  difficulty: "easy" | "medium" | "hard";
}

/** Generate quiz questions from artifact sections */
export function artifactToQuiz(
  artifact: Artifact,
  maxQuestions: number = 10,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const criticalSections = artifact.sections.filter(
    s => s.importance === "critical" || s.importance === "high"
  );

  for (const section of criticalSections) {
    const qs = extractQuestionsFromSection(section);
    questions.push(...qs);
    if (questions.length >= maxQuestions * 2) break;
  }

  return questions.slice(0, maxQuestions);
}

function extractQuestionsFromSection(section: ArtifactSection): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const text = section.content;

  // Pattern 1: Questions marked with "题目" or "例题" or "Q:" or "**Q**"
  const qPattern = /(?:题目|例题|问题|[Qq])\s*[：:]\s*(.+?)(?:\n|$)/g;
  let match;
  while ((match = qPattern.exec(text)) !== null) {
    const q = match[1].trim();
    if (q.length > 10) {
      questions.push({
        id: `qz_${Date.now()}_${questions.length}`,
        type: "short_answer",
        question: q,
        correctAnswer: "（见原文解析）",
        explanation: "参考原文对应章节的详细解答。",
        sourceSection: section.id,
        difficulty: "medium",
      });
    }
  }

  // Pattern 2: "定义", "什么是", "解释" → fill-in-the-blank
  const defPattern = /(?:什么是|定义|解释)\s*(.+?)[？?]/g;
  while ((match = defPattern.exec(text)) !== null) {
    questions.push({
      id: `qz_${Date.now()}_${questions.length}`,
      type: "fill",
      question: `请解释：${match[1].trim()}`,
      correctAnswer: "（参考原文对应概念的定义）",
      explanation: "检查原文以获取完整定义。",
      sourceSection: section.id,
      difficulty: "easy",
    });
    if (questions.length >= 15) break;
  }

  // Pattern 3: Fallback — create questions from key sentences
  if (questions.length === 0) {
    const sentences = text.split(/[。.！!？?\n]/).filter(s => s.trim().length > 30).slice(0, 5);
    for (const s of sentences) {
      questions.push({
        id: `qz_${Date.now()}_${questions.length}`,
        type: "short_answer",
        question: `请概括以下内容的要点：${s.trim().slice(0, 80)}…`,
        correctAnswer: "（总结上述内容的 1-2 个关键点）",
        explanation: s.trim(),
        sourceSection: section.id,
        difficulty: "medium",
      });
    }
  }

  return questions;
}
