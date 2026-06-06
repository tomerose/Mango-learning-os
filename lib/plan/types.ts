// ═══════════════════════════════════════════════════════════════
// MangoOS Plan & Feature Gate Types
// Centralized plan model — single source of truth for all gates
// ═══════════════════════════════════════════════════════════════

export type PlanTier = "guest" | "standard" | "pro" | "admin";

export interface PlanFeatureFlags {
  // Core Agent
  canUseMangoAgent: boolean;
  canUseDeepStudyPack: boolean;
  canUploadFiles: boolean;
  maxFileSizeMB: number;
  // Advanced AI
  canUseOCR: boolean;
  canUseVoiceInput: boolean;
  canUseDeepResearch: boolean;
  // Export
  canExportDocx: boolean;
  canExportPdf: boolean;
  // Memory & Review
  canUseLongTermMemory: boolean;
  canUseAdvancedReview: boolean;
  // Quotas
  maxDailyAgentTasks: number;
  maxDailyStudyPacks: number;
  maxSavedTasks: number;
  maxSavedStudyPacks: number;
  // Misc
  canRedeemCodes: boolean;
  canAccessAdmin: boolean;
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatureFlags> = {
  guest: {
    canUseMangoAgent: false,
    canUseDeepStudyPack: false,
    canUploadFiles: false,
    maxFileSizeMB: 0,
    canUseOCR: false,
    canUseVoiceInput: false,
    canUseDeepResearch: false,
    canExportDocx: false,
    canExportPdf: false,
    canUseLongTermMemory: false,
    canUseAdvancedReview: false,
    maxDailyAgentTasks: 0,
    maxDailyStudyPacks: 0,
    maxSavedTasks: 3,
    maxSavedStudyPacks: 1,
    canRedeemCodes: false,
    canAccessAdmin: false,
  },
  standard: {
    canUseMangoAgent: true,
    canUseDeepStudyPack: true,
    canUploadFiles: true,
    maxFileSizeMB: 10,
    canUseOCR: false,
    canUseVoiceInput: true,
    canUseDeepResearch: false,
    canExportDocx: true,
    canExportPdf: false,
    canUseLongTermMemory: false,
    canUseAdvancedReview: false,
    maxDailyAgentTasks: 20,
    maxDailyStudyPacks: 3,
    maxSavedTasks: 50,
    maxSavedStudyPacks: 10,
    canRedeemCodes: true,
    canAccessAdmin: false,
  },
  pro: {
    canUseMangoAgent: true,
    canUseDeepStudyPack: true,
    canUploadFiles: true,
    maxFileSizeMB: 50,
    canUseOCR: true,
    canUseVoiceInput: true,
    canUseDeepResearch: true,
    canExportDocx: true,
    canExportPdf: true,
    canUseLongTermMemory: true,
    canUseAdvancedReview: true,
    maxDailyAgentTasks: 100,
    maxDailyStudyPacks: 20,
    maxSavedTasks: 500,
    maxSavedStudyPacks: 100,
    canRedeemCodes: true,
    canAccessAdmin: false,
  },
  admin: {
    canUseMangoAgent: true,
    canUseDeepStudyPack: true,
    canUploadFiles: true,
    maxFileSizeMB: 200,
    canUseOCR: true,
    canUseVoiceInput: true,
    canUseDeepResearch: true,
    canExportDocx: true,
    canExportPdf: true,
    canUseLongTermMemory: true,
    canUseAdvancedReview: true,
    maxDailyAgentTasks: 9999,
    maxDailyStudyPacks: 9999,
    maxSavedTasks: 9999,
    maxSavedStudyPacks: 9999,
    canRedeemCodes: true,
    canAccessAdmin: true,
  },
};

export interface PlanInfo {
  tier: PlanTier;
  name: string;
  badge: string;
  description: string;
  features: PlanFeatureFlags;
  expiresAt?: string; // ISO date for time-limited plans
  upgradedFrom?: PlanTier;
}

export function getPlanInfo(tier: PlanTier, expiresAt?: string): PlanInfo {
  const names: Record<PlanTier, string> = {
    guest: "游客体验",
    standard: "标准版",
    pro: "Pro 专业版",
    admin: "管理员",
  };
  const badges: Record<PlanTier, string> = {
    guest: "Guest",
    standard: "Standard",
    pro: "Pro",
    admin: "Admin",
  };
  const descriptions: Record<PlanTier, string> = {
    guest: "受限体验 · 浏览学习内容",
    standard: "基础登录 · Agent · 学习包 · 笔记",
    pro: "全部功能 · OCR · 语音 · 深度研究",
    admin: "完整管理权限 · 无限制",
  };
  return {
    tier,
    name: names[tier],
    badge: badges[tier],
    description: descriptions[tier],
    features: PLAN_FEATURES[tier],
    expiresAt,
  };
}
