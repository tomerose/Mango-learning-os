// ═══════════════════════════════════════════════════════════════
// Feature Output Contracts — Standardized output definitions
// Every major MangoOS feature MUST satisfy its contract before delivery.
// ═══════════════════════════════════════════════════════════════

export interface FeatureContract {
  featureName: string;
  userPromise: string;
  requiredInputs: string[];
  requiredSources: ("online-search" | "local-files" | "user-notes" | "ai-generation")[];
  generationSteps: string[];
  requiredOutputSections: string[];
  exportOptions: ("word" | "pdf" | "markdown" | "html" | "json" | "none")[];
  saveBehavior: "auto" | "prompt" | "never";
  qualityChecklist: string[];
}

// ═══════════════════════════════════════════════════════════════
// Contract Registry
// ═══════════════════════════════════════════════════════════════

export const FEATURE_CONTRACTS: Record<string, FeatureContract> = {
  "exam-review": {
    featureName: "期末备考 / Exam Review",
    userPromise: "输入课程信息 → AI研究+生成完整复习讲义 → 导出Word/PDF",
    requiredInputs: ["courseName", "examScope", "textbook"],
    requiredSources: ["online-search", "local-files"],
    generationSteps: [
      "1. 查询扩展 (3-5个搜索角度)",
      "2. 多源搜索 (Web + GitHub + Academic + YouTube + 本地文件)",
      "3. 源去重+排序+可靠性评分",
      "4. 源摘要+引用提取",
      "5. 大纲生成→用户确认",
      "6. 完整讲义生成 (18个section)",
      "7. 质量检查 (7个gate)",
      "8. Word/PDF/MD导出",
      "9. 保存session+源+文档元数据",
    ],
    requiredOutputSections: [
      "封面", "目录", "课程概述", "考纲范围图", "知识图谱",
      "分章节概念讲解", "逻辑框架", "高频考点表", "公式/定理速查表",
      "解题方法体系", "典型例题精讲", "常见陷阱", "记忆清单",
      "复习计划(3/7/14天)", "模拟试卷", "答案与解析", "考前冲刺页", "参考资料",
    ],
    exportOptions: ["word", "pdf", "markdown", "html"],
    saveBehavior: "auto",
    qualityChecklist: [
      "所有18个section已生成",
      "至少引用5个外部数据源",
      "无AI套话(作为AI/请注意/希望这些)",
      "Markdown格式正确",
      "例题有完整推导过程",
      "有可执行的复习计划",
      "章节逻辑连贯",
    ],
  },

  "mango-tutor": {
    featureName: "Mango Tutor / AI导师",
    userPromise: "结构化的知识点讲解 + 例题 + 练习题 + 跟进练习",
    requiredInputs: ["topic", "subject", "level"],
    requiredSources: ["online-search", "user-notes"],
    generationSteps: [
      "1. 知识点研究 (在线搜索+用户笔记)",
      "2. 结构化讲解生成",
      "3. 例题生成(含完整推导)",
      "4. 练习题生成(3-5题分层难度)",
      "5. 跟进推荐生成",
    ],
    requiredOutputSections: [
      "核心概念", "直觉理解", "推导/步骤", "经典例题",
      "练习题", "参考答案", "易错点", "延伸学习",
    ],
    exportOptions: ["word", "pdf", "markdown"],
    saveBehavior: "auto",
    qualityChecklist: [
      "有核心概念1句话定义",
      "有具体例子(非抽象描述)",
      "有分步推导",
      "有练习+答案",
      "有易错点提醒",
      "无AI套话",
    ],
  },

  "mind-garden": {
    featureName: "Mind Garden / 心理树洞",
    userPromise: "安全、结构化、隐私优先的情绪支持和自我了解工具",
    requiredInputs: ["userInput", "mode"],
    requiredSources: ["online-search"],
    generationSteps: [
      "1. 危机语言检测 (MUST RUN FIRST)",
      "2. 模式匹配→选择模板",
      "3. 基于WHO/NHS/APA公开资源的引导",
      "4. 结构化输出生成",
      "5. 安全标签附加",
    ],
    requiredOutputSections: [
      "标题", "摘要", "主体内容", "建议", "下一步行动", "隐私说明",
    ],
    exportOptions: ["markdown", "json", "none"],
    saveBehavior: "prompt",
    qualityChecklist: [
      "危机检测已运行",
      "无诊断性语言",
      "有隐私说明",
      "有专业帮助建议(如适用)",
      "内容温暖不评判",
      "有可操作的下一步",
      "基于公开可靠来源",
    ],
  },

  "knowledge-capture": {
    featureName: "Knowledge Capture / 知识捕获",
    userPromise: "将笔记/文件转化为结构化卡片、摘要和复习任务",
    requiredInputs: ["content", "subject"],
    requiredSources: ["online-search", "user-notes"],
    generationSteps: [
      "1. 内容分析→主题识别",
      "2. 关键概念提取",
      "3. 闪卡自动生成",
      "4. 摘要生成",
      "5. 知识图谱关联建议",
    ],
    requiredOutputSections: [
      "主题标签", "核心概念卡", "闪卡(3-10张)", "摘要", "关联推荐", "复习提醒",
    ],
    exportOptions: ["json", "markdown"],
    saveBehavior: "auto",
    qualityChecklist: [
      "自动标签至少2个",
      "闪卡问题具体、答案完整",
      "摘要50-100字",
      "有关联推荐",
    ],
  },

  "career-roadmap": {
    featureName: "Career Roadmap / 职业路径",
    userPromise: "基于市场/技能数据的学习路线图",
    requiredInputs: ["targetRole", "currentLevel"],
    requiredSources: ["online-search"],
    generationSteps: [
      "1. 职位市场研究 (Job listing分析)",
      "2. 技能需求分析",
      "3. 学习路径构建",
      "4. 项目推荐",
      "5. 时间线生成",
    ],
    requiredOutputSections: [
      "职位概述", "核心技能矩阵", "学习路径(分阶段)",
      "推荐项目", "学习资源", "时间线", "薪资参考(如可用)",
    ],
    exportOptions: ["word", "pdf", "markdown"],
    saveBehavior: "prompt",
    qualityChecklist: [
      "技能需求基于真实job listings",
      "有具体的学习项目(非泛泛而谈)",
      "时间线合理",
      "资源链接有效",
    ],
  },

  "research-report": {
    featureName: "Research / 研究报告",
    userPromise: "多源研究 → 结构化报告 → 含引用和来源排名",
    requiredInputs: ["topic", "depth"],
    requiredSources: ["online-search", "local-files"],
    generationSteps: [
      "1. 多源搜索 (Web+Academic+GitHub)",
      "2. 源排序+可靠性评分",
      "3. 信息综合",
      "4. 报告生成(含引用)",
      "5. 参考文献列表",
    ],
    requiredOutputSections: [
      "摘要", "背景", "方法", "发现", "讨论", "结论",
      "来源排名", "参考文献", "局限说明",
    ],
    exportOptions: ["word", "pdf", "markdown", "html"],
    saveBehavior: "auto",
    qualityChecklist: [
      "至少8个来源",
      "来源有可靠性评分",
      "有引用标注",
      "有局限说明",
      "无单源依赖",
    ],
  },
};

// ── Contract validation helper ──────────────────────────────────

export function validateContract(
  featureKey: string,
  output: Record<string, unknown>
): { valid: boolean; missing: string[]; warnings: string[] } {
  const contract = FEATURE_CONTRACTS[featureKey];
  if (!contract) return { valid: false, missing: ["Unknown feature"], warnings: [] };

  const missing = contract.requiredOutputSections.filter(
    section => !output[section] || !(output[section] as string)?.toString().trim()
  );

  const warnings: string[] = [];
  if (missing.length > 0) {
    warnings.push(`Missing sections: ${missing.join(", ")}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
