// ─────────────────────────────────────────────────────────────
// MangoOS Navigation — Today | Pack | Agent | Profile
// ─────────────────────────────────────────────────────────────
import {
  Sun, Package, Bot, Trees, Heart,
  CalendarCheck, GraduationCap, Mic, User, MoreHorizontal, FileText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description: string;
  tier: "primary" | "secondary" | "beta";
}

export const navItemsV2: NavItem[] = [
  // ── Primary 4 (bottom nav) ─────────────────────────────────
  { id: "hub", label: "今日", shortLabel: "今日", href: "/hub", icon: Sun, description: "学习驾驶舱 · 继续学习 · 快速入口", tier: "primary" },
  { id: "pack", label: "学习包", shortLabel: "学习包", href: "/pack", icon: Package, description: "AI 生成复习讲义 · 导出", tier: "primary" },
  { id: "agent", label: "导师", shortLabel: "导师", href: "/agent", icon: Bot, description: "AI Agent · 任务执行 · 智能工具", tier: "primary" },
  { id: "profile", label: "我的", shortLabel: "我的", href: "/profile", icon: User, description: "计划 · 成就 · 配额 · 设置", tier: "primary" },
  // ── Secondary (More drawer) ────────────────────────────────
  { id: "notes", label: "笔记", shortLabel: "笔记", href: "/notes", icon: FileText, description: "结构化笔记 · 6种模板 · 导入", tier: "secondary" },
  { id: "forest", label: "知识森林", shortLabel: "森林", href: "/forest", icon: Trees, description: "知识网络 · 笔记关联 · 学习计划", tier: "secondary" },
  { id: "grow", label: "花园", shortLabel: "花园", href: "/grow", icon: Heart, description: "心灵花园 Pro · 10种模式 · 自我关怀", tier: "secondary" },
  { id: "planner", label: "学习计划", shortLabel: "计划", href: "/planner", icon: CalendarCheck, description: "智能生成计划 · 任务管理", tier: "secondary" },
  { id: "dna", label: "学习身份", shortLabel: "身份", href: "/dna", icon: GraduationCap, description: "学习轨迹 · 优势弱项 · 成长进度", tier: "secondary" },
  // ── Beta ───────────────────────────────────────────────────
  { id: "voice", label: "Mango Voice", shortLabel: "Voice", href: "/voice", icon: Mic, description: "语音对话 · 内测中", tier: "beta" },
];

/** Primary items for bottom mobile nav */
export const mobileNavItemsV2: NavItem[] = navItemsV2.filter(n => n.tier === "primary");

/** Secondary + Beta items for More drawer */
export const moreNavItems: NavItem[] = navItemsV2.filter(n => n.tier !== "primary");

export const redirectMapV2: Record<string, string> = {
  "/dashboard": "/hub", "/ai-tutor": "/agent", "/study-planner": "/planner",
  "/knowledge-hub": "/agent", "/exam": "/pack", "/exam-mode": "/pack",
  "/exam-master": "/pack", "/mind-garden": "/grow", "/mango-dna": "/dna",
  "/analytics": "/hub", "/projects": "/grow", "/mind": "/grow",
  "/knowledge-tree": "/agent",
};
