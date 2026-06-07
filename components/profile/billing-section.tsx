"use client";

import * as React from "react";
import { Crown, Shield, Sparkles, Check, Clock, Gift, ArrowRight } from "lucide-react";
import type { PlanTier } from "@/lib/plan/types";
import { getPlanInfo, PLAN_FEATURES } from "@/lib/plan/types";
import { MangoCodeRedeem } from "./mango-code-redeem";

interface Props {
  currentPlan: PlanTier;
  planExpiresAt: string | null;
  onUpgrade: (plan: PlanTier, expiresAt?: string) => void;
}

const tiers: Array<{
  tier: PlanTier;
  icon: typeof Sparkles;
  gradient: string;
  price: string;
  priceLabel: string;
  highlights: string[];
}> = [
  {
    tier: "guest", icon: Sparkles, gradient: "from-fg-muted/40 to-fg-muted/60",
    price: "免费", priceLabel: "无需注册",
    highlights: ["浏览学习内容", "演示数据", "本地存储"],
  },
  {
    tier: "standard", icon: Shield, gradient: "from-primary to-primary-hover",
    price: "免费", priceLabel: "注册即用",
    highlights: ["Mango Agent", "学习包生成", "DOCX 导出", "语音输入", "文件上传 10MB", "每日 20 Agent 任务"],
  },
  {
    tier: "pro", icon: Crown, gradient: "from-amber-400 to-orange-500",
    price: "即将推出", priceLabel: "Mango Code 兑换",
    highlights: ["全部 Standard 功能", "OCR 识别", "深度研究", "PDF 导出", "长期记忆", "文件上传 50MB", "每日 100 Agent 任务", "高级复习引擎"],
  },
];

export function BillingSection({ currentPlan, planExpiresAt, onUpgrade }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Plan comparison */}
      <div className="card-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold mb-1">选择计划</h2>
        <p className="text-[12px] text-fg-muted/90 mb-4">选择最适合你的学习计划</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map(({ tier, icon: Icon, gradient, price, priceLabel, highlights }) => {
            const info = getPlanInfo(tier);
            const isCurrent = currentPlan === tier;
            const isUpgrade = tier !== "guest" && currentPlan === "guest";
            const isHigherTier = tier === "pro" && currentPlan === "standard";

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-xl border-2 p-4 transition-all ${
                  isCurrent
                    ? "border-primary bg-primary-subtle/30"
                    : "border-border hover:border-primary/20"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                    当前计划
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`size-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{info.name}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-[22px] font-bold font-serif">{price}</p>
                  <p className="text-[11px] text-fg-muted/90">{priceLabel}</p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-1.5 mb-4">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="size-3 text-green-500 shrink-0" />
                      <span className="text-[11px] text-fg-muted/70">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                {isCurrent ? (
                  <div className="py-2 text-center text-[12px] text-fg-muted/80 font-medium">
                    当前使用中
                  </div>
                ) : isUpgrade ? (
                  <a
                    href="/login"
                    className="w-full py-2.5 rounded-lg bg-primary text-white text-[12px] font-medium text-center hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
                  >
                    注册使用 <ArrowRight className="size-3" />
                  </a>
                ) : isHigherTier ? (
                  <div className="py-2 text-center text-[12px] text-amber-600 font-medium">
                    使用 Mango Code 升级
                  </div>
                ) : (
                  <div className="py-2 text-center text-[12px] text-fg-subtle/90">
                    {tier === "admin" ? "管理员专用" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mango Code redemption — the ONLY upgrade channel */}
      <MangoCodeRedeem onUpgrade={onUpgrade} currentPlan={currentPlan} />

      {/* Upgrade FAQ */}
      <div className="card-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold mb-3">常见问题</h2>
        <div className="space-y-3 text-[12px]">
          {[
            { q: "如何升级到 Pro 版？", a: "使用 Mango Code 兑换码即可升级。兑换码由管理员生成，请联系第三自习室获取。" },
            { q: "Pro 版有效期是多久？", a: "取决于兑换码设置的有效期。标准版永久免费。" },
            { q: "如何获取 Mango Code？", a: "联系第三自习室管理员获取。商业版本推出后将提供更多获取渠道。" },
            { q: "游客模式可以做什么？", a: "游客可以浏览学习内容和演示数据。完整功能需要注册登录。" },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="text-[13px] font-medium cursor-pointer hover:text-primary transition-colors">
                {faq.q}
              </summary>
              <p className="text-[12px] text-fg-muted/70 mt-1 ml-0 pl-0">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
