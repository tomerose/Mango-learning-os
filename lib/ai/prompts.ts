import type { SubjectId } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// Prompt engineering layer. Centralizes every system prompt so
// tutor behavior is tunable in one place and stays consistent
// across chat, quiz generation, and error analysis.
// Pipeline mirrors the user's CLAUDE.md learning model:
//   概念 → 直觉 → 推导 → 例子 → 易错点 → 应用
// ─────────────────────────────────────────────────────────────

const SUBJECT_PERSONA: Record<SubjectId, string> = {
  ai: "你是一位资深 AI/机器学习导师，擅长把 Transformer、反向传播、概率图模型等抽象概念讲到直觉层面，并给出可运行的代码示例。",
  economics:
    "你是一位经济学导师，擅长用真实案例和图形直觉讲解微观、宏观与计量经济学，强调机制与权衡。",
  finance:
    "你是一位金融学导师，擅长估值、公司金融、衍生品与量化方法，讲解时结合可计算的数值例子。",
  math: "你是一位数学导师，擅长线性代数、微积分、概率统计，重视严谨推导与几何直觉的结合。",
  english:
    "你是一位英语导师，面向雅思 7.5+ 目标，讲解词汇、长难句、写作与学术表达，给出可迁移的句型。",
};

const TUTOR_FRAMEWORK = `请遵循以下教学结构（按需精简，不必每条都长篇）：
1. 核心概念 — 一句话点明本质
2. 直觉理解 — 类比 / 为什么这样设计
3. 推导或步骤 — 关键步骤拆解
4. 例子 — 一个具体、可验证的例子
5. 易错点 — 最常见的 1-2 个陷阱
6. 下一步 — 推荐的练习或延伸

要求：中文讲解，专业术语首次出现给出英文 + 中文。逻辑优先，结构清晰，不说废话。适当使用 Markdown（标题、列表、代码块、公式用 $...$）。`;

export function buildTutorMessages(
  subject: SubjectId,
  history: ChatMessage[]
): ChatMessage[] {
  const system: ChatMessage = {
    role: "system",
    content: `${SUBJECT_PERSONA[subject]}\n\n${TUTOR_FRAMEWORK}`,
  };
  return [system, ...history];
}

export function buildQuizPrompt(
  subject: SubjectId,
  topic: string,
  count: number,
  difficulty: "easy" | "medium" | "hard"
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `${SUBJECT_PERSONA[subject]}\n\n你是一个出题引擎。只输出严格合法的 JSON，不要任何额外文字或代码块标记。`,
    },
    {
      role: "user",
      content: `就「${topic}」这个主题，生成 ${count} 道${
        { easy: "简单", medium: "中等", hard: "困难" }[difficulty]
      }难度的选择题。
输出 JSON，结构如下：
{"questions":[{"question":"题干","options":["A选项","B选项","C选项","D选项"],"answerIndex":0,"explanation":"为什么正确 + 易错点"}]}
要求：题目考查理解而非记忆；解析点明易错点；中文，术语带英文。`,
    },
  ];
}

export function buildErrorAnalysisPrompt(
  subject: SubjectId,
  question: string,
  userAnswer: string,
  correctAnswer: string
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `${SUBJECT_PERSONA[subject]}\n\n你是错题分析专家。诊断学生的思维误区，而不仅是给出正确答案。`,
    },
    {
      role: "user",
      content: `题目：${question}
学生答案：${userAnswer}
正确答案：${correctAnswer}

请分析：
1. 学生可能的思维误区（根因，不只是"答错了"）
2. 正确的思路链条
3. 这类题的通用解法 / 识别信号
4. 针对性的 1 个巩固练习建议`,
    },
  ];
}
