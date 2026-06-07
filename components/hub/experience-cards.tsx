"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, FileText, Lightbulb, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import { createIntentPayload } from "@/lib/today/intent-router";

interface ExperienceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  intent: string;
  route: string;
}

const CARDS: ExperienceCard[] = [
  {
    id: "study_outcome",
    title: "生成高数2期末复习包",
    description: "知识框架、考点、例题、易错点、7天计划",
    icon: BookOpen,
    intent: "帮我复习高数2期末考试",
    route: "/agent",
  },
  {
    id: "material_organize",
    title: "整理一份课堂笔记",
    description: "摘要、关键概念、结构化笔记、复习要点",
    icon: FileText,
    intent: "帮我整理课堂笔记",
    route: "/agent",
  },
  {
    id: "project_thinking",
    title: "分析 MangoOS 下一步升级",
    description: "问题诊断、优先级、执行步骤、风险、下一步",
    icon: Lightbulb,
    intent: "分析 MangoOS 下一步升级方向",
    route: "/agent",
  },
  {
    id: "daily_review",
    title: "复盘今天学习状态",
    description: "完成情况、卡点、改进点、明日最低行动",
    icon: RotateCcw,
    intent: "帮我复盘今天的学习",
    route: "/grow",
  },
];

export function ExperienceCards() {
  const router = useRouter();

  function handleCard(card: ExperienceCard) {
    const payload = createIntentPayload(card.intent, "mango_today");
    const q = encodeURIComponent(payload.suggestedPrompt);
    const t = encodeURIComponent(payload.type);
    router.push(`${card.route}?q=${q}&intent=${t}&intentId=${payload.id}`);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <div>
          <p className="text-sm font-semibold">先生成一个成果</p>
          <p className="text-[11px] text-fg-muted/90">
            不用理解功能名，先试一次 MangoOS 能帮你做什么
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCard(card)}
            className="card-card p-3.5 text-left group hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
                <card.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {card.title}
                </p>
                <p className="text-[11px] text-fg-muted/90 mt-0.5 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <ArrowRight className="size-3.5 text-fg-subtle/90 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
