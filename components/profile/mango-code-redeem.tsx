"use client";

import * as React from "react";
import { Gift, Loader2, Check, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/plan/types";
import { getPlanInfo } from "@/lib/plan/types";

interface Props {
  onUpgrade: (plan: PlanTier, expiresAt?: string) => void;
  currentPlan: PlanTier;
}

export function MangoCodeRedeem({ onUpgrade, currentPlan }: Props) {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
    planName?: string;
    errorCode?: string;
  } | null>(null);
  const [validating, setValidating] = React.useState(false);

  // Live validation as user types
  React.useEffect(() => {
    if (code.length < 6) { setResult(null); return; }
    const timer = setTimeout(() => {
      setValidating(true);
      fetch("/api/mango-code/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, validateOnly: true }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setResult({ success: true, message: `有效兑换码 · ${getPlanInfo(data.plan?.tier).name}`, planName: getPlanInfo(data.plan?.tier).name });
          } else {
            setResult(null); // Don't show errors during typing
          }
        })
        .catch(() => setResult(null))
        .finally(() => setValidating(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  async function handleRedeem() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/mango-code/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: data.message, planName: data.plan?.name });
        onUpgrade(data.plan.tier, data.plan.expiresAt);
        setCode("");
      } else {
        setResult({ success: false, message: data.error, errorCode: data.code });
      }
    } catch {
      setResult({ success: false, message: "网络错误，请重试" });
    } finally {
      setLoading(false);
    }
  }

  const isGuest = currentPlan === "guest";

  return (
    <div className="card-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="size-4 text-amber-500" />
        <h2 className="text-[15px] font-semibold">Mango Code 兑换</h2>
      </div>

      {isGuest ? (
        <div className="text-center py-3">
          <p className="text-[13px] text-fg-muted/90">登录后可兑换 Mango Code 升级计划</p>
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 mt-2 text-[13px] text-primary font-medium hover:underline"
          >
            前往登录 <ArrowRight className="size-3" />
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-fg-muted/90">
            输入 Mango Code 兑换码，升级你的学习计划。
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MANGO-XXXX-XXXX-XXXX"
                className={`h-11 rounded-xl font-mono text-[13px] tracking-wider ${
                  result?.success ? "border-green-400" : result?.success === false ? "border-red-300" : ""
                }`}
                disabled={loading}
                onKeyDown={(e) => { if (e.key === "Enter") handleRedeem(); }}
              />
              {validating && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Loader2 className="size-3.5 animate-spin text-fg-subtle/90" />
                </div>
              )}
              {result?.success && !validating && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Check className="size-4 text-green-500" />
                </div>
              )}
            </div>
            <Button
              onClick={handleRedeem}
              disabled={!code.trim() || loading}
              className="h-11 px-5 rounded-xl text-[13px] font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-400/20"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "兑换"}
            </Button>
          </div>

          {/* Result feedback */}
          {result && (
            <div
              className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] animate-fade-up ${
                result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {result.success ? (
                <Sparkles className="size-3.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{result.message}</p>
                {result.errorCode === "ALREADY_USED" && (
                  <p className="text-[11px] mt-0.5 opacity-70">此兑换码已被使用。如需升级请联系管理员。</p>
                )}
                {result.errorCode === "EXPIRED" && (
                  <p className="text-[11px] mt-0.5 opacity-70">兑换码已过期。请获取新的兑换码。</p>
                )}
                {result.errorCode === "INVALID_CODE" && (
                  <p className="text-[11px] mt-0.5 opacity-70">请检查输入是否正确，Mango Code 格式为 MANGO-XXXX-XXXX-XXXX。</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
