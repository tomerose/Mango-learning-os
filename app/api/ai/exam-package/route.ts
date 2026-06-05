import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson, isAIConfigured } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// POST /api/ai/exam-package
// Generates a complete exam review package: knowledge map,
// chapter summaries, key points, common mistakes, predicted
// topics, revision schedule + mock questions.
// Falls back to a rich mock when no AI_API_KEY is configured.
// ─────────────────────────────────────────────────────────────

interface Chapter {
  title: string;
  summary: string;
  keyPoints: string[];
  importance: "high" | "medium" | "low";
}

interface KnowledgeNode {
  id: string;
  label: string;
  importance: "high" | "medium" | "low";
  children?: KnowledgeNode[];
}

interface KeyPoint {
  topic: string;
  point: string;
  formula?: string;
}

interface CommonMistake {
  topic: string;
  mistake: string;
  correction: string;
}

interface PredictedTopic {
  topic: string;
  subject: string;
  confidence: number; // 0-100
  reason: string;
}

interface RevisionDay {
  day: number;
  date: string;
  topic: string;
  subject: string;
  type: "review" | "practice" | "mock" | "rest";
}

interface MockQuestion {
  id: string;
  type: "mcq" | "fill_blank" | "problem";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface ExamPackageResponse {
  knowledgeMap: KnowledgeNode[];
  chapters: Chapter[];
  keyPoints: KeyPoint[];
  commonMistakes: CommonMistake[];
  predictedTopics: PredictedTopic[];
  revisionSchedule: RevisionDay[];
  mockQuestions: MockQuestion[];
}

function generateMockData(
  subject: string,
  topics: string[],
  examDate: string
): ExamPackageResponse {
  const now = new Date();
  const examD = new Date(examDate);
  const daysUntil = Math.max(
    1,
    Math.ceil((examD.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const topicList =
    topics.length > 0
      ? topics
      : [
          `${subject} Fundamentals`,
          `${subject} Core Concepts`,
          `${subject} Advanced Topics`,
          `${subject} Applications`,
          `${subject} Problem Solving`,
        ];

  const knowledgeMap: KnowledgeNode[] = topicList.map((t, i) => ({
    id: `km-${i}`,
    label: t,
    importance: i < 2 ? "high" : i < 4 ? "medium" : "low",
    children: [
      {
        id: `km-${i}-1`,
        label: `${t} — Theory`,
        importance: "high",
        children: [
          { id: `km-${i}-1-1`, label: "Key definitions", importance: "high" },
          { id: `km-${i}-1-2`, label: "Core principles", importance: "high" },
        ],
      },
      {
        id: `km-${i}-2`,
        label: `${t} — Practice`,
        importance: "medium",
        children: [
          { id: `km-${i}-2-1`, label: "Standard problems", importance: "medium" },
          { id: `km-${i}-2-2`, label: "Edge cases", importance: "low" },
        ],
      },
    ],
  }));

  const chapters: Chapter[] = topicList.map((t, i) => ({
    title: `Chapter ${i + 1}: ${t}`,
    summary: `This chapter covers the essential concepts of ${t} within ${subject}. Focus on understanding the foundational principles and their practical applications. Key areas include theoretical frameworks, common problem-solving patterns, and real-world case studies that illustrate core ideas.`,
    keyPoints: [
      `Understand the fundamental definition of ${t}`,
      `Master the standard problem-solving approach for ${t}`,
      `Connect ${t} to broader ${subject} concepts`,
    ],
    importance: i < 2 ? "high" : i < 4 ? "medium" : "low",
  }));

  const keyPoints: KeyPoint[] = topicList.flatMap((t) => [
    {
      topic: t,
      point: `Core principle: grasp the why behind ${t} before memorizing formulas`,
      formula: `${t.split(" ")[0].substring(0, 3).toUpperCase()} = f(x)`,
    },
    {
      topic: t,
      point: `Common application: recognize the ${t} pattern in exam problems`,
    },
  ]);

  const commonMistakes: CommonMistake[] = topicList.map((t) => ({
    topic: t,
    mistake: `Confusing ${t} with similar-sounding concepts without checking definitions`,
    correction: `Always write down the precise definition of ${t} before attempting any problem. Compare and contrast with related terms.`,
  }));

  const predictedTopics: PredictedTopic[] = topicList.map((t, i) => ({
    topic: t,
    subject,
    confidence: Math.max(30, 95 - i * 12),
    reason: `Appears in ${Math.floor(Math.random() * 4 + 3)} of last 5 exam papers; foundational to ${subject}`,
  }));

  const revisionSchedule: RevisionDay[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  for (let d = 0; d < Math.min(daysUntil, 14); d++) {
    const dayDate = new Date(now.getTime() + d * dayMs);
    const topicIndex = d % topicList.length;
    const type: RevisionDay["type"] =
      d === 0
        ? "review"
        : d % 4 === 0
          ? "mock"
          : d % 3 === 0
            ? "practice"
            : "review";
    revisionSchedule.push({
      day: d + 1,
      date: dayDate.toISOString().slice(0, 10),
      topic: topicList[topicIndex],
      subject,
      type,
    });
  }

  const mockQuestions: MockQuestion[] = [
    {
      id: "mq-1",
      type: "mcq",
      question: `Which of the following best defines the core concept of ${topicList[0]}?`,
      options: [
        `A systematic approach to understanding ${topicList[0]}`,
        `A random collection of facts about ${topicList[0]}`,
        `An outdated method no longer used in ${subject}`,
        `Only relevant to advanced ${subject} researchers`,
      ],
      answer: `A systematic approach to understanding ${topicList[0]}`,
      explanation: `The core concept of ${topicList[0]} is fundamentally about systematic understanding, not random memorization.`,
      difficulty: "easy",
      topic: topicList[0],
    },
    {
      id: "mq-2",
      type: "fill_blank",
      question: `The primary relationship in ${topicList[Math.min(1, topicList.length - 1)]} can be expressed as: ________ depends on both internal factors and external conditions.`,
      options: [],
      answer: topicList[Math.min(1, topicList.length - 1)],
      explanation: `Understanding that ${topicList[Math.min(1, topicList.length - 1)]} depends on multiple interacting factors is key to mastery.`,
      difficulty: "medium",
      topic: topicList[Math.min(1, topicList.length - 1)],
    },
    {
      id: "mq-3",
      type: "mcq",
      question: `What is the most common mistake students make when studying ${topicList[0]}?`,
      options: [
        "Memorizing formulas without understanding the underlying principles",
        "Studying too many hours",
        "Using too many textbooks",
        "Asking too many questions in class",
      ],
      answer: "Memorizing formulas without understanding the underlying principles",
      explanation: "Rote memorization without conceptual understanding leads to poor performance on novel problems.",
      difficulty: "easy",
      topic: topicList[0],
    },
    {
      id: "mq-4",
      type: "problem",
      question: `Apply the concepts of ${topicList[0]} to solve: Given a standard scenario where the key variables interact, demonstrate your understanding by explaining the step-by-step approach you would take.`,
      options: [],
      answer: `Step 1: Identify the key variables and their relationships.\nStep 2: Apply the fundamental formula of ${topicList[0]}.\nStep 3: Check boundary conditions.\nStep 4: Interpret the result in context.`,
      explanation: `This problem tests your ability to apply ${topicList[0]} concepts systematically rather than just recalling formulas.`,
      difficulty: "hard",
      topic: topicList[0],
    },
    {
      id: "mq-5",
      type: "mcq",
      question: `When approaching a complex problem in ${topicList[Math.min(2, topicList.length - 1)]}, the best first step is to:`,
      options: [
        "Break it down into smaller sub-problems",
        "Immediately start writing the final answer",
        "Skip it and hope it doesn't appear on the exam",
        "Copy from a classmate",
      ],
      answer: "Break it down into smaller sub-problems",
      explanation: "Decomposition is a universal problem-solving strategy that makes complex problems manageable.",
      difficulty: "medium",
      topic: topicList[Math.min(2, topicList.length - 1)],
    },
    {
      id: "mq-6",
      type: "fill_blank",
      question: `A common pitfall in ${topicList[0]} is failing to account for ________, which can lead to significant errors in the final result.`,
      options: [],
      answer: "edge cases and assumptions",
      explanation: "Always verify your assumptions and test edge cases when solving problems.",
      difficulty: "medium",
      topic: topicList[0],
    },
  ];

  return {
    knowledgeMap,
    chapters,
    keyPoints,
    commonMistakes,
    predictedTopics,
    revisionSchedule,
    mockQuestions,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      subject = "General",
      topics = [],
      examDate,
      materials = [],
    } = body;

    if (!examDate) {
      return NextResponse.json(
        { error: "examDate is required" },
        { status: 400 }
      );
    }

    // When AI is configured, generate using the LLM
    if (isAIConfigured()) {
      const prompt = `You are an expert exam preparation assistant. Generate a comprehensive exam review package for the following:
- Subject: ${subject}
- Topics to cover: ${topics.length > 0 ? topics.join(", ") : "All core topics"}
- Exam date: ${examDate}
- Study materials provided: ${materials.length > 0 ? materials.join(" | ") : "None"}

Return ONLY valid JSON (no markdown fences, no prose) matching this exact TypeScript structure:

{
  "knowledgeMap": [{ "id": "string", "label": "string", "importance": "high"|"medium"|"low", "children": [...] }],
  "chapters": [{ "title": "string", "summary": "string", "keyPoints": ["string"], "importance": "high"|"medium"|"low" }],
  "keyPoints": [{ "topic": "string", "point": "string", "formula"?: "string" }],
  "commonMistakes": [{ "topic": "string", "mistake": "string", "correction": "string" }],
  "predictedTopics": [{ "topic": "string", "subject": "string", "confidence": number, "reason": "string" }],
  "revisionSchedule": [{ "day": number, "date": "YYYY-MM-DD", "topic": "string", "subject": "string", "type": "review"|"practice"|"mock"|"rest" }],
  "mockQuestions": [{ "id": "string", "type": "mcq"|"fill_blank"|"problem", "question": "string", "options": ["string"], "answer": "string", "explanation": "string", "difficulty": "easy"|"medium"|"hard", "topic": "string" }]
}

Generate a useful, realistic exam package. Include at least 4-6 knowledge map nodes, 4-5 chapters, 6-8 key points, 4-5 common mistakes, 5-7 predicted topics, a revision schedule covering up to 14 days until the exam date (with at most 14 entries), and 6-8 mock questions of varying difficulty and type.`;

      try {
        const aiResponse = await completeChat(
          [
            { role: "system", content: "You are a precise exam preparation engine. Always respond with valid JSON only, no explanation." },
            { role: "user", content: prompt },
          ],
          { temperature: 0.4 }
        );

        const jsonStr = extractJson(aiResponse);
        const parsed = JSON.parse(jsonStr) as ExamPackageResponse;

        // Validate shape minimally
        if (!parsed.knowledgeMap || !parsed.mockQuestions) {
          throw new Error("AI response missing required fields");
        }

        return NextResponse.json(parsed, { status: 200 });
      } catch (aiErr) {
        console.error("[exam-package] AI generation failed, using mock:", aiErr);
      }
    }

    // Mock fallback
    const mock = generateMockData(subject, topics, examDate);
    return NextResponse.json(mock, {
      status: 200,
      headers: { "X-Mock-Data": "true" },
    });
  } catch (err) {
    console.error("[exam-package] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to generate exam package" },
      { status: 500 }
    );
  }
}
