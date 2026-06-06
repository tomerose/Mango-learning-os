"use client";

import * as React from "react";
import { Crown, Shield, Sparkles, Check, ArrowRight, Clock } from "lucide-react";
import type { PlanTier, PlanFeatureFlags } from "@/lib/plan/types";
import type { PlanInfo } from "@/lib/plan/types";

interface Props {
  plan: PlanTier;
  planInfo: PlanInfo;
  features: PlanFeatureFlags;
  expiresAt: string | null;
}

const featureLabels: Array<{ key: keyof PlanFeatureFlags; label: string; icon: string }> = [
  { key: "canUseMangoAgent", label: "Mango Agent", icon: "🤖" },
  { key: "canUseDeepStudyPack", label: "学习包", icon: "📦" },
  { key: "canUseVoiceInput", label: "语音输入", icon: "🎤" },
  { key: "canUseOCR", label: "OCR 识别", icon: "👁️" },
  { key: "canUseDeepResearch", label: "深度研究", icon: "🔬" },
  { key: "canExportDocx", label: "DOCX 导出", icon: "📄" },
  { key: "canExportPdf", label: "PDF 导出", icon: "📑" },
  { key: "canUseLongTermMemory", label: "长期记忆", icon: "🧠" },
  { key: "canUploadFiles", label: "文件上传", icon: "📎" },
];

export function PlanCard({ plan, planInfo, features, expiresAt }: Props) {
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <div className="card-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {plan === "pro" || plan === "admin" ? (
            <Crown className="size-5 text-amber-500" />
          ) : plan === "standard" ? (
            <Shield className="size-5 text-primary" />
          ) : (
            <Sparkles className="size-5 text-fg-muted" />
          )}
          <h2 className="text-[15px] font-semibold">当前计划</h2>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
          plan === "pro" || plan === "admin"
            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
            : plan === "standard"
            ? "bg-primary-subtle text-primary"
            : "bg-bg-muted text-fg-muted"
        }`}>
          {planInfo.badge}
        </span>
      </div>

      <p className="text-[13px] text-fg-muted/60 mb-4">{planInfo.description}</p>

      {/* Expiry notice */}
      {expiresAt && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-bg-subtle text-[12px]">
          <Clock className="size-3.5 text-fg-muted" />
          <span className="text-fg-muted">
            {isExpired
              ? "计划已过期，已降级为标准版"
              : `有效期至 ${new Date(expiresAt).toLocaleDateString("zh-CN")}`}
          </span>
        </div>
      )}

      {/* Feature grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {featureLabels.map(({ key, label, icon }) => {
          const value = features[key];
          const enabled = typeof value === "boolean" ? value : (value as number) > 0;
          return (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all ${
                enabled
                  ? "bg-bg-subtle text-fg"
                  : "bg-bg-muted/50 text-fg-muted/40 line-through decoration-fg-muted/20"
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span className="truncate">{label}</span>
              {enabled && <Check className="size-3 text-green-500 shrink-0 ml-auto" />}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for guest/standard */}
      {plan === "guest" && (
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href="/login"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-primary-subtle hover:bg-primary-subtle/70 transition-colors group"
          >
            <div>
              <p className="text-[13px] font-medium text-primary">注册解锁全部功能</p>
              <p className="text-[11px] text-fg-muted/60">登录后可使用 Agent、学习包等功能</p>
            </div>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}

      {plan === "standard" && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors group">
            <div>
              <p className="text-[13px] font-medium text-amber-700">升级到 Pro 专业版</p>
              <p className="text-[11px] text-fg-muted/60">解锁 OCR、深度研究、PDF 导出等高级功能</p>
            </div>
            <ArrowRight className="size-4 text-amber-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
