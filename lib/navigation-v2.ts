// ─────────────────────────────────────────────────────────────
// MangoLearningOS Navigation
// Mangosum | Mango Tutor | Mangoing | Mango Friend | Mango Plan | Mango DNA | Mango
// ─────────────────────────────────────────────────────────────
import {
  Sparkles, Bot, GraduationCap, Heart,
  CalendarCheck, Dna, User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const navItemsV2: NavItem[] = [
  {
    id: "hub",
    label: "Mangosum",
    shortLabel: "总览",
    href: "/hub",
    icon: Sparkles,
    description: "AI 学习驾驶舱，进度总览与分析",
  },
  {
    id: "agent",
    label: "Mango Tutor",
    shortLabel: "导师",
    href: "/agent",
    icon: Bot,
    description: "AI 对话 · 概念讲解 · 智能练习 · 知识导入",
  },
  {
    id: "exam",
    label: "Mangoing",
    shortLabel: "备考",
    href: "/exam",
    icon: GraduationCap,
    description: "考试备战 · 笔记 · 闪卡 · 资源 · 图谱",
  },
  {
    id: "grow",
    label: "Mango Friend",
    shortLabel: "花园",
    href: "/grow",
    icon: Heart,
    description: "心灵日记 · AI 陪伴 · 项目实践",
  },
  {
    id: "planner",
    label: "Mango Plan",
    shortLabel: "计划",
    href: "/planner",
    icon: CalendarCheck,
    description: "智能生成计划 · 任务管理 · 日/周/月/学期",
  },
  {
    id: "dna",
    label: "Mango DNA",
    shortLabel: "DNA",
    href: "/dna",
    icon: Dna,
    description: "AI 人格档案 · Agent 画廊 · 数字蒸馏",
  },
  {
    id: "profile",
    label: "Mango",
    shortLabel: "我的",
    href: "/profile",
    icon: User,
    description: "成就 · XP · 统计 · 设置",
  },
];

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

export const mobileNavItemsV2: NavItem[] = [
  navItemsV2[0], // Mangosum
  navItemsV2[1], // Mango Tutor
  navItemsV2[3], // Mango Friend
  navItemsV2[4], // Mango Plan
  navItemsV2[5], // Mango DNA
];
