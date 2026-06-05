import { NextRequest, NextResponse } from "next/server";
import { completeChat } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// AI summary generation from a topic + content.
// POST { content, topic }
// Returns { summary: string } (markdown)
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 60;

function buildPrompt(topic: string, content: string): string {
  return `你是一个学习总结专家。请根据以下内容生成一份结构化的学习摘要。

主题：${topic}
内容：
"""
${content.slice(0, 5000)}
"""

请以 Markdown 格式输出，包含以下部分：
## 核心要点
- 3-5 个关键点

## 详细说明
简要阐述核心概念和原理

## 知识关联
这个概念与其他知识点的联系

## 学习建议
实践和复习建议

要求：
1. 简洁准确，总字数不超过 500 字
2. 使用中文输出
3. 适合作为笔记保存`;
}

function mockSummary(topic: string, content: string): string {
  const snippet = content.slice(0, 150).replace(/\n/g, " ");
  return `## 核心要点
- ${topic} 的基础概念理解
- 关键原理和机制
- 实际应用场景
- 常见误区与注意事项

## 详细说明
基于提供的内容「${snippet}...」，${topic} 涉及多个重要概念。配置 AI API Key 后可获得更精准的智能摘要。

## 知识关联
本主题与相关学科知识形成交叉，建议结合上下文深入理解。

## 学习建议
1. 先理解核心定义，再深入推导
2. 通过练习题巩固理解
3. 制作闪卡进行间隔重复复习`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const topic = body?.topic ?? "未命名主题";
    const content = body?.content ?? "";

    if (!content || content.length < 20) {
      return NextResponse.json({ summary: mockSummary(topic, content) });
    }

    const prompt = buildPrompt(topic, content);
    const raw = await completeChat([
      { role: "system", content: "你是一个学习总结AI。以Markdown格式返回结构化摘要，直接输出不要JSON包装。" },
      { role: "user", content: prompt },
    ], { temperature: 0.4 });

    const summary = raw?.trim() || mockSummary(topic, content);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[summary-generate] error:", err);
    return NextResponse.json({ summary: mockSummary("通用", "演示内容") });
  }
}
