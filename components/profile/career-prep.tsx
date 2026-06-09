"use client";

/**
 * MangoOS V14.8.1 — Career Prep Mini-Module
 * Inspired by santifer/career-ops (51K ★): structured job search preparation.
 *
 * Simple self-contained component for Profile page.
 * Three tabs: Resume Tips / Interview Practice / Job Search Framework
 *
 * Data: static reference content + localStorage for user notes.
 * Future: integrate with career-ops full pipeline.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Mic, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CareerTab = "resume" | "interview" | "search";

const CAREER_CONTENT: Record<CareerTab, { title: string; subtitle?: string; tips: string[] }> = {
  resume: {
    title: "简历要点 (career-ops ATS 优化法)",
    subtitle: "每份简历针对一个岗位定制 — 提取 JD 关键词, STAR+R 格式, 量化成果",
    tips: [
      "关键词匹配: 提取 JD 中的 5-8 个核心词, 确保简历中出现",
      "用 STAR+R 格式写经历: Situation → Task → Action → Result → Reflection",
      "量化成果: '提升效率 30%' > '负责优化流程'",
      "ATS 友好: 用标准标题(Experience/Education/Skills), 避免表格和图片",
      "一页纸原则: 应届生简历不超过 1 页",
    ],
  },
  interview: {
    title: "面试准备 (STAR+R 故事银行法)",
    subtitle: "积累 5-10 个可复用的 master stories, 覆盖行为面试所有高频问题",
    tips: [
      "准备 5-10 个 master stories — 每个可以回答 3-5 种不同的问题",
      "STAR+R: Situation → Task → Action → Result → Reflection (你学到了什么?)",
      "准备追问: '你最大的失败?' '团队冲突怎么处理?' '为什么选择我们?'",
      "反向面试: 准备 3 个问题问面试官 (团队/技术栈/成长路径)",
      "模拟练习: 用 AI 做 mock interview, 录音回听改进口头表达",
    ],
  },
  search: {
    title: "求职框架 (career-ops A-F 评分)",
    tips: [
      "A-F 10 维评分: 岗位匹配/薪资/成长/文化/地点/WLB/技术栈/团队/公司阶段/使命",
      "只投 ≥ 4.0/5 分的岗位 — 你的时间比海投更值钱",
      "建立 Pipeline 追踪表: 公司/岗位/投递日期/状态/下一步",
      "每周固定 2 个时间段处理求职 — 不要让它占据全部时间",
      "利用 LinkedIn/校友网络/校园招聘会 — 内推转化率远高于海投",
    ],
  },
};

export function CareerPrep({ className }: { className?: string }) {
  const [tab, setTab] = React.useState<CareerTab>("resume");

  const tabs: { key: CareerTab; label: string; icon: React.ReactNode }[] = [
    { key: "resume", label: "简历", icon: <FileText className="size-3.5" /> },
    { key: "interview", label: "面试", icon: <Mic className="size-3.5" /> },
    { key: "search", label: "求职", icon: <Search className="size-3.5" /> },
  ];

  const content = CAREER_CONTENT[tab];

  return (
    <motion.div
      className={cn("surface-card rounded-2xl p-5 space-y-4", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2">
        <Briefcase className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">求职准备</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">career-ops</span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
              tab === t.key
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{content.title}</h4>
        {content.subtitle && (
          <p className="text-xs text-primary/80 font-medium">{content.subtitle}</p>
        )}
        <ul className="space-y-1.5">
          {content.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary/50" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-muted-foreground/60 italic">
        来源: github.com/santifer/career-ops (51K ★) — 创始人用它评估 740+ 岗位并拿到 Head of AI 职位
      </p>
    </motion.div>
  );
}
