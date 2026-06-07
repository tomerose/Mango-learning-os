/**
 * MangoOS V14.7 — Intent Router
 * Routes Mango Today intentions to the correct Agent/Outcome flow
 * with structured prompt generation.
 */

export type IntentType = "daily_plan" | "study_outcome" | "material_organize" | "project_thinking" | "daily_review";

export interface IntentPayload {
  id: string;
  type: IntentType;
  userGoal: string;
  suggestedPrompt: string;
  recommendedRoute: string;
  createdAt: string;
  source: "mango_today" | "custom_input" | "file_upload";
}

// ── Prompt generators by type ──────────────────────────────────

const PROMPTS: Record<IntentType, (goal: string) => string> = {
  daily_plan: (goal) =>
    `帮我安排今天的学习计划：\n\n目标：${goal}\n\n请生成：\n1. 今日优先级任务（Top 3）\n2. 时间分配建议\n3. 最低完成线\n4. 晚间复盘问题\n\n输出为结构化的每日计划。`,

  study_outcome: (goal) =>
    `帮我生成一份学习讲义：\n\n主题：${goal}\n\n请包含：\n## 知识框架\n## 重点考点分析\n## 典型例题精讲（至少 3 道）\n## 常见错误与避坑\n## 复习计划（3-7 天）\n## 自测题\n\n输出为完整可用的复习文档。`,

  material_organize: (goal) =>
    `帮我整理以下学习资料：\n\n${goal}\n\n请：\n1. 提取关键概念和定义\n2. 建立知识点之间的关联\n3. 标注重点和难点\n4. 生成结构化笔记\n5. 建议后续学习方向\n\n输出为可保存的结构化笔记。`,

  project_thinking: (goal) =>
    `帮我分析这个项目/问题：\n\n${goal}\n\n请从以下角度分析：\n## 目标与当前状态\n## 关键问题识别\n## 优先级排序\n## 执行步骤建议\n## 风险与应对\n## 下一步行动\n\n输出为结构化的项目分析报告。`,

  daily_review: (goal) =>
    `帮我复盘今天的学习：\n\n${goal}\n\n请引导我思考：\n## 今天完成了什么\n## 最大的收获\n## 遇到的困难\n## 明天如何改进\n## 明日优先任务\n\n输出为个人复盘记录。`,
};

// ── Infer type from raw input ──────────────────────────────────

export function inferIntentType(input: string): IntentType {
  const lower = input.toLowerCase();
  if (/安排|计划|今天|今日|日程|规划|安排今天/.test(lower)) return "daily_plan";
  if (/复习|考试|期末|课程|讲义|学习|备考|study|exam/.test(lower)) return "study_outcome";
  if (/整理|资料|笔记|文档|文件|上传|organize|note/.test(lower)) return "material_organize";
  if (/项目|分析|推进|评估|project|分析.*升级|下一步/.test(lower)) return "project_thinking";
  if (/复盘|回顾|总结|反思|review|今天.*总结/.test(lower)) return "daily_review";
  return "study_outcome"; // default: treat as study request
}

// ── Route to create structured intent ──────────────────────────

export function createIntentPayload(input: string, source: IntentPayload["source"] = "custom_input"): IntentPayload {
  const type = inferIntentType(input);
  const generatePrompt = PROMPTS[type];
  const suggestedPrompt = generatePrompt(input);

  return {
    id: `intent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    userGoal: input.slice(0, 200),
    suggestedPrompt,
    recommendedRoute: type === "daily_review" ? "/grow" : type === "daily_plan" ? "/planner" : "/agent",
    createdAt: new Date().toISOString(),
    source,
  };
}

/** Get prompt generator for a specific type */
export function getPromptForType(type: IntentType, goal: string): string {
  return (PROMPTS[type] ?? PROMPTS.study_outcome)(goal);
}
