"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, AlertTriangle, Clock, Target, Shield, Brain, ArrowRight, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { estimateLifeState, generateDailyCommand, loadLifeState, getAutonomyLevel, getEmotionalAction, getAutonomousActions, recordSignal, type DailyCommand, type LifeState } from "@/lib/ai/life-agent";

/* ═══════════════════════════════════════════════════════════════
   Life Command Center — V9 Autonomous Life Agent UI
   Shows: Critical Action, Risk Alert, Optimal Schedule, Forced Task
   ═══════════════════════════════════════════════════════════════ */

export function LifeCommandCenter() {
  const { tasks, weakAreas, stats } = useStore();
  const [command, setCommand] = React.useState<DailyCommand | null>(null);
  const [state, setState] = React.useState<LifeState>(loadLifeState);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    // Estimate state from store data
    const estimated = estimateLifeState(tasks, weakAreas, stats?.streakDays ?? 0, stats?.totalXp ?? 0);
    const current = { ...loadLifeState(), ...estimated };
    setState(current);
    // Generate daily command
    const cmd = generateDailyCommand(current, tasks, weakAreas);
    setCommand(cmd);
    // Record behavioral signal
    recordSignal("page_view", 0.5);
  }, [tasks, weakAreas, stats]);

  // Emotional action integration
  const emotionalAction = React.useMemo(() => getEmotionalAction(state), [state]);
  // Autonomous actions
  const autoActions = React.useMemo(() => getAutonomousActions(state, tasks), [state, tasks]);

  if (!command) return null;

  const autonomyLevel = getAutonomyLevel(state);
  const autonomyLabel = autonomyLevel === "autonomous" ? "自主模式" : autonomyLevel === "assisted" ? "辅助模式" : "手动模式";
  const autonomyColor = autonomyLevel === "autonomous" ? "text-emerald-500" : autonomyLevel === "assisted" ? "text-amber-500" : "text-fg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="card-card p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <p className="text-small font-medium">Life Command Center</p>
          <span className={cn("text-caption", autonomyColor)}>· {autonomyLabel}</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-caption hover:underline">
          {expanded ? "收起" : "详情"}
        </button>
      </div>

      {/* Critical Action */}
      <div className="flex items-start gap-3 rounded-xl bg-primary-subtle p-4">
        <Target className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-label mb-1">今日关键行动</p>
          <p className="text-small font-medium">{command.criticalAction.action}</p>
          <p className="text-caption mt-1">
            预期收益 {command.criticalAction.expectedImpact}/100 · 风险 {command.criticalAction.risk}/100
            {command.criticalAction.autonomyLevel === "autonomous" && " · 可自动执行"}
          </p>
        </div>
        <Link href={command.criticalAction.type === "emotional" ? "/grow" : command.criticalAction.type === "academic" ? "/agent" : "/planner"}
          className="shrink-0 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
          执行 <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Risk Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/20 p-3">
        <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">风险预警</p>
          <p className="text-caption mt-0.5">{command.riskToAvoid}</p>
        </div>
      </div>

      {/* Forced Task */}
      <div className="flex items-center gap-3 rounded-xl bg-bg-muted p-3">
        <Shield className="size-4 text-fg-muted shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium">强制执行任务</p>
          <p className="text-small mt-0.5">{command.forcedTask.title}</p>
          <p className="text-caption">{command.forcedTask.estimatedMin} 分钟 · {command.forcedTask.priority === "high" ? "高优先级" : "中优先级"}</p>
        </div>
        <Link href="/planner" className="shrink-0 text-xs text-primary hover:underline">去执行</Link>
      </div>

      {/* Insight */}
      <p className="text-caption italic text-fg-muted">💡 {command.insight}</p>

      {/* Expanded: Optimal Schedule */}
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <p className="text-label">最优日程</p>
          {command.optimalSchedule.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="font-mono text-fg-muted w-12">{s.time}</span>
              <span className="flex-1">{s.action}</span>
              <span className="text-fg-subtle">{s.duration}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Emotional action (Mind Garden integration) */}
      {emotionalAction && (
        <Link href="/grow"
          className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/20 p-3 hover:bg-rose-100/50 transition-colors">
          <Heart className="size-4 text-rose-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">情绪关怀</p>
            <p className="text-caption mt-0.5">{emotionalAction.prompt}</p>
          </div>
          <ArrowRight className="size-3 text-rose-400" />
        </Link>
      )}

      {/* Autonomous tasks */}
      {autoActions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-label">系统自动操作</p>
          {autoActions.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-fg-muted">
              <Check className="size-3 text-emerald-500" />
              <span>{a.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Trust meter */}
      <div className="flex items-center gap-2">
        <span className="text-caption">系统自主信任度</span>
        <div className="flex-1 h-1 rounded-full bg-bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary"
            initial={{ width: 0 }} animate={{ width: `${state.executionTrustScore}%` }}
            transition={{ duration: 0.8 }} />
        </div>
        <span className="text-caption font-mono">{state.executionTrustScore}%</span>
      </div>
    </motion.div>
  );
}
