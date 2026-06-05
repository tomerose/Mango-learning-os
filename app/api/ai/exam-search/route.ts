import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson, isAIConfigured } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// POST /api/ai/exam-search
// 联网搜索资料 — 接收主题查询，AI 模拟深度网络搜索，
// 返回结构化的学习资料摘要。
// 当 AI 未配置时返回模拟搜索结果。
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query = "", subject = "General" } = body;

    if (!query.trim()) {
      return NextResponse.json({ error: "请输入搜索主题" }, { status: 400 });
    }

    if (isAIConfigured()) {
      const prompt = `你是一个学术搜索引擎。用户正在备考，需要关于以下主题的详细学习资料。

搜索主题：${query.trim()}
相关学科：${subject}

请模拟一次深度网络搜索，返回以下内容（中文输出）：

1. **核心概念** — 3-5 个关键概念的精确定义
2. **知识框架** — 该主题的主要知识结构（层次化）
3. **重点难点** — 考试中最常见的考点和易错点
4. **公式/定理** — 重要的公式、定理及其含义（如适用）
5. **典型例题思路** — 2-3 个典型题目的解题思路
6. **推荐学习路径** — 建议的学习顺序和重点

请以结构化的方式组织内容，使用中文。内容要具体、有深度，避免泛泛而谈。
不要输出 JSON，直接输出结构化的文本。`;

      try {
        const aiResponse = await completeChat(
          [
            { role: "system", content: "你是一个专业的学术搜索引擎和备考助手。总是输出中文，内容具体且有深度。" },
            { role: "user", content: prompt },
          ],
          { temperature: 0.5 }
        );

        return NextResponse.json({ text: aiResponse, query: query.trim(), subject }, { status: 200 });
      } catch (aiErr) {
        console.error("[exam-search] AI generation failed:", aiErr);
      }
    }

    // Mock fallback — 当 AI 未配置时
    const mockText = `## 核心概念

1. **${query.trim()}** — 该主题的核心定义，涵盖基本原理与应用场景。
2. **理论基础** — 支撑该主题的关键理论框架，理解这些是解题的前提。
3. **应用领域** — 该主题在 ${subject} 中的实际应用和案例。

## 知识框架

- **基础层**：基本定义、核心术语、前置知识
- **进阶层**：原理推导、关键公式、常见模型
- **应用层**：实际案例分析、跨领域连接、前沿发展

## 重点难点

- **高频考点**：概念辨析、公式应用、综合推理
- **易错陷阱**：混淆相似概念、忽略边界条件、计算粗心
- **应对策略**：画图辅助理解、分步骤推导、检验边界值

## 公式/定理

- 核心公式及其推导过程
- 使用条件与注意事项
- 典型变形与扩展

## 典型例题思路

1. **基础题**：直接考察概念理解，确保定义清晰
2. **应用题**：综合运用多个知识点，按步骤分解
3. **难题**：需要创造性思维，冷静分析已知条件

## 推荐学习路径

1. 先理解核心概念（1-2 天）
2. 掌握公式推导（2-3 天）
3. 练习典型题目（3-5 天）
4. 做综合模拟（考前 1 周）`;

    return NextResponse.json(
      { text: mockText, query: query.trim(), subject },
      {
        status: 200,
        headers: { "X-Mock-Data": "true" },
      }
    );
  } catch (err) {
    console.error("[exam-search] Unexpected error:", err);
    return NextResponse.json(
      { error: "搜索失败，请重试" },
      { status: 500 }
    );
  }
}
