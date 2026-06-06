// ─────────────────────────────────────────────────────────────
// MangoOS V10.1 Navigation
// Home | Study Pack | Tutor | Garden | More
// ─────────────────────────────────────────────────────────────
import {
  Sparkles, BookOpen, Bot, Heart, GraduationCap,
  CalendarCheck, Mic, User, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** "primary" = always visible | "secondary" = More drawer | "beta" = labeled */
  tier: "primary" | "secondary" | "beta";
}

export const navItemsV2: NavItem[] = [
  // ── Primary (bottom nav + sidebar top) ──────────────────
  {
    id: "hub",
    label: "首页",
    shortLabel: "首页",
    href: "/hub",
    icon: Sparkles,
    description: "学习驾驶舱 · 进度总览 · 快速入口",
    tier: "primary",
  },
  {
    id: "exam",
    label: "学习包",
    shortLabel: "学习包",
    href: "/exam",
    icon: BookOpen,
    description: "期末备考 · 知识森林 · 笔记 · 闪卡",
    tier: "primary",
  },
  {
    id: "agent",
    label: "导师",
    shortLabel: "导师",
    href: "/agent",
    icon: Bot,
    description: "AI 对话 · 概念讲解 · 智能练习 · 知识导入",
    tier: "primary",
  },
  {
    id: "grow",
    label: "花园",
    shortLabel: "花园",
    href: "/grow",
    icon: Heart,
    description: "心灵花园 Pro · 情绪支持 · 自我关怀",
    tier: "primary",
  },
  // ── Secondary (More drawer + sidebar) ────────────────────
  {
    id: "planner",
    label: "学习计划",
    shortLabel: "计划",
    href: "/planner",
    icon: CalendarCheck,
    description: "智能生成计划 · 任务管理",
    tier: "secondary",
  },
  {
    id: "profile",
    label: "我的",
    shortLabel: "我的",
    href: "/profile",
    icon: User,
    description: "成就 · XP · 统计 · 设置",
    tier: "secondary",
  },
  // ── Beta (More drawer only) ──────────────────────────────
  {
    id: "voice",
    label: "Mango Voice",
    shortLabel: "Voice",
    href: "/voice",
    icon: Mic,
    description: "语音对话 · 内测中",
    tier: "beta",
  },
  {
    id: "dna",
    label: "Mango DNA",
    shortLabel: "DNA",
    href: "/dna",
    icon: GraduationCap,
    description: "AI 人格画像 · 即将上线",
    tier: "beta",
  },
];

/** Primary items for bottom mobile nav (first 4 + More) */
export const mobileNavItemsV2: NavItem[] = navItemsV2.filter(n => n.tier === "primary");

/** Secondary + Beta items for More drawer */
export const moreNavItems: NavItem[] = navItemsV2.filter(n => n.tier !== "primary");

export const redirectMapV2: Record<string, string> = {
  "/dashboard": "/hub",
  "/ai-tutor": "/agent",
  "/study-planner": "/planner",
  "/knowledge-hub": "/agent",
  "/exam-mode": "/exam",
  "/exam-master": "/exam",
  "/mind-garden": "/grow",
  "/mango-dna": "/dna",
  "/analytics": "/hub",
  "/projects": "/grow",
  "/mind": "/grow",
  "/knowledge-tree": "/agent",
};
