"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Brain, Target, TrendingUp, BookOpen, Package, Layers,
  Heart, Clock, Zap, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, Flame, GraduationCap, FileText, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { SoulBackground } from "@/components/ui/module-backgrounds";
import { buildLearningIdentity, loadMemory } from "@/lib/agent/learning-memory";
import { getMistakeStats } from "@/lib/agent/mistake-bank";
import type { LearningIdentity } from "@/lib/agent/types";
import { loadStudyPacksSync } from "@/lib/study-pack-store";
import Link from "next/link";

/* ── Learning Preset Component ───────────────────────────────────── */

const PRESETS = [
  { id: "exam_sprint", name: "期末冲刺", icon: "⚡", desc: "高强度备考 · 重点突破", style: "concise" as const, examFocus: true },
  { id: "deep_learner", name: "深度学习者", icon: "🧠", desc: "概念优先 · 跨学科连接", style: "detailed" as const, examFocus: false },
  { id: "english_ielts", name: "英语/IELTS", icon: "🗣️", desc: "词汇积累 · 口语写作", style: "example-heavy" as const, examFocus: true },
  { id: "ai_builder", name: "AI 构建者", icon: "🤖", desc: "项目驱动 · 源码阅读", style: "visual" as const, examFocus: false },
];

function PresetSelector() {
  const [presetId, setPresetId] = React.useState(() => {
    try { return localStorage.getItem("mango-identity-preset") || "deep_learner"; }
    catch { return "deep_learner"; }
  });
  const [saved, setSaved] = React.useState(false);

  function select(id: string) {
    setPresetId(id);
    localStorage.setItem("mango-identity-preset", id);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const preset = PRESETS.find(p => p.id === presetId);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="card-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-title font-serif flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          学习风格
        </h2>
        {saved && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">已保存</span>}
      </div>
      <p className="text-xs text-fg-muted/90">
        选择预设影响 Mango Agent 讲解风格、Study Pack 结构深度和推荐内容。
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => select(p.id)}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all text-xs ${
              presetId === p.id ? "border-primary bg-primary-subtle ring-1 ring-primary/20" : "border-border hover:border-primary/20"
            }`}>
            <span className="text-lg">{p.icon}</span>
            <p className="font-semibold">{p.name}</p>
            <p className="text-[10px] text-fg-muted/90">{p.desc}</p>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] bg-bg-subtle rounded-xl p-3">
        {[
          { label: "Agent 风格", val: preset?.style === "concise" ? "精简直接" : preset?.style === "detailed" ? "深度讲解" : preset?.style === "example-heavy" ? "案例驱动" : "可视化" },
          { label: "Study Pack", val: preset?.examFocus ? "考试冲刺型" : "深度理解型" },
          { label: "笔记推荐", val: preset?.examFocus ? "复习/错题模板" : "概念/阅读模板" },
          { label: "讲解重点", val: preset?.examFocus ? "考点+技巧" : "概念+推导" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-fg-subtle/90">{item.label}</span>
            <span className="font-medium">{item.val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LearningIdentityPage() {
  const [identity, setIdentity] = React.useState<LearningIdentity | null>(null);
  const [mistakeStats, setMistakeStatsState] = React.useState({ total: 0, mastered: 0, due: 0, bySubject: {} as Record<string, number> });

  React.useEffect(() => {
    try {
      setIdentity(buildLearningIdentity());
      setMistakeStatsState(getMistakeStats());
    } catch { /* guest */ }
  }, []);

  const memory = React.useMemo(() => {
    try { return loadMemory(); } catch { return null; }
  }, []);

  if (!identity) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Brain className="size-12 text-fg-muted/20" />
          <p className="text-fg-muted">登录后查看学习身份</p>
          <Link href="/login"><Button variant="outline" className="rounded-xl">登录</Button></Link>
        </div>
      </PageTransition>
    );
  }

  const packCount = identity.assetCounts.studyPacks;
  const masteryRate = mistakeStats.total > 0 ? Math.round((mistakeStats.mastered / mistakeStats.total) * 100) : 0;
  const highPriority = identity.weakPoints.filter(w => w.priority === "high");

  return (
    <PageTransition>
    <div className="relative flex flex-col gap-8 pb-20 max-w-2xl mx-auto">
      <SoulBackground />

      {/* Hero */}
      <section className="relative z-10">
        <h1 className="text-display font-serif">学习身份</h1>
        <p className="text-sm text-fg-muted mt-1">你的学习轨迹 · 优势 · 弱项 · 资产</p>
      </section>

      {/* Identity Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center text-3xl">
            🧠
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-heading font-serif">Mango 学习者</h2>
            <div className="flex flex-wrap gap-1.5">
              {memory?.courses.slice(0, 3).map(c => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
              {memory?.courses.length === 0 && <span className="text-xs text-fg-muted">尚未添加课程</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-fg-muted">
              <span className="flex items-center gap-1"><Clock className="size-3" /> {identity.studyRhythm === "irregular" ? "不规律" : identity.studyRhythm === "morning" ? "晨间型" : identity.studyRhythm === "evening" ? "晚间型" : "午后型"}</span>
              <span className="flex items-center gap-1"><Lightbulb className="size-3" /> {identity.preferredStyle === "detailed" ? "详细型" : identity.preferredStyle === "concise" ? "简洁型" : identity.preferredStyle === "example-heavy" ? "案例型" : "视觉型"}</span>
            </div>
          </div>
        </div>

        {/* Strengths & Weak Points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50/50 p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> 优势
            </span>
            <div className="flex flex-wrap gap-1">
              {identity.strengths.length > 0
                ? identity.strengths.slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">{s}</span>
                  ))
                : <span className="text-[10px] text-fg-muted">持续练习积累中</span>}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50/50 p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-amber-700 flex items-center gap-1">
              <AlertTriangle className="size-3" /> 待攻克
            </span>
            <div className="flex flex-wrap gap-1">
              {highPriority.length > 0
                ? highPriority.slice(0, 4).map(w => (
                    <span key={w.topic} className="text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">{w.topic}</span>
                  ))
                : <span className="text-[10px] text-fg-muted">暂无高优先级弱项</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Counts */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: Package, label: "学习包", value: packCount, href: "/pack" },
          { icon: FileText, label: "笔记", value: identity.assetCounts.notes, href: "/exam" },
          { icon: Layers, label: "闪卡", value: identity.assetCounts.flashcards, href: "/pack" },
          { icon: Target, label: "错题", value: mistakeStats.total, href: "/agent" },
          { icon: Flame, label: "掌握率", value: `${masteryRate}%`, href: null },
        ].map(s => (
          <div key={s.label}>
            {s.href ? (
              <Link href={s.href} className="card-card p-3 flex flex-col gap-1 hover:shadow-sm transition-all block">
                <s.icon className="size-4 text-fg-muted" />
                <span className="text-xl font-bold font-serif">{s.value}</span>
                <span className="text-[10px] text-fg-muted">{s.label}</span>
              </Link>
            ) : (
              <div className="card-card p-3 flex flex-col gap-1">
                <s.icon className="size-4 text-fg-muted" />
                <span className="text-xl font-bold font-serif">{s.value}</span>
                <span className="text-[10px] text-fg-muted">{s.label}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Growth Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="text-title font-serif">成长进度</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">错题掌握</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-serif">{masteryRate}%</span>
              <span className="text-xs text-fg-muted pb-1">{mistakeStats.mastered}/{mistakeStats.total}</span>
            </div>
            <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${masteryRate}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">学习包完成</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-serif">{packCount}</span>
              <span className="text-xs text-fg-muted pb-1">个已生成</span>
            </div>
            <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, packCount * 10)}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-title font-serif">下一步建议</h2>
        </div>
        <div className="flex flex-col gap-2">
          {identity.recentRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-bg-muted/50 p-3">
              <span className="text-lg">💡</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Learning Preset (affects Agent + Study Pack output) ── */}
      <PresetSelector />

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Link href="/pack"><Button className="gap-2 rounded-xl"><Package className="size-4" /> 新学习包</Button></Link>
        <Link href="/agent"><Button variant="outline" className="gap-2 rounded-xl"><Brain className="size-4" /> Agent 任务</Button></Link>
      </div>
    </div>
    </PageTransition>
  );
}
