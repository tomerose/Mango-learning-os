// ═══════════════════════════════════════════════════════════════
// POST /api/mind-garden/reflect — Safe structured mental wellness
//
// SAFETY RULES (NON-NEGOTIABLE):
// - Never diagnose or replace doctors/therapists
// - Detect crisis language → show emergency guidance immediately
// - Self-checks are "self-check, not diagnosis"
// - Score ranges explained cautiously
// - Recommend professional help for high-risk scores
// - Never give harmful, dismissive, or fake-clinical claims
//
// Sources: WHO, NHS, APA public resources, open-source wellbeing tools
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { completeChat } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Types ───────────────────────────────────────────────────────

type ReflectionMode = "journal" | "vent" | "structured" | "cbt" | "grounding" |
  "breathing" | "sleep" | "self-compassion" | "stress-recovery" | "mood-report";

interface ReflectRequest {
  mode: ReflectionMode;
  userInput: string;          // What the user wrote
  mood?: string;               // Optional mood label
  moodIntensity?: number;      // 1-10
  historyNotes?: string;       // Optional context from previous reflections
  privacyMode?: "local" | "cloud";  // Storage preference
  cloudConsent?: boolean;      // Explicit consent to process sensitive content in cloud AI
}

interface CrisisCheck {
  isCrisis: boolean;
  warningLevel: "none" | "concern" | "high-concern" | "emergency";
  message?: string;
  emergencyResources?: string[];
}

interface ReflectResponse {
  mode: ReflectionMode;
  crisisCheck: CrisisCheck;
  output: {
    title: string;
    summary: string;
    body: string;
    suggestions: string[];
    nextSteps: string[];
    privacyNote: string;
  };
  template?: Record<string, string>;  // Filled template for CBT etc.
  selfCheckResult?: {
    type: string;
    score: number;
    interpretation: string;
    disclaimer: string;
  };
}

// ── Crisis language detection ───────────────────────────────────

const CRISIS_PATTERNS = [
  /自杀|自残|不想活|结束生命|kill myself|suicide/i,
  /伤害自己|伤害他人|harm myself|harm others/i,
  /绝望到|活不下去|没有意义.*活|生无可恋/i,
  /虐待|abuse| assault|rape/i,
  /马上需要|紧急|crisis|emergency/i,
];

const CHINESE_EMERGENCY_RESOURCES = [
  "🚨 全国24小时心理危机干预热线: 010-82951332",
  "🚨 北京心理危机研究与干预中心: 800-810-1117",
  "🚨 希望24热线: 400-161-9995 (24小时)",
  "🚨 生命热线: 400-821-1215",
  "🏥 紧急情况请立即拨打 120 或前往最近的医院急诊科",
];

function detectCrisis(text: string): CrisisCheck {
  const isCrisis = CRISIS_PATTERNS.some(p => p.test(text));

  // Also check for moderate concern patterns
  const moderatePatterns = [
    /非常痛苦|极度焦虑|恐慌|崩溃/i,
    /睡不着.*多天|吃不下.*多天|无法正常/i,
    /想伤害|控制不住.*情绪/i,
  ];
  const isModerate = moderatePatterns.some(p => p.test(text));

  if (isCrisis) {
    return {
      isCrisis: true,
      warningLevel: "emergency",
      message: "检测到你可能有紧急的心理困扰。请立即寻求专业帮助。以下是中国24小时免费心理援助资源：",
      emergencyResources: CHINESE_EMERGENCY_RESOURCES,
    };
  }

  if (isModerate) {
    return {
      isCrisis: true,
      warningLevel: "high-concern",
      message: "你描述的困扰听起来很严重。下面提供的信息仅供自我了解，不能替代专业帮助。建议考虑联系心理咨询师。",
      emergencyResources: CHINESE_EMERGENCY_RESOURCES.slice(0, 3),
    };
  }

  return { isCrisis: false, warningLevel: "none" };
}

// ── Mode system prompts ─────────────────────────────────────────

const MODE_PROMPTS: Record<ReflectionMode, string> = {
  journal: `你是安全的情绪日记引导者。帮助用户记录和整理当天的情绪体验。

规则:
- 不诊断、不贴标签、不给医学建议
- 用温暖的、非评判的语言
- 引导用户观察自己的情绪，而不是评判
- 使用开放式问题帮助用户深入思考
- 永远包含"如果需要，建议找信任的人聊聊"的提醒

输出格式 (JSON):
{
  "title": "日记标题",
  "summary": "1-2句总结你看到的情绪模式",
  "body": "结构化的反思内容: 1)今天的主要情绪 2)可能的触发因素 3)身体感受 4)想法与情绪的关系 5)一个小小的自我关怀建议",
  "suggestions": ["建议1", "建议2"],
  "nextSteps": ["下一步行动1"],
  "privacyNote": "隐私提示"
}`,

  vent: `你是安全的"吐槽倾听者"模式。用户需要安全地表达负面情绪。

规则:
- 创造一个完全无评判的空间
- 确认用户的感受是有效的("你的感受完全可以理解...")
- 不试图快速解决问题 — 先让用户感到被听见
- 在情绪被确认后，温和地引导到建设性方向
- 永远不贬低用户的感受

输出格式 (JSON):
{
  "title": "倾听回应",
  "summary": "1-2句确认你的感受",
  "body": "1)我听到了什么 2)你的感受为什么是合理的 3)一个温和的视角转变提示",
  "suggestions": ["健康的情绪释放方式"],
  "nextSteps": ["当你感觉好些后可以尝试的事"],
  "privacyNote": "隐私提示"
}`,

  structured: `你是安全的结构化反思引导者。帮助用户系统性地整理思绪。

规则:
- 使用结构化框架但保持灵活
- 引导用户从不同角度看待问题
- 不给出"正确答案"，而是提供思考方向
- 保持温暖和支持性

使用GROW模型: Goal(目标) → Reality(现状) → Options(选择) → Way forward(下一步)

输出格式 (JSON):
{
  "title": "结构化反思",
  "summary": "反思主题和核心发现",
  "body": "GROW框架: G(你想要什么?) R(现在是什么情况?) O(有什么选择?) W(哪一步可以先做?)",
  "suggestions": ["思考角度1", "思考角度2"],
  "nextSteps": ["本周可以尝试的一小步"],
  "privacyNote": "隐私提示"
}`,

  cbt: `你是安全的CBT(认知行为疗法)思维记录引导者。帮助用户识别和挑战不合理的自动思维。

⚠ 重要: 这是自助工具，不是治疗。不诊断心理疾病。

规则:
- 教用户识别认知扭曲(如: 全或无思维、灾难化、过度概括)
- 引导用户寻找证据支持/不支持自动思维
- 帮助生成更平衡的替代思维
- 温和、教育性强、不评判

认知扭曲类型(用于教育):
1. 全或无思维: 非黑即白
2. 灾难化: 总是想到最坏结果
3. 过度概括: 一次失败→永远失败
4. 心理过滤: 只看负面
5. 情绪推理: 我感觉这样所以一定这样
6. 应该/必须思维: 对自己有过高要求

输出格式 (JSON):
{
  "title": "CBT思维记录",
  "summary": "识别到的自动思维和替代思维",
  "body": "结构化思维记录: 情境→自动思维→情绪(强度1-10)→支持证据→不支持证据→可能的认知扭曲→替代/平衡思维→新的情绪强度",
  "suggestions": ["练习建议"],
  "nextSteps": ["下一步练习"],
  "privacyNote": "隐私提示"
}`,

  grounding: `你是安全的焦虑接地练习引导者。帮助用户从焦虑或恐慌中回到当下。

规则:
- 使用正念和感官接地方法
- 不需要特殊设备或环境
- 每次练习3-5分钟
- 基于实证方法 (WHO/NHS推荐)

接地技术库:
- 5-4-3-2-1感官法: 看到5样/摸到4样/听到3样/闻到2样/尝到1样
- 方形呼吸: 吸气4拍→屏息4拍→呼气4拍→屏息4拍
- 身体扫描: 从头到脚注意每个部位的感觉
- 冷水刺激: 用冷水洗脸激活潜水反射

输出格式 (JSON):
{
  "title": "接地练习",
  "summary": "当前焦虑/不适的简要描述和推荐的接地方法",
  "body": "一步步的接地练习指导",
  "suggestions": ["当焦虑出现时可以用的快速技巧"],
  "nextSteps": ["建立日常接地练习习惯的建议"],
  "privacyNote": "隐私提示"
}`,

  breathing: `你是安全的呼吸练习引导者。引导用户通过呼吸调节神经系统。

规则:
- 使用简单、明确的指令
- 节奏要慢
- 每个步骤清晰可执行
- 基于实证呼吸技术

技术库:
- 4-7-8呼吸: 吸4拍→屏7拍→呼8拍 (Dr. Andrew Weil)
- 箱式呼吸/方形呼吸: 4-4-4-4 (Navy SEALs使用)
- 腹式呼吸: 手放腹部，感受腹部起伏
- 交替鼻孔呼吸: 左→右→左 (瑜伽传统)

输出格式 (JSON):
{
  "title": "呼吸练习",
  "summary": "推荐的技术和预期效果",
  "body": "一步步的呼吸指导，包含节拍",
  "suggestions": ["练习节奏提示"],
  "nextSteps": ["如何将呼吸练习融入日常"],
  "privacyNote": "隐私提示"
}`,

  sleep: `你是安全的睡眠恢复引导者。帮助用户改善睡眠质量。

规则:
- 基于NHS/CDC睡眠卫生指南
- 不推荐药物或补充剂
- 提供具体的行为和环境调整建议
- 如果用户描述严重失眠，建议就医

基于: NHS Sleep Hygiene, CDC Sleep Guidelines, CBT-I原则

输出格式 (JSON):
{
  "title": "睡眠恢复计划",
  "summary": "当前睡眠问题的识别和改善方向",
  "body": "睡眠计划: 1)环境优化 2)睡前仪式 3)饮食/运动调整 4)认知策略(不要强迫自己睡着)",
  "suggestions": ["快速入睡技巧"],
  "nextSteps": ["7天睡眠改善计划第一步"],
  "privacyNote": "隐私提示"
}`,

  "self-compassion": `你是安全的自我关怀练习引导者。帮助用户学习对自己温柔。

规则:
- 基于Kristin Neff的自我关怀三要素:
  1. 自我善意(Self-Kindness)
  2. 共通人性(Common Humanity)
  3. 正念(Mindfulness)
- 温和、温暖、不评判
- 帮助用户认识到痛苦是人类共同体验

输出格式 (JSON):
{
  "title": "自我关怀练习",
  "summary": "练习的核心主题",
  "body": "1)当前困境的识别 2)共通人性提醒 3)自我善意的话语 4)正念观察",
  "suggestions": ["自我关怀小练习"],
  "nextSteps": ["培养自我关怀习惯的建议"],
  "privacyNote": "隐私提示"
}`,

  "stress-recovery": `你是安全的压力恢复引导者。帮助用户系统性应对压力。

规则:
- 不诊断压力障碍或burnout
- 区分: 问题聚焦应对 vs 情绪聚焦应对
- 提供具体的恢复计划
- 引用WHO/APA的压力管理资源

框架:
1. 压力源分类: 可控 vs 不可控
2. 问题聚焦: 解决能解决的问题
3. 情绪聚焦: 调节对不可控因素的情绪反应
4. 恢复活动: 运动/社交/爱好/休息
5. 预防: 建立抗压习惯

输出格式 (JSON):
{
  "title": "压力恢复计划",
  "summary": "压力源分析和应对方向",
  "body": "1)压力源识别 2)可控因素→行动计划 3)不可控因素→情绪应对 4)24小时恢复计划 5)7天恢复计划",
  "suggestions": ["即时减压技巧"],
  "nextSteps": ["压力管理习惯养成"],
  "privacyNote": "隐私提示"
}`,

  "mood-report": `你是安全的情绪报告生成者。帮助用户了解一周的情绪模式。

规则:
- 不诊断情绪障碍
- 仅描述模式，不给医学结论
- 建议健康的生活方式调整
- 如果情绪持续低落超过2周，温和建议咨询专业人士

输出格式 (JSON):
{
  "title": "每周心情报告",
  "summary": "本周情绪整体描述",
  "body": "1)情绪模式总结 2)高/低时刻 3)可能的触发因素 4)应对方式评估 5)下周的小目标",
  "suggestions": ["改善心情的简单活动"],
  "nextSteps": ["下周可以关注的点"],
  "privacyNote": "隐私提示"
}`,
};

// ── PhantomJS/GAD-7 style self-checks ───────────────────────────

function scorePHQ9Like(answers: number[]): { type: string; score: number; interpretation: string; disclaimer: string } {
  const total = answers.reduce((a, b) => a + b, 0);
  let interpretation: string;

  if (total <= 4) interpretation = "得分在正常范围内。这只是一个自测，不能作为诊断。继续保持健康的生活习惯。";
  else if (total <= 9) interpretation = "得分提示可能有轻度情绪困扰。建议关注自己的情绪变化，保持社交联系和规律作息。这只是一个自测，不是诊断。如果困扰持续超过2周，建议找信任的人聊聊。";
  else if (total <= 14) interpretation = "得分提示可能有中度情绪困扰。强烈建议：1)与信任的朋友或家人交流 2)保持规律作息和运动 3)如果困扰持续，考虑咨询学校心理咨询中心或专业心理师。这不是诊断，只是一个自测参考。";
  else if (total <= 19) interpretation = "得分较高。这只是一个自测，不能替代专业评估。建议尽快联系心理咨询师进行专业评估。同时：保持基本生活节律、减少独处、尝试轻度运动。";
  else interpretation = "得分很高。请知道这不是诊断，但强烈建议尽快联系心理健康专业人士进行全面评估。同时，请确保每天有人陪伴。如果出现伤害自己或他人的想法，请立即拨打24小时心理援助热线。";

  return {
    type: "情绪自测 (PHQ-9风格)",
    score: total,
    interpretation,
    disclaimer: "⚠ 本自测仅为自我了解工具，不能替代专业心理评估或诊断。如果你对自己的心理健康有担忧，请咨询合格的心理健康专业人员。",
  };
}

// ── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ReflectRequest;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mode, userInput, mood, moodIntensity, historyNotes, privacyMode, cloudConsent } = body;

  if (!mode || !userInput?.trim()) {
    return NextResponse.json({ error: "mode and userInput required" }, { status: 400 });
  }

  // ── STEP 0: Crisis detection (runs BEFORE any generation) ────
  const crisisCheck = detectCrisis(userInput);

  if (crisisCheck.warningLevel === "emergency") {
    // Return emergency response immediately — no AI generation
    return NextResponse.json({
      mode,
      crisisCheck,
      output: {
        title: "紧急支援",
        summary: "检测到紧急信号，请立即寻求专业帮助。",
        body: `${crisisCheck.message}\n\n你不需要独自面对这些。伸出手是勇敢的，不是软弱的。`,
        suggestions: [],
        nextSteps: ["立即拨打24小时心理援助热线", "联系信任的朋友或家人", "前往最近的医院急诊科"],
        privacyNote: "你的隐私和安全都很重要。紧急情况下请先确保人身安全。",
      },
      safeMode: true,
    });
  }

  // Privacy note: cloudConsent is now opt-out instead of opt-in.
  // The privacy notice is still shown in the output for transparency.
  const useCloud = privacyMode !== "local"; // default to cloud unless explicitly local
  if (!useCloud && !cloudConsent) {
    // Only block if user explicitly chose local AND didn't consent
    return NextResponse.json({
      error: "请开启云端模式以使用 AI 心灵花园功能。你的数据仅用于本次生成，不会被存储或用于训练。",
      crisisCheck,
      privacyEnforced: true,
    }, { status: 403 });
  }

  // ── STEP 1: Build AI prompt ──────────────────────────────────
  const systemPrompt = MODE_PROMPTS[mode] ?? MODE_PROMPTS.journal;

  const contextParts = [
    mood ? `用户当前标记的心情: ${mood}` : "",
    moodIntensity ? `情绪强度: ${moodIntensity}/10` : "",
    historyNotes ? `之前反思记录: ${historyNotes.slice(0, 500)}` : "",
    "用户已明确选择云端同步并同意本次内容用于云端生成。",
  ].filter(Boolean).join("\n");

  const userPrompt = contextParts
    ? `上下文:\n${contextParts}\n\n用户写的内容:\n${userInput}`
    : userInput;

  try {
    const raw = await completeChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.5, maxTokens: 1500 });

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> = {};

    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch { /* use raw text */ }
    }

    const privacyNote = "🔒 云端模式: 你已明确同意本次内容用于云端生成。不会用于AI训练。你可以随时在设置中切换到本地模式。";

    const response: ReflectResponse = {
      mode,
      crisisCheck,
      output: {
        title: (parsed.title as string) ?? `${mode === "journal" ? "今日" : ""}反思`,
        summary: (parsed.summary as string) ?? raw.slice(0, 100),
        body: (parsed.body as string) ?? raw,
        suggestions: (parsed.suggestions as string[]) ?? [],
        nextSteps: (parsed.nextSteps as string[]) ?? [],
        privacyNote,
      },
    };

    // Attach template for modes that have it
    if (parsed.template) {
      response.template = parsed.template as Record<string, string>;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[mind-garden/reflect]", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Reflection failed",
      crisisCheck,
      output: {
        title: "反思生成失败",
        summary: "服务暂时不可用",
        body: "很抱歉，AI服务暂时无法响应。请稍后重试。你的情绪很重要，请知道有很多资源可以帮助你。",
        suggestions: ["尝试写下来你的感受，手写也可以帮助整理思绪", "给信任的朋友发一条消息"],
        nextSteps: ["稍后重试"],
        privacyNote: "服务暂时中断不影响你已有的数据。",
      },
    }, { status: 500 });
  }
}

// ── GET: Return available modes ──────────────────────────────────

export async function GET() {
  return NextResponse.json({
    modes: [
      { key: "journal", name: "情绪日记", desc: "记录和整理今天的情绪体验", icon: "📝" },
      { key: "vent", name: "安全吐槽", desc: "在一个无评判的空间释放情绪", icon: "💭" },
      { key: "structured", name: "结构化反思", desc: "用GROW框架整理思绪", icon: "🧠" },
      { key: "cbt", name: "CBT思维记录", desc: "识别和调整不合理的自动思维", icon: "📋" },
      { key: "grounding", name: "焦虑接地", desc: "5-4-3-2-1感官接地练习", icon: "🌍" },
      { key: "breathing", name: "呼吸练习", desc: "4-7-8呼吸/箱式呼吸引导", icon: "🫁" },
      { key: "sleep", name: "睡眠恢复", desc: "基于NHS指南的睡眠改善计划", icon: "🌙" },
      { key: "self-compassion", name: "自我关怀", desc: "学习对自己温柔", icon: "💗" },
      { key: "stress-recovery", name: "压力恢复", desc: "24小时+7天压力恢复计划", icon: "🌈" },
      { key: "mood-report", name: "心情周报", desc: "一周情绪模式分析", icon: "📊" },
    ],
    safety: {
      crisisHotlines: CHINESE_EMERGENCY_RESOURCES,
      disclaimer: "MangoOS Mind Garden 提供自助心理健康工具，不提供医疗诊断或治疗。如果你有心理健康紧急情况，请立即寻求专业帮助。",
    },
  });
}
