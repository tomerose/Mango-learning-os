"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, FileText, Calendar, Lightbulb, RotateCcw, X, Library, Bot } from "lucide-react";
import { ONBOARDING_KEY } from "@/lib/version";
import Link from "next/link";

const PRIMARY_ACTIONS = [
  { icon: Calendar, label: "今天先做什么", desc: "设定优先级，安排今日学习任务", href: "/planner" },
  { icon: BookOpen, label: "生成学习成果", desc: "输入课程或主题，AI 生成结构化讲义", href: "/agent" },
  { icon: FileText, label: "整理我的资料", desc: "上传文档，提取关键知识", href: "/agent?tab=knowledge" },
  { icon: RotateCcw, label: "复盘今天", desc: "回顾收获，记录改进点", href: "/grow" },
];

const SECONDARY_ACTIONS = [
  { icon: Bot, label: "MangoAgent", desc: "深度研究 + 学习任务执行", href: "/agent" },
  { icon: Library, label: "Library", desc: "查看已生成的学习成品", href: "/library" },
];

interface Props { onComplete: () => void; }

export function MangoOnboarding({ onComplete }: Props) {
  const [exiting, setExiting] = React.useState(false);
  const [visibleActions, setVisibleActions] = React.useState(0);

  React.useEffect(() => {
    if (visibleActions >= PRIMARY_ACTIONS.length) return;
    const t = setTimeout(() => setVisibleActions(v => v + 1), 80);
    return () => clearTimeout(t);
  }, [visibleActions]);

  function handleEnter() {
    setExiting(true);
    try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, date: Date.now() })); } catch {}
    setTimeout(onComplete, 400);
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Skip */}
          <button onClick={handleEnter}
            className="absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2 text-xs font-medium text-black/40 hover:bg-black/10 transition-colors">
            跳过 <X className="size-3" />
          </button>

          <motion.div
            style={exiting ? { opacity: 0, y: -10 } : {}}
            className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm mx-auto text-center"
          >
            {/* Logo + Main line */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="size-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", border: "1px solid rgba(0,0,0,0.06)" }}>
                <Sparkles className="size-8 text-amber-500" strokeWidth={1} />
              </div>
              <div>
                <h1 className="text-[1.75rem] font-semibold tracking-normal text-black/85">今天要把什么变清楚？</h1>
                <p className="text-sm text-black/40 mt-2 leading-relaxed">把任务、资料、复习和混乱想法整理成可行动的成果。</p>
              </div>
            </motion.div>

            {/* Primary actions */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {PRIMARY_ACTIONS.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={i < visibleActions ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={a.href} onClick={handleEnter}
                    className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center h-full"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <a.icon className="size-6 text-amber-600" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-semibold text-black/80">{a.label}</p>
                      <p className="text-[11px] text-black/35 mt-0.5">{a.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Secondary entries */}
            <div className="flex gap-3">
              {SECONDARY_ACTIONS.map(a => (
                <Link key={a.label} href={a.href} onClick={handleEnter}
                  className="flex items-center gap-2 rounded-full bg-black/3 px-4 py-2 text-xs font-medium text-black/45 hover:bg-black/6 transition-colors">
                  <a.icon className="size-3.5" />
                  {a.label}
                </Link>
              ))}
            </div>

            {/* Enter */}
            <button onClick={handleEnter}
              className="text-xs text-black/30 hover:text-black/50 transition-colors">
              直接进入 MangoOS
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function shouldShowOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw);
    if (!data.completed) return true;
    return (Date.now() - data.date) / 86400000 > 30;
  } catch { return true; }
}
