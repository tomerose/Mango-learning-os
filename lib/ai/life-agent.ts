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
  skill_vector?: Record<string, number>; // skill name → proficiency 0-100
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

  // Type B: Career execution (additional)
  if (state.careerClarity < 60) {
    options.push({
      action: "花15分钟明确本周职业/学习目标",
      type: "career",
      expectedImpact: 55,
      risk: 2, effortCost: 15, timeToResult: "15min", confidence: 0.85,
      autonomyLevel: "assisted",
    });
  }
  if (state.skill_vector && Object.keys(state.skill_vector).length > 0) {
    options.push({
      action: "检查技能差距并安排针对性学习",
      type: "career",
      expectedImpact: 50,
      risk: 5, effortCost: 25, timeToResult: "1hour", confidence: 0.75,
      autonomyLevel: "assisted",
    });
  }

  // Type D: Emotional execution (additional)
  if (state.emotionalStability < 40) {
    options.push({
      action: "触发Mind Garden正念呼吸练习",
      type: "emotional",
      expectedImpact: 85,
      risk: 1, effortCost: 5, timeToResult: "15min", confidence: 0.9,
      autonomyLevel: "autonomous",
    });
    options.push({
      action: "播放5分钟舒缓音乐并调暗界面",
      type: "emotional",
      expectedImpact: 60,
      risk: 1, effortCost: 3, timeToResult: "15min", confidence: 0.85,
      autonomyLevel: "autonomous",
    });
  }
  if (state.decisionFatigue > 60) {
    options.push({
      action: "自动精简今日任务列表（只保留Top 3）",
      type: "emotional",
      expectedImpact: 70,
      risk: 5, effortCost: 8, timeToResult: "15min", confidence: 0.8,
      autonomyLevel: state.executionTrustScore > 50 ? "autonomous" : "assisted",
    });
  }

  // Sort by score descending
  return options.sort((a, b) => scoreDecision(b) - scoreDecision(a));
}

// ═══ Behavioral signals ═══

export interface BehaviorSignal {
  timestamp: string;
  type: "page_view" | "task_complete" | "study_session" | "login" | "voice_use" | "note_create";
  value: number; // 0-1 intensity
}

const SIGNALS_KEY = "mango-behavior-signals";

export function recordSignal(type: BehaviorSignal["type"], value: number): void {
  try {
    const signals = loadSignals();
    signals.push({ timestamp: new Date().toISOString(), type, value });
    // Keep last 100 signals
    if (signals.length > 100) signals.splice(0, signals.length - 100);
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
  } catch {}
}

export function loadSignals(): BehaviorSignal[] {
  try {
    const raw = localStorage.getItem(SIGNALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getTodaySignals(): BehaviorSignal[] {
  const today = new Date().toISOString().slice(0, 10);
  return loadSignals().filter(s => s.timestamp.startsWith(today));
}

// ═══ Plan integration — auto-generate tasks from decisions ═══

export function decisionToTask(decision: DecisionOption): { title: string; priority: "low" | "medium" | "high"; estimatedMin: number; subject: string } {
  const timeMap: Record<string, number> = { "15min": 15, "1hour": 45, "1day": 60, "1week": 120 };
  return {
    title: decision.action,
    priority: decision.expectedImpact > 70 ? "high" : decision.expectedImpact > 40 ? "medium" : "low",
    estimatedMin: timeMap[decision.timeToResult] ?? 25,
    subject: decision.type === "emotional" ? "grow" : decision.type === "academic" ? "ai" : "general",
  };
}

export function autoGenerateTasks(decisions: DecisionOption[], maxTasks: number = 3) {
  return decisions
    .filter(d => d.autonomyLevel !== "manual")
    .slice(0, maxTasks)
    .map(decisionToTask);
}

// ═══ Friend (Mind Garden) integration ═══

export function getEmotionalAction(state: LifeState): { type: "journal" | "breathe" | "reframe" | "companion"; prompt: string } | null {
  if (state.emotionalStability < 30) {
    return { type: "companion", prompt: "我最近感到学习压力很大，想找人聊聊。" };
  }
  if (state.emotionalStability < 50) {
    return { type: "breathe", prompt: "跟着芒宝做3分钟正念呼吸练习" };
  }
  if (state.decisionFatigue > 60) {
    return { type: "reframe", prompt: "我觉得今天什么都没做成，但其实我已经完成了不少。" };
  }
  if (Math.random() < 0.3) { // 30% chance of journal suggestion
    return { type: "journal", prompt: "今天学习中最大的收获是什么？" };
  }
  return null;
}

// ═══ Full autonomous schedule generation ═══

export function generateAutonomousSchedule(
  state: LifeState,
  tasks: Task[],
): { time: string; action: string; duration: string; autoExecute: boolean }[] {
  const undone = tasks.filter(t => !t.done);
  const schedule: { time: string; action: string; duration: string; autoExecute: boolean }[] = [];

  // Morning block
  schedule.push({ time: "08:00", action: "晨间学习冲刺", duration: "25分钟", autoExecute: state.executionTrustScore > 60 });

  // Core study
  if (undone.length > 0) {
    schedule.push({ time: "10:00", action: `完成: ${undone[0].title.slice(0, 30)}`, duration: "45分钟", autoExecute: false });
  }

  // Weak area focus
  schedule.push({ time: "14:00", action: "弱项针对性训练", duration: "30分钟", autoExecute: state.executionTrustScore > 70 });

  // Review
  schedule.push({ time: "16:00", action: "知识复习 + 闪卡", duration: "20分钟", autoExecute: state.executionTrustScore > 80 });

  // Emotional check
  if (state.emotionalStability < 60) {
    schedule.push({ time: "17:00", action: "Mind Garden 情绪整理", duration: "10分钟", autoExecute: true });
  }

  // Reflection
  schedule.push({ time: "20:00", action: "反思日记", duration: "10分钟", autoExecute: false });

  return schedule;
}

// ═══ Execute autonomous actions (returns tasks to auto-create) ═══

export function getAutonomousActions(state: LifeState, tasks: Task[]): { title: string; priority: "low" | "medium" | "high"; estimatedMin: number; subject: string }[] {
  if (state.executionTrustScore < 50) return []; // Not enough trust

  const actions: { title: string; priority: "low" | "medium" | "high"; estimatedMin: number; subject: string }[] = [];

  // Auto-schedule study if procrastination risk is high
  if (state.procrastinationRisk > 60 && tasks.filter(t => !t.done).length === 0) {
    actions.push({ title: "系统自动安排：25分钟学习冲刺", priority: "high", estimatedMin: 25, subject: "ai" });
  }

  // Auto-suggest break if emotional stability is low
  if (state.emotionalStability < 40) {
    actions.push({ title: "系统建议：5分钟正念休息", priority: "medium", estimatedMin: 5, subject: "grow" });
  }

  // Auto-merge fragmented tasks if decision fatigue is high
  if (state.decisionFatigue > 50) {
    actions.push({ title: "系统优化：今日任务已精简为Top 3", priority: "high", estimatedMin: 10, subject: "general" });
  }

  return actions;
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
