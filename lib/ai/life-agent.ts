// ═══════════════════════════════════════════════════════════════
// V9 Life Agent Engine — Autonomous Decision & Execution System
// Observe → Predict → Decide → Execute → Learn
// ═══════════════════════════════════════════════════════════════

import { completeChat, extractJson } from "@/lib/ai/client";
import type { Task, WeakArea } from "@/lib/types";

// ═══ Types ═══

export interface LifeState {
  academicPressure: number;    // 0-100
  careerClarity: number;       // 0-100
  emotionalStability: number;  // 0-100
  productivityRate: number;    // 0-100
  procrastinationRisk: number; // 0-100
  decisionFatigue: number;     // 0-100
  executionTrustScore: number; // 0-100
  lastUpdated: string;
}

export interface DecisionOption {
  action: string;
  type: "academic" | "career" | "behavioral" | "emotional";
  expectedImpact: number;  // 0-100
  risk: number;            // 0-100
  effortCost: number;      // 0-100
  timeToResult: string;    // "15min" | "1hour" | "1day" | "1week"
  confidence: number;      // 0-1
  autonomyLevel: "manual" | "assisted" | "autonomous";
}

export interface DailyCommand {
  criticalAction: DecisionOption;
  riskToAvoid: string;
  optimalSchedule: { time: string; action: string; duration: string }[];
  forcedTask: { title: string; priority: "high" | "medium"; estimatedMin: number };
  insight: string;
  timestamp: string;
}

// ═══ Default Life State ═══

const DEFAULT_STATE: LifeState = {
  academicPressure: 40,
  careerClarity: 50,
  emotionalStability: 70,
  productivityRate: 60,
  procrastinationRisk: 30,
  decisionFatigue: 20,
  executionTrustScore: 50,
  lastUpdated: new Date().toISOString(),
};

// ═══ State persistence ═══

const STATE_KEY = "mango-life-state";

export function loadLifeState(): LifeState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

export function saveLifeState(state: LifeState): void {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
}

// ═══ State estimation from store data ═══

export function estimateLifeState(
  tasks: Task[],
  weakAreas: WeakArea[],
  streakDays: number,
  totalXp: number,
): Partial<LifeState> {
  const overdue = tasks.filter(t => !t.done).length;
  const weakCount = weakAreas.filter(w => w.accuracy < 50).length;

  return {
    academicPressure: Math.min(100, overdue * 10 + weakCount * 8),
    productivityRate: Math.min(100, 40 + (tasks.filter(t => t.done).length / Math.max(1, tasks.length)) * 60),
    procrastinationRisk: Math.min(100, overdue * 5 + (streakDays < 3 ? 30 : 0)),
    emotionalStability: Math.min(100, 50 + streakDays * 3),
    decisionFatigue: Math.min(100, overdue * 4),
    lastUpdated: new Date().toISOString(),
  };
}

// ═══ Decision Engine ═══

function scoreDecision(option: DecisionOption): number {
  // Maximize: impact × confidence, minimize: risk × effort
  const benefit = option.expectedImpact * option.confidence;
  const cost = (option.risk * 0.5 + option.effortCost * 0.3) / 100;
  return benefit / Math.max(1, cost);
}

export function generateDecisions(state: LifeState): DecisionOption[] {
  const options: DecisionOption[] = [
    // Academic
    {
      action: "25分钟高优先级学习冲刺",
      type: "academic",
      expectedImpact: 75,
      risk: 5,
      effortCost: 30,
      timeToResult: "15min",
      confidence: 0.9,
      autonomyLevel: state.executionTrustScore > 60 ? "autonomous" : "assisted",
    },
    {
      action: "复习薄弱知识点（从弱项分析中选择）",
      type: "academic",
      expectedImpact: 65,
      risk: 3,
      effortCost: 40,
      timeToResult: "1hour",
      confidence: 0.85,
      autonomyLevel: "assisted",
    },
    // Career
    {
      action: "整理学习成果为可展示的项目",
      type: "career",
      expectedImpact: 60,
      risk: 10,
      effortCost: 60,
      timeToResult: "1day",
      confidence: 0.7,
      autonomyLevel: "manual",
    },
    // Behavioral
    {
      action: "开启专注模式，阻止社交媒体干扰",
      type: "behavioral",
      expectedImpact: state.procrastinationRisk > 50 ? 80 : 40,
      risk: 2,
      effortCost: 5,
      timeToResult: "15min",
      confidence: 0.95,
      autonomyLevel: state.executionTrustScore > 70 ? "autonomous" : "assisted",
    },
    {
      action: "调整今日计划，合并碎片任务",
      type: "behavioral",
      expectedImpact: 50,
      risk: 3,
      effortCost: 10,
      timeToResult: "15min",
      confidence: 0.85,
      autonomyLevel: "autonomous",
    },
    // Emotional
    {
      action: "3分钟呼吸练习或正念休息",
      type: "emotional",
      expectedImpact: state.emotionalStability < 50 ? 70 : 30,
      risk: 1,
      effortCost: 5,
      timeToResult: "15min",
      confidence: 0.9,
      autonomyLevel: "assisted",
    },
    {
      action: "记录今天的学习感受（Mind Garden）",
      type: "emotional",
      expectedImpact: 40,
      risk: 1,
      effortCost: 10,
      timeToResult: "15min",
      confidence: 0.8,
      autonomyLevel: "manual",
    },
  ];

  // Sort by score descending
  return options.sort((a, b) => scoreDecision(b) - scoreDecision(a));
}

// ═══ Select optimal action ═══

export function selectOptimalAction(options: DecisionOption[]): DecisionOption {
  return options[0];
}

// ═══ Generate Daily Command ═══

export function generateDailyCommand(
  state: LifeState,
  tasks: Task[],
  weakAreas: WeakArea[],
): DailyCommand {
  const decisions = generateDecisions(state);
  const optimal = selectOptimalAction(decisions);

  const undone = tasks.filter(t => !t.done);
  const topTask = undone[0];

  return {
    criticalAction: optimal,
    riskToAvoid: state.procrastinationRisk > 50
      ? "拖延风险较高——系统已预安排强制学习时段"
      : state.decisionFatigue > 50
        ? "决策疲劳——今天只做3件最重要的事"
        : "状态正常——按计划执行即可",
    optimalSchedule: [
      { time: "08:00", action: "晨间学习冲刺", duration: "25分钟" },
      { time: "10:00", action: "核心科目深度学习", duration: "45分钟" },
      { time: "14:00", action: "弱项针对性训练", duration: "30分钟" },
      { time: "16:00", action: "知识复习 + 闪卡", duration: "20分钟" },
      { time: "20:00", action: "反思日记", duration: "10分钟" },
    ],
    forcedTask: topTask
      ? { title: topTask.title, priority: (topTask.priority === "low" ? "medium" : topTask.priority) as "high" | "medium", estimatedMin: 25 }
      : { title: "选择一个科目开始学习", priority: "medium" as const, estimatedMin: 25 },
    insight: state.procrastinationRisk > 50
      ? `你明天上午有${state.procrastinationRisk}%概率浪费时间。系统已预安排9:00的25分钟学习冲刺。`
      : `今日最佳行动：${optimal.action}（预期收益 ${optimal.expectedImpact}/100）`,
    timestamp: new Date().toISOString(),
  };
}

// ═══ Update trust score ═══

export function updateTrustScore(state: LifeState, userFollowedRecommendation: boolean, outcomePositive: boolean): LifeState {
  let delta = 0;
  if (userFollowedRecommendation) delta += 2;
  if (outcomePositive) delta += 3;
  if (!userFollowedRecommendation) delta -= 1;

  return {
    ...state,
    executionTrustScore: Math.max(0, Math.min(100, state.executionTrustScore + delta)),
    lastUpdated: new Date().toISOString(),
  };
}

// ═══ Autonomy check ═══

export function getAutonomyLevel(state: LifeState): "manual" | "assisted" | "autonomous" {
  if (state.executionTrustScore < 40) return "manual";
  if (state.executionTrustScore < 70) return "assisted";
  return "autonomous";
}

export function canAutoExecute(action: DecisionOption, state: LifeState): boolean {
  if (action.risk > 20) return false;            // Never auto-execute high-risk
  if (action.autonomyLevel === "manual") return false;
  if (action.autonomyLevel === "autonomous") return true;
  return state.executionTrustScore >= 60;         // Assisted mode needs trust >= 60
}
