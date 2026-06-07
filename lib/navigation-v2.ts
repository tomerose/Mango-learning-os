// ─────────────────────────────────────────────────────────────
// MangoOS V10.1 Navigation
// Home | Study Pack | Tutor | Garden | More
// ─────────────────────────────────────────────────────────────
import {
  Sparkles, BookOpen, Bot, Heart, GraduationCap,
  CalendarCheck, Mic, User, Trees, Network, FileText,
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
    label: "Today",
    shortLabel: "Today",
    href: "/hub",
    icon: Sparkles,
    description: "学习驾驶舱 · 今日任务 · 继续学习",
    tier: "primary",
  },
  {
    id: "exam",
    label: "Generate",
    shortLabel: "Generate",
    href: "/exam",
    icon: BookOpen,
    description: "Study Pack · 资料输入 · 导出文档",
    tier: "primary",
  },
  {
    id: "agent",
    label: "Agent",
    shortLabel: "Agent",
    href: "/agent",
    icon: Bot,
    description: "执行工作台 · 对话 · 讲解 · 练习",
    tier: "primary",
  },
  {
    id: "profile",
    label: "Profile",
    shortLabel: "Profile",
    href: "/profile",
    icon: User,
    description: "Learning Identity · XP · 数据与隐私",
    tier: "primary",
  },
  // ── Secondary (More drawer + sidebar) ────────────────────
  {
    id: "notes",
    label: "Notes",
    shortLabel: "Notes",
    href: "/exam?tab=notes",
    icon: FileText,
    description: "笔记 · 导入 · 编辑",
    tier: "secondary",
  },
  {
    id: "forest",
    label: "Forest",
    shortLabel: "Forest",
    href: "/exam?tab=forest",
    icon: Trees,
    description: "知识森林 · 学习路径",
    tier: "secondary",
  },
  {
    id: "graph",
    label: "Graph",
    shortLabel: "Graph",
    href: "/exam?tab=graph",
    icon: Network,
    description: "知识网络 · 关系图谱",
    tier: "secondary",
  },
  {
    id: "planner",
    label: "Planner",
    shortLabel: "Planner",
    href: "/planner",
    icon: CalendarCheck,
    description: "计划生成 · 任务管理",
    tier: "secondary",
  },
  {
    id: "grow",
    label: "Grow",
    shortLabel: "Grow",
    href: "/grow",
    icon: Heart,
    description: "Mind Garden · 情绪支持 · 隐私优先",
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
