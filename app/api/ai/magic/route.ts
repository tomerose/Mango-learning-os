import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// Mango Magic — 一键智能生成中枢 API
// Orchestrates multiple module calls based on selected mode
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 60;

type MagicMode = "exam" | "notes" | "plan" | "learn" | "recommend";

interface MagicRequest {
  mode: MagicMode;
  input: string;       // user's free-text input
  subject?: string;
  timeframe?: string;
}

async function handleExam(input: string) {
  const msg = `用户明天有考试。请根据以下信息生成完整的备考资料包。使用中文。
考试信息：${input}

请生成以下内容（JSON格式）：
{
  "summary": "考前总览（50字）",
  "lecture": "## 核心考点\\n\\n### 1. 考点名\\n内容...\\n\\n（至少3个章节）",
  "exercises": [{"question":"题目","options":["A","B","C","D"],"answer":"A","explanation":"解析"}],
  "plan7Days": "## 7天复习计划\\n| 天数 | 任务 | 时长 |\\n|------|------|------|\\n...",
  "knowledgeGraph": "## 知识图谱\\n- 概念1 → 概念2 → 概念3\\n..."
}`;

  const raw = await completeChat([
    { role: "system", content: "你是备考专家。生成结构化、实用的备考资料。只输出严格合法的 JSON。" },
    { role: "user", content: msg },
  ], { temperature: 0.5 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return { lecture: raw, exercises: [], plan7Days: "", knowledgeGraph: "", summary: "AI 已生成内容" };
  }
}

async function handleNotes(input: string) {
  const msg = `用户想整理课堂笔记。请根据以下信息生成结构化笔记。使用中文。
主题：${input}

生成内容（JSON）：
{
  "notes": "## 课堂笔记\\n\\n### 核心概念\\n...\\n\\n### 重点详解\\n...\\n\\n### 易错点\\n...",
  "flashcards": [{"front":"问题","back":"答案"}],
  "summary": "一句话总结"
}`;

  const raw = await completeChat([
    { role: "system", content: "你是笔记整理专家。只输出严格合法的 JSON。" },
    { role: "user", content: msg },
  ], { temperature: 0.4 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return { notes: raw, flashcards: [], summary: "AI 已生成" };
  }
}

async function handlePlan(input: string) {
  const msg = `用户需要学习计划。使用中文。
需求：${input}

生成（JSON）：
{
  "plan": "## 学习计划\\n\\n### 总目标\\n...\\n\\n### 每日安排\\n| 日期 | 任务 | 时长 |\\n|------|------|------|\\n...\\n\\n### 里程碑\\n...",
  "milestones": ["里程碑1","里程碑2","里程碑3"],
  "resources": [{"title":"资源名","type":"article/course/video","description":"简介"}]
}`;

  const raw = await completeChat([
    { role: "system", content: "你是学习规划师。生成结构化学习计划。只输出严格合法的 JSON。" },
    { role: "user", content: msg },
  ], { temperature: 0.5 });

  try { return JSON.parse(extractJson(raw)); }
  catch { return { plan: raw, milestones: [], resources: [] }; }
}

async function handleLearn(input: string) {
  const msg = `用户想学习新领域知识。使用中文。
兴趣：${input}

生成（JSON）：
{
  "roadmap": "## 学习路线图\\n\\n### 阶段一：基础\\n...\\n\\n### 阶段二：进阶\\n...\\n\\n### 阶段三：实践\\n...",
  "keyConcepts": [{"name":"概念名","description":"一句话解释","importance":"high/medium/low"}],
  "resources": [{"title":"资源名","type":"article/course/video/book","url":"","description":"简介"}]
}`;

  const raw = await completeChat([
    { role: "system", content: "你是学习规划专家。只输出严格合法的 JSON。" },
    { role: "user", content: msg },
  ], { temperature: 0.5 });

  try { return JSON.parse(extractJson(raw)); }
  catch { return { roadmap: raw, keyConcepts: [], resources: [] }; }
}

async function handleRecommend(input: string) {
  const msg = `分析用户学习画像并推荐今日学习任务。使用中文。
用户信息：${input}

生成（JSON）：
{
  "profile": "用户画像分析（50字）",
  "recommendations": [{"title":"任务名称","description":"为什么推荐","module":"对应模块","action":"具体行动"}],
  "dailyFocus": "今日重点建议"
}`;

  const raw = await completeChat([
    { role: "system", content: "你是学习分析专家。只输出严格合法的 JSON。" },
    { role: "user", content: msg },
  ], { temperature: 0.5 });

  try { return JSON.parse(extractJson(raw)); }
  catch { return { profile: raw, recommendations: [], dailyFocus: "" }; }
}

const HANDLERS: Record<MagicMode, (input: string) => Promise<unknown>> = {
  exam: handleExam,
  notes: handleNotes,
  plan: handlePlan,
  learn: handleLearn,
  recommend: handleRecommend,
};

export async function POST(req: NextRequest) {
  try {
    const body: MagicRequest = await req.json();
    const { mode, input } = body;

    if (!mode || !input) {
      return NextResponse.json({ error: "请提供 mode 和 input 参数" }, { status: 400 });
    }

    const handler = HANDLERS[mode];
    if (!handler) {
      return NextResponse.json({ error: `未知模式: ${mode}` }, { status: 400 });
    }

    const result = await handler(input);
    return NextResponse.json({ mode, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Mango Magic 生成失败" },
      { status: 500 }
    );
  }
}
