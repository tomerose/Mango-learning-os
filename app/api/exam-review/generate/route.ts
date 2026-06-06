// ═══════════════════════════════════════════════════════════════
// POST /api/exam-review/generate — Full exam review handout generation
// Pipeline: research → outline → full content → quality check → export
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { executeResearch, type ResearchSource } from "@/lib/ai/research-orchestrator";
import { validateContent, type QualityReport, type ContentType } from "@/lib/ai/content-quality-v2";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 120;

// ── Types ───────────────────────────────────────────────────────

interface GenerateRequest {
  courseName: string;
  school?: string;
  professor?: string;
  textbook?: string;
  examScope?: string;
  targetScore?: string;
  timeLeft?: string;
  uploadedFiles?: Array<{ name: string; text: string }>;
  additionalNotes?: string;
}

interface ReviewSection {
  title: string;
  content: string;
}

interface ReviewPackage {
  meta: {
    courseName: string;
    school?: string;
    generatedAt: string;
    targetScore?: string;
    timeLeft?: string;
    sourceCount: number;
    qualityScore: number;
  };
  sections: {
    coverPage: string;
    tableOfContents: string;
    courseOverview: string;
    examScopeMap: string;
    knowledgeGraph: string;
    chapterConcepts: ReviewSection[];
    logicFramework: string;
    highFreqPoints: string;
    formulaTable: string;
    problemMethods: string;
    typicalExamples: string;
    commonTraps: string;
    memoryChecklist: string;
    reviewPlan: string;
    mockExam: string;
    answerKey: string;
    finalSprint: string;
    references: string;
  };
  qualityReport: QualityReport;
  sources: ResearchSource[];
}

// ── Helper: generate one section ───────────────────────────────

async function generateSection(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<string> {
  try {
    const raw = await completeChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.4, maxTokens });
    return raw.trim();
  } catch {
    return `（生成失败 — 请稍后重试此部分）`;
  }
}

// ── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { courseName, school, professor, textbook, examScope, targetScore, timeLeft, uploadedFiles, additionalNotes } = body;

  if (!courseName?.trim()) {
    return NextResponse.json({ error: "courseName required" }, { status: 400 });
  }

  try {
    // ── STEP 1: Research ──────────────────────────────────────
    const searchQuery = `${courseName} ${examScope ?? ""} ${textbook ?? ""} 期末考试 复习 重点 知识点 例题`.trim();
    const research = await executeResearch(searchQuery, {
      maxSources: 12,
      timeoutMs: 10000,
      includeLocalFiles: !!uploadedFiles?.length,
      localFileContents: uploadedFiles,
    });

    // ── STEP 2: Build comprehensive context ───────────────────
    const contextParts: string[] = [
      `课程: ${courseName}`,
      school ? `学校: ${school}` : "",
      professor ? `教授: ${professor}` : "",
      textbook ? `教材: ${textbook}` : "",
      examScope ? `考试范围: ${examScope}` : "",
      targetScore ? `目标分数: ${targetScore}` : "",
      timeLeft ? `剩余时间: ${timeLeft}` : "",
      additionalNotes ? `附加说明: ${additionalNotes}` : "",
      uploadedFiles?.length ? `已上传 ${uploadedFiles.length} 个文件` : "",
    ].filter(Boolean);

    if (uploadedFiles?.length) {
      const fileContext = uploadedFiles.map(f =>
        `[文件: ${f.name}]\n${f.text.slice(0, 3000)}`
      ).join("\n\n");
      contextParts.push(`\n上传文件内容:\n${fileContext}`);
    }

    if (research.synthesizedContext) {
      contextParts.push(`\n在线研究整合:\n${research.synthesizedContext}`);
    }

    const fullContext = contextParts.join("\n");

    // ── STEP 3: Generate outline first ────────────────────────
    const outlineSystem = `你是考试复习讲义编纂专家。基于提供的课程信息和研究资料，生成完整的复习讲义大纲。

输出JSON格式（严格）:
{
  "chapters": ["章节1标题", "章节2标题", ...],
  "keyTopics": ["重点主题1", ...],
  "highFreqAreas": ["高频考点1", ...],
  "commonTraps": ["常见陷阱1", ...],
  "recommendedExamples": ["推荐例题类型1", ...]
}

讲义结构固定包含: 封面→目录→课程概述→考纲范围→知识图谱→分章节讲解→逻辑框架→高频考点→公式定理表→解题方法→典型例题→常见陷阱→记忆清单→复习计划→模拟题→答案→冲刺页→参考`;

    const outlineRaw = await completeChat([
      { role: "system", content: outlineSystem },
      { role: "user", content: fullContext.slice(0, 6000) },
    ], { temperature: 0.3, maxTokens: 1000 });

    const outline = JSON.parse(extractJson(outlineRaw));

    // ── STEP 4: Generate full handout sections ─────────────────

    const generationSystem = `你是考试复习讲义编纂专家。生成的内容必须专业、准确、结构化、可操作。

风格要求:
- 学术风格但易读
- 中文为主，术语首次出现带英文
- 使用Markdown格式（标题层级、表格、列表、加粗重点）
- 具体、不泛泛而谈
- 不要"作为AI"等套话
- 每个section独立完整`;

    // Generate all sections in parallel where possible
    const [
      courseOverview,
      examScopeMap,
      knowledgeGraph,
      logicFramework,
      highFreqPoints,
      formulaTable,
      problemMethods,
      typicalExamples,
      commonTraps,
      memoryChecklist,
      mockExam,
      finalSprint,
    ] = await Promise.all([
      // Course Overview
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请撰写"课程概述"部分。包括：课程定位、核心内容模块、考试形式简要说明、学习建议。300-500字。`),

      // Exam Scope Map
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请绘制"考纲范围图"。使用表格展示各章节在考试中的权重(估计百分比)、重点程度(★1-5)、建议投入时间。`),

      // Knowledge Graph
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请生成"知识图谱"。使用文字描述各知识点之间的关联关系、前置依赖、核心节点。可以用嵌套列表或ASCII图表示。`),

      // Logic Framework
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请构建"逻辑框架"。将整个课程的知识用一个统一的逻辑框架串联。说明各部分之间的逻辑递进关系。`),

      // High-frequency exam points
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请列出"高频考点"。表格形式：考点名称 | 出现频率 | 难度 | 典型题型 | 备考建议。至少列出8-15个。`),

      // Formula/Theorem/Definition table
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请整理"公式/定理/定义速查表"。表格形式：名称 | 公式/定义 | 适用条件 | 备注。至少10条。使用LaTeX风格的公式表示（如$E=mc^2$）。`),

      // Problem-solving methods
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请撰写"解题方法体系"。对每种主要题型给出：题型识别→解题步骤(1,2,3...)→关键公式→易错提醒。使用Step-by-step格式。`),

      // Typical examples with full derivation
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请提供"典型例题精讲"。选3-5道最具代表性的题目。每道题包含：题目→分析→完整解答→答案→技巧总结。解答过程详细到每一步。`),

      // Common traps and mistakes
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请整理"常见陷阱与误区"。格式：⚠ 陷阱描述 → 为什么容易错 → 正确做法 → 记忆口诀。至少列出8个。`),

      // Memory checklist
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请生成"考前记忆清单"。用复选框格式(- [ ])，按章节或主题分组。每项是一个需要记住的核心知识点。至少20项。`),

      // Mock exam questions
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请生成"模拟试卷"。包含：考试说明、题型分布、5-8道选择题、3-5道填空题、2-3道计算/简答题。题目要有区分度(容易+中等+困难)。每题标注分值。`),

      // Final sprint sheet
      generateSection(generationSystem,
        `${fullContext}\n\n课程大纲:\n${JSON.stringify(outline)}\n\n请撰写"考前冲刺页"。一页纸精华：最高频的10个公式、最常考的5个知识点、最容易出错的3类题、考前必背的5句话。极度浓缩，适合考前30分钟快速浏览。`),
    ]);

    // Generate chapter-by-chapter concepts
    const chapters = outline.chapters ?? ["基础知识", "核心内容", "进阶应用", "综合复习"];
    const chapterSections: ReviewSection[] = await Promise.all(
      chapters.slice(0, 10).map(async (ch: string, i: number) => {
        const content = await generateSection(generationSystem,
          `${fullContext}\n\n请为"第${i + 1}章: ${ch}"撰写复习讲解。包括：1)章节概述(1-2句) 2)核心知识点(3-5个，每个带解释) 3)关键公式/定理 4)典型例题1道 5)易错点。使用Markdown格式，300-600字。`);
        return { title: ch, content };
      })
    );

    // Review plan (3-day, 7-day, 14-day)
    const reviewPlan = await generateSection(generationSystem,
      `${fullContext}\n\n请生成复习计划。分别给出:
- 3天紧急复习计划(考前突击): 每天的具体任务和时间分配
- 7天标准复习计划: 分阶段复习策略
- 14天充分复习计划: 完整的学习-练习-模考-查漏补缺周期
使用表格和时间线格式。`);

    // References
    const referencesRaw = await completeChat([
      { role: "system", content: generationSystem },
      {
        role: "user",
        content: `整理本讲义的参考文献和推荐资源列表。包括: ${research.sources.slice(0, 8).map(s => s.title).join(", ")} 以及${textbook ?? ""}等。格式化为正式引用格式。`,
      },
    ], { temperature: 0.3, maxTokens: 600 });

    // ── STEP 5: Build answer key from mock exam ─────────────────
    const answerKey = await generateSection(generationSystem,
      `以下是模拟试卷，请提供详细答案解析:\n${mockExam}\n\n请对每一道题提供：正确答案 + 详细解析 + 涉及的知识点。`);

    // ── STEP 6: Compile full document ──────────────────────────
    const coverPage = `# ${courseName} 期末复习讲义\n\n> **学校**: ${school ?? "—"}\n> **教授**: ${professor ?? "—"}\n> **教材**: ${textbook ?? "—"}\n> **目标分数**: ${targetScore ?? "—"}\n> **剩余时间**: ${timeLeft ?? "—"}\n> **生成日期**: ${new Date().toLocaleDateString("zh-CN")}\n> **数据来源**: ${research.sources.length} 个在线资源 + ${uploadedFiles?.length ?? 0} 个上传文件\n\n---\n\n> 🤖 本讲义由 MangoOS AI 研究引擎自动生成，数据来源于在线搜索和用户提供的资料。建议结合教材和课堂笔记使用。`;

    const toc = `# 目录\n\n1. 课程概述\n2. 考纲范围图\n3. 知识图谱\n${chapterSections.map((ch, i) => `${i + 4}. 第${i + 1}章: ${ch.title}`).join("\n")}\n${chapterSections.length + 4}. 逻辑框架\n${chapterSections.length + 5}. 高频考点\n${chapterSections.length + 6}. 公式/定理速查表\n${chapterSections.length + 7}. 解题方法体系\n${chapterSections.length + 8}. 典型例题精讲\n${chapterSections.length + 9}. 常见陷阱与误区\n${chapterSections.length + 10}. 考前记忆清单\n${chapterSections.length + 11}. 复习计划\n${chapterSections.length + 12}. 模拟试卷\n${chapterSections.length + 13}. 答案与解析\n${chapterSections.length + 14}. 考前冲刺页\n${chapterSections.length + 15}. 参考资料`;

    // ── STEP 7: Quality check ──────────────────────────────────
    const fullDocument = [
      coverPage, toc, courseOverview, examScopeMap, knowledgeGraph,
      ...chapterSections.map(ch => `# 第X章: ${ch.title}\n\n${ch.content}`),
      logicFramework, highFreqPoints, formulaTable, problemMethods,
      typicalExamples, commonTraps, memoryChecklist, reviewPlan,
      mockExam, answerKey, finalSprint, referencesRaw,
    ].join("\n\n---\n\n");

    const qualityReport = validateContent(fullDocument, "exam-review", {
      sourceCount: research.sources.length,
    });

    // ── STEP 8: Assemble response ──────────────────────────────
    const reviewPackage: ReviewPackage = {
      meta: {
        courseName,
        school,
        generatedAt: new Date().toISOString(),
        targetScore,
        timeLeft,
        sourceCount: research.sources.length,
        qualityScore: qualityReport.overallScore,
      },
      sections: {
        coverPage,
        tableOfContents: toc,
        courseOverview,
        examScopeMap,
        knowledgeGraph,
        chapterConcepts: chapterSections,
        logicFramework,
        highFreqPoints,
        formulaTable,
        problemMethods,
        typicalExamples,
        commonTraps,
        memoryChecklist,
        reviewPlan,
        mockExam,
        answerKey,
        finalSprint,
        references: referencesRaw,
      },
      qualityReport,
      sources: research.sources.slice(0, 15),
    };

    return NextResponse.json({
      success: true,
      reviewPackage,
      researchId: research.id,
      warnings: research.warnings,
    });
  } catch (err) {
    console.error("[exam-review/generate]", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Generation failed",
      success: false,
    }, { status: 500 });
  }
}
