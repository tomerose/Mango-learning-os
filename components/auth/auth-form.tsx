"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Key, Loader2, AlertCircle, Sparkles, ArrowRight,
  Eye, EyeOff, ShieldCheck, Gift, LogIn,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleCaptcha } from "@/components/auth/captcha";

const LOGIN_CODE = "tokentome222";
const SIGNUP_CODE = "sillyfind2025";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [inviteCode, setInviteCode] = React.useState("");
  const [codeVerified, setCodeVerified] = React.useState(false);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [captchaOk, setCaptchaOk] = React.useState(false);
  const [step, setStep] = React.useState<"code" | "auth" | "success">("code");

  const isLogin = mode === "login";

  function verifyCode(code: string) {
    setInviteCode(code);
    const requiredCode = isLogin ? LOGIN_CODE : SIGNUP_CODE;
    if (code.trim() === requiredCode) {
      setCodeVerified(true);
      setCodeError(null);
      setCodeSuccess(true);
      setTimeout(() => {
        setStep("auth");
        setCodeSuccess(false);
      }, 600);
    } else if (code.trim().length >= requiredCode.length) {
      setCodeError("邀请码不正确，请检查后重试");
      setCodeVerified(false);
    } else {
      setCodeVerified(false);
      setCodeError(null);
    }
  }

  async function handleSocialLogin(provider: string) {
    if (!configured) return;
    if (provider === "qq") { setError("QQ 登录即将上线"); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "github",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "第三方登录失败");
    }
  }

  function continueAsGuest() {
    // Guest does NOT need invite code — direct entry
    try { document.cookie = "mango_guest=1;path=/;max-age=" + 60 * 60 * 24 * 30; } catch {}
    window.location.href = "/api/guest";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || loading) return;
    // Login needs code, signup also needs code
    if (!codeVerified) { setError("请先输入正确的邀请码"); return; }
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        document.cookie = "mango_visited=1;path=/;max-age=" + 60 * 60 * 24 * 365;
        // Clear guest cookie on login
        document.cookie = "mango_guest=;path=/;max-age=0";
        import("@/lib/mango-code/mango-code").then(m => m.seedDemoCodes()).catch(() => {});
        const redirectTo = searchParams.get("redirectedFrom") || "/hub";
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName || "Learner" } },
        });
        if (error) throw error;
        if (data.session) {
          // Email confirmation disabled — auto sign in
          document.cookie = "mango_visited=1;path=/;max-age=" + 60 * 60 * 24 * 365;
          document.cookie = "mango_guest=;path=/;max-age=0";
          import("@/lib/mango-code/mango-code").then(m => m.seedDemoCodes()).catch(() => {});
          router.push("/hub");
          router.refresh();
        } else if (data.user) {
          // Email confirmation required
          setStep("success");
          setNotice("注册成功！请查看邮箱确认链接，确认后即可登录。");
        } else {
          setError("注册失败，请稍后重试");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "操作失败";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("该邮箱已注册，请直接登录。");
      } else if (msg.includes("Invalid login")) {
        setError("邮箱或密码错误");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Code Entry Screen ──────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20">
            <span className="text-2xl">🥭</span>
          </div>
          <div>
            <h1 className="text-[22px] font-serif font-medium leading-tight tracking-tight">
              Mango Learning OS
            </h1>
            <p className="text-fg-muted/60 text-[13px] mt-1 font-medium">
              第三自习室出品 · 把焦虑变成准备
            </p>
          </div>
        </div>

        {/* Code card */}
        <div className="w-full card-paper-warm p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] font-medium text-fg">
              {isLogin ? "登录到 Mango" : "注册 Mango"}
            </p>
            <p className="text-[12px] text-fg-muted/60 leading-relaxed">
              输入邀请码以继续。{isLogin ? "已有账号请使用登录邀请码。" : "新用户请使用注册邀请码。"}
            </p>
          </div>

          {/* Invite code input */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute top-1/2 left-3.5 -translate-y-1/2">
                <Key className="size-4 text-fg-muted/40" />
              </div>
              <Input
                value={inviteCode}
                onChange={(e) => verifyCode(e.target.value)}
                placeholder="输入邀请码"
                className={`pl-10 pr-10 h-12 text-[15px] rounded-xl font-mono tracking-wider transition-all duration-200 ${
                  codeSuccess
                    ? "border-green-400 bg-green-50/50"
                    : codeError
                    ? "border-red-300 bg-red-50/30"
                    : "border-border hover:border-primary/30 focus:border-primary"
                }`}
                autoFocus
                autoComplete="off"
              />
              {codeSuccess && (
                <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
                  <ShieldCheck className="size-4 text-green-500" />
                </div>
              )}
            </div>
            {codeError && (
              <p className="text-destructive text-[12px] flex items-center gap-1.5 px-0.5">
                <AlertCircle className="size-3" />
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="text-green-600 text-[12px] flex items-center gap-1.5 px-0.5 animate-fade-up">
                <ShieldCheck className="size-3" />
                验证通过，正在进入…
              </p>
            )}
          </div>

          {/* Guest entry */}
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary/30 bg-bg-subtle/50 hover:bg-primary-subtle/30 transition-all duration-200 group"
          >
            <span className="text-[13px] text-fg-muted group-hover:text-primary font-medium flex items-center justify-center gap-1.5">
              以游客身份体验
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        {/* Auth mode switcher */}
        <p className="text-[13px] text-fg-muted/60">
          {isLogin ? "还没有账号？" : "已有账号？"}{" "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-primary font-medium hover:underline underline-offset-2"
          >
            {isLogin ? "注册" : "登录"}
          </Link>
        </p>

        {/* Footer */}
        <p className="text-[10px] text-fg-muted/30 tracking-widest uppercase">
          第三自习室出品
        </p>
      </div>
    );
  }

  // ── Auth Form Screen ─────────────────────────────────────────────
  if (step === "auth") {
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
        {/* Brand mini */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-sm">🥭</span>
          </div>
          <span className="text-[13px] font-medium text-fg-muted">
            {codeSuccess ? "验证通过" : ""}
          </span>
          <div className="bg-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="size-2.5" />
            已验证
          </div>
        </div>

        <div className="w-full card-paper-warm p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-[18px] font-serif font-medium">
              {isLogin ? "欢迎回来" : "创建账号"}
            </h2>
            <p className="text-[12px] text-fg-muted/60 mt-0.5">
              {isLogin ? "继续你的学习旅程" : "开始你的学习旅程"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Nickname (signup only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-medium">昵称</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="你的名字"
                  className="h-11 rounded-xl"
                  disabled={!configured || loading}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium">邮箱</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 rounded-xl"
                disabled={!configured || loading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium">密码</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  minLength={6}
                  required
                  className="h-11 rounded-xl pr-10"
                  disabled={!configured || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-muted/40 hover:text-fg-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Captcha (signup only) */}
            {!isLogin && <SimpleCaptcha onVerify={setCaptchaOk} />}

            {/* Error / Notice */}
            {error && (
              <div className="text-destructive text-[12px] flex items-center gap-1.5 bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}
            {notice && (
              <div className="text-green-700 text-[12px] flex items-center gap-1.5 bg-green-50 rounded-lg px-3 py-2">
                <Sparkles className="size-3.5 shrink-0" />
                {notice}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!configured || loading || (!isLogin && !captchaOk)}
              className="w-full h-12 rounded-xl text-[15px] font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-400/20 transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isLogin ? (
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  登录
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  注册
                </span>
              )}
            </Button>
          </form>

          {/* ── Social Login ── */}
          <div className="border-t border-border/30 pt-4 mt-1">
            <p className="text-[10px] text-fg-muted/40 text-center mb-3">或使用第三方账号</p>
            <div className="grid grid-cols-3 gap-2">
              <SocialButton provider="google" label="Google" onClick={() => handleSocialLogin("google")} />
              <SocialButton provider="github" label="GitHub" onClick={() => handleSocialLogin("github")} />
              <SocialButton provider="qq" label="QQ" onClick={() => handleSocialLogin("qq")} />
            </div>
          </div>
        </div>

        {/* Back to code */}
        <button
          type="button"
          onClick={() => setStep("code")}
          className="text-[12px] text-fg-muted/50 hover:text-fg-muted transition-colors"
        >
          ← 返回重新输入邀请码
        </button>

        {/* Footer */}
        <p className="text-[10px] text-fg-muted/30 tracking-widest uppercase">
          第三自习室出品
        </p>
      </div>
    );
  }

  // ── Success Screen (email confirmation) ─────────────────────────
  return (
    <div className="flex w-full max-w-[360px] flex-col items-center gap-6 text-center">
      <div className="size-20 rounded-3xl bg-green-50 flex items-center justify-center">
        <Sparkles className="size-10 text-green-500" />
      </div>
      <div>
        <h2 className="text-[22px] font-serif font-medium">注册成功</h2>
        <p className="text-[14px] text-fg-muted/60 mt-2 leading-relaxed">
          请查看你的邮箱确认链接。<br />
          确认后即可开始使用 Mango Learning OS。
        </p>
      </div>
      <Link
        href="/login"
        className="text-primary text-[14px] font-medium hover:underline underline-offset-2"
      >
        前往登录 →
      </Link>
    </div>
  );
}

// ── Social Login Button ────────────────────────────────────────

const SOCIAL_INFO: Record<string, { icon: string; color: string }> = {
  google: { icon: "G", color: "hover:bg-red-50 hover:border-red-200" },
  github: { icon: "GH", color: "hover:bg-gray-50 hover:border-gray-300" },
  qq: { icon: "QQ", color: "hover:bg-blue-50 hover:border-blue-200" },
};

function SocialButton({ provider, label, onClick }: { provider: string; label: string; onClick: () => void }) {
  const info = SOCIAL_INFO[provider] ?? { icon: "?", color: "" };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-[11px] font-medium text-fg-muted transition-all ${info.color}`}
    >
      <span className="font-bold text-[13px]">{info.icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
