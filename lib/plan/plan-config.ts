/**
 * MangoOS V14.4 — Unified Membership Configuration
 *
 * Single source of truth for all plan tier capabilities.
 * All feature gates, generation quality, quotas, and UI labels
 * MUST read from here — never hardcode plan logic in pages.
 */
import type { PlanTier } from "./types";

// ── Tier metadata ──────────────────────────────────────────────

export interface TierMeta {
  tier: PlanTier;
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  bgClass: string;
}

export const TIER_META: Record<PlanTier, TierMeta> = {
  guest: {
    tier: "guest",
    name: "游客体验",
    shortName: "Guest",
    badge: "Guest",
    tagline: "浏览与体验",
    description: "受限体验 · 浏览学习内容",
    icon: "👋",
    color: "#9CA3AF",
    bgClass: "bg-gray-400/10",
  },
  standard: {
    tier: "standard",
    name: "标准版",
    shortName: "Standard",
    badge: "Standard",
    tagline: "轻量学习助手",
    description: "基础 AI 学习 · 对话 · 笔记 · 有限生成",
    icon: "📚",
    color: "#C58B74",
    bgClass: "bg-primary/10",
  },
  pro: {
    tier: "pro",
    name: "Pro 专业版",
    shortName: "Pro",
    badge: "Pro",
    tagline: "高质量成果生产系统",
    description: "深度生成 · 高级 Agent · PDF/DOCX · 云端 · 语音",
    icon: "⚡",
    color: "#F59E0B",
    bgClass: "bg-amber-400/10",
  },
  admin: {
    tier: "admin",
    name: "管理员",
    shortName: "Admin",
    badge: "Admin",
    tagline: "完整管理权限",
    description: "所有功能 · 管理后台 · 无限制",
    icon: "🔧",
    color: "#7B8FCA",
    bgClass: "bg-blue-400/10",
  },
};

// ── Detailed comparison (for onboarding + profile) ─────────────

export interface PlanComparisonItem {
  feature: string;
  standard: string | boolean;
  pro: string | boolean;
  category: "core" | "generation" | "export" | "ai" | "storage";
}

export const PLAN_COMPARISON: PlanComparisonItem[] = [
  // Core
  { feature: "Mango Agent", standard: "基础对话与答疑", pro: "多步骤任务执行 + 工具调用", category: "core" },
  { feature: "Mango Tutor", standard: "基础讲解与练习", pro: "深度个性化辅导 + 学习路径", category: "core" },
  { feature: "学习包生成", standard: "基础复习纲要", pro: "完整 18-section 讲义 + 来源", category: "core" },
  { feature: "每日 Agent 次数", standard: "20 次", pro: "100 次", category: "core" },
  { feature: "每日学习包", standard: "3 个", pro: "20 个", category: "core" },
  // Generation
  { feature: "内容深度", standard: "标准 (4096 tokens)", pro: "深度 (8192 tokens)", category: "generation" },
  { feature: "例题/案例密度", standard: "正常", pro: "丰富", category: "generation" },
  { feature: "章节结构", standard: "3-5 章节", pro: "6-8 章节", category: "generation" },
  { feature: "质量评分门槛", standard: "60 分", pro: "75 分 + 自动修复", category: "generation" },
  { feature: "来源检索", standard: "最多 4 条", pro: "最多 8 条 + 深度搜索", category: "generation" },
  { feature: "文件上传", standard: "最多 10 MB", pro: "最多 50 MB", category: "generation" },
  // Export
  { feature: "Markdown 导出", standard: true, pro: true, category: "export" },
  { feature: "DOCX 导出", standard: true, pro: true, category: "export" },
  { feature: "PDF 导出", standard: false, pro: true, category: "export" },
  // AI
  { feature: "联网资料分析", standard: false, pro: true, category: "ai" },
  { feature: "OCR 文字识别", standard: false, pro: true, category: "ai" },
  { feature: "Mango DNA 个性化", standard: "基础", pro: "深度 · 长期记忆", category: "ai" },
  { feature: "语音助手", standard: "可用", pro: "高级语音 + 多人格", category: "ai" },
  // Storage
  { feature: "历史记录", standard: "本地 50 条", pro: "云端 500 条", category: "storage" },
  { feature: "云端同步", standard: false, pro: true, category: "storage" },
  { feature: "芒果码兑换", standard: true, pro: true, category: "storage" },
];

// ── Generation quality config by tier ──────────────────────────

export interface TierQualityConfig {
  maxTokens: number;
  depth: "basic" | "standard" | "deep";
  exampleDensity: "sparse" | "normal" | "rich";
  maxSources: number;
  sourcePlatforms: string[];
  minQualityScore: number;
  autoRepair: boolean;
  maxSections: number;
  enableDeepResearch: boolean;
  exportFormats: string[];
}

export const TIER_QUALITY: Record<PlanTier, TierQualityConfig> = {
  guest: {
    maxTokens: 1024, depth: "basic", exampleDensity: "sparse",
    maxSources: 0, sourcePlatforms: [], minQualityScore: 0, autoRepair: false,
    maxSections: 3, enableDeepResearch: false, exportFormats: [],
  },
  standard: {
    maxTokens: 4096, depth: "standard", exampleDensity: "normal",
    maxSources: 4, sourcePlatforms: ["wikipedia", "duckduckgo"],
    minQualityScore: 60, autoRepair: false, maxSections: 5,
    enableDeepResearch: false, exportFormats: ["markdown", "html", "docx"],
  },
  pro: {
    maxTokens: 8192, depth: "deep", exampleDensity: "rich",
    maxSources: 8, sourcePlatforms: ["wikipedia", "duckduckgo", "dictionary"],
    minQualityScore: 75, autoRepair: true, maxSections: 8,
    enableDeepResearch: true, exportFormats: ["markdown", "html", "docx", "pdf"],
  },
  admin: {
    maxTokens: 16384, depth: "deep", exampleDensity: "rich",
    maxSources: 12, sourcePlatforms: ["wikipedia", "duckduckgo", "dictionary", "openlibrary"],
    minQualityScore: 80, autoRepair: true, maxSections: 12,
    enableDeepResearch: true, exportFormats: ["markdown", "html", "docx", "pdf"],
  },
};

/** Get quality config for a tier */
export function getTierQuality(tier: PlanTier): TierQualityConfig {
  return TIER_QUALITY[tier] ?? TIER_QUALITY.guest;
}
