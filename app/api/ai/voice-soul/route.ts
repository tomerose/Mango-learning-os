import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// Voice Soul Distillation API
// Mango DNA 旗舰功能 — 从聊天/语音/文本中重建数字人格
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 120;

type AnalysisMode = "full" | "personality" | "voice" | "thinking";

interface DistillationResult {
  // 人格卡
  personalityCard: {
    name: string;           // 推断的称呼
    traits: string[];       // 性格标签 ["温暖","理性","幽默"]
    mbtiGuess: string;      // 推断 MBTI
    energyLevel: "high" | "medium" | "low";
    emotionalPattern: string;
  };
  // 思维模型
  thinkingModel: {
    logicStyle: string;     // 逻辑风格
    decisionPattern: string;
    values: string[];       // 价值观关键词
    catchphrases: string[]; // 口头禅
    topicPreferences: string[];
  };
  // 沟通风格
  communicationStyle: {
    formality: "casual" | "balanced" | "formal";
    responseLength: "short" | "medium" | "long";
    humorStyle: string;
    emojiUsage: "rarely" | "sometimes" | "frequently";
    warmth: number;         // 0-100
  };
  // 语音特征（从文字中间接推断）
  voiceProfile: {
    estimatedPace: "慢" | "适中" | "快";
    estimatedEnergy: "低沉" | "平稳" | "活跃";
    pauseStyle: "少停顿" | "正常" | "爱停顿";
    fillerWords: string[];
  };
  // 交互快照
  interactionSnapshot: {
    greeting: string;       // 这个人的典型打招呼方式
    farewell: string;
    encouragement: string;
    conflictResponse: string;
  };
}

const SYSTEM_PROMPT = `你是人格蒸馏专家。从对话材料中提取人格档案。输出严格的 JSON——KEY 必须用英文，VALUE 用中文：

{
  "personalityCard": {"name":"称呼","traits":["标签1"],"mbtiGuess":"MBTI","energyLevel":"high/medium/low","emotionalPattern":"情感模式"},
  "thinkingModel": {"logicStyle":"逻辑风格","decisionPattern":"决策模式","values":["价值观"],"catchphrases":["口头禅"],"topicPreferences":["话题"]},
  "communicationStyle": {"formality":"casual/balanced/formal","responseLength":"short/medium/long","humorStyle":"幽默风格","emojiUsage":"rarely/sometimes/frequently","warmth":50},
  "voiceProfile": {"estimatedPace":"语速","estimatedEnergy":"能量","pauseStyle":"停顿","fillerWords":["语气词"]},
  "interactionSnapshot": {"greeting":"问候","farewell":"告别","encouragement":"鼓励","conflictResponse":"冲突回应"}
}

不要 Markdown 代码块，只输出纯 JSON。`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.slice(0, 15000) : "";
    const mode: AnalysisMode = body?.mode ?? "full";

    if (!text || text.length < 30) {
      return NextResponse.json({ error: "请上传至少 30 字的对话或文字材料" }, { status: 400 });
    }

    let prompt = "";
    switch (mode) {
      case "personality":
        prompt = `请只提取这个人的性格卡和沟通风格：\n\n${text}\n\n输出 JSON：{"personalityCard":{...},"communicationStyle":{...}}`;
        break;
      case "thinking":
        prompt = `请只提取这个人的思维模型：\n\n${text}\n\n输出 JSON：{"thinkingModel":{...}}`;
        break;
      case "voice":
        prompt = `请从文字中推断这个人的语音特征：\n\n${text}\n\n输出 JSON：{"voiceProfile":{...}}`;
        break;
      default:
        prompt = `请完整分析这个人的全部人格维度：\n\n${text}\n\n输出完整的 DistillationResult JSON。`;
    }

    const raw = await completeChat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], { temperature: 0.5 });

    const json = extractJson(raw);
    let parsed: Partial<DistillationResult>;

    try {
      parsed = JSON.parse(json);
      // Map Chinese AI keys to English if needed
      parsed = mapChineseKeys(parsed as Record<string, unknown>) as Partial<DistillationResult>;
    } catch {
      return NextResponse.json({
        mode,
        partial: true,
        rawAnalysis: raw.slice(0, 5000),
        result: buildDefaultResult(),
      });
    }

    // Merge with defaults to ensure all fields exist
    const result = { ...buildDefaultResult(), ...parsed };

    return NextResponse.json({ mode, partial: false, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "蒸馏分析失败" },
      { status: 500 }
    );
  }
}

// Map Chinese AI response keys to English
function mapChineseKeys(obj: Record<string, unknown>): Partial<DistillationResult> {
  const keyMap: Record<string, string> = {
    "性格卡": "personalityCard", "思维模型": "thinkingModel",
    "沟通风格": "communicationStyle", "语音特征": "voiceProfile",
    "交互快照": "interactionSnapshot",
    "性格标签": "traits", "MBTI推测": "mbtiGuess",
    "能量水平": "energyLevel", "情感模式": "emotionalPattern",
    "逻辑风格": "logicStyle", "决策模式": "decisionPattern",
    "核心价值观": "values", "口头禅": "catchphrases",
    "话题偏好": "topicPreferences", "正式程度": "formality",
    "回复长度": "responseLength", "幽默风格": "humorStyle",
    "表情使用频率": "emojiUsage", "温暖度": "warmth",
    "推测语速": "estimatedPace", "能量感": "estimatedEnergy",
    "停顿习惯": "pauseStyle", "语气词": "fillerWords",
    "典型问候": "greeting", "典型告别": "farewell",
    "典型鼓励": "encouragement", "典型冲突回应": "conflictResponse",
  };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const mappedKey = keyMap[k] || k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      result[mappedKey] = mapChineseKeys(v as Record<string, unknown>);
    } else {
      result[mappedKey] = v;
    }
  }
  return result as Partial<DistillationResult>;
}

function buildDefaultResult(): DistillationResult {
  return {
    personalityCard: {
      name: "未命名",
      traits: [],
      mbtiGuess: "未知",
      energyLevel: "medium",
      emotionalPattern: "待分析",
    },
    thinkingModel: {
      logicStyle: "待分析",
      decisionPattern: "待分析",
      values: [],
      catchphrases: [],
      topicPreferences: [],
    },
    communicationStyle: {
      formality: "balanced",
      responseLength: "medium",
      humorStyle: "待分析",
      emojiUsage: "sometimes",
      warmth: 50,
    },
    voiceProfile: {
      estimatedPace: "适中",
      estimatedEnergy: "平稳",
      pauseStyle: "正常",
      fillerWords: [],
    },
    interactionSnapshot: {
      greeting: "你好",
      farewell: "再见",
      encouragement: "加油",
      conflictResponse: "我们需要好好谈谈",
    },
  };
}
