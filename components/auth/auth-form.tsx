"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Loader2, AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleCaptcha } from "@/components/auth/captcha";

const LOGIN_CODE = "tokentome222";    // 登录/注册邀请码
const GUEST_CODE = "sillyfind2025";  // 游客入口 + 首次进入邀请码

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [inviteCode, setInviteCode] = React.useState("");
  const [codeVerified, setCodeVerified] = React.useState(false);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [captchaOk, setCaptchaOk] = React.useState(false);

  const isLogin = mode === "login";

  function verifyCode(code: string) {
    setInviteCode(code);
    // 登录/注册只能用 LOGIN_CODE，游客只能用 GUEST_CODE
    const requiredCode = isLogin ? LOGIN_CODE : GUEST_CODE;
    if (code.trim() === requiredCode) {
      setCodeVerified(true);
      setCodeError(null);
    } else if (code.trim().length >= requiredCode.length) {
      setCodeError("邀请码不正确，请检查后重试");
      setCodeVerified(false);
    } else {
      setCodeVerified(false);
      setCodeError(null);
    }
  }

  function continueAsGuest() {
    if (!codeVerified) {
      setCodeError("请先输入正确的邀请码");
      return;
    }
    window.location.href = "/api/guest";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || loading || !codeVerified) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        document.cookie = "mango_visited=1;path=/;max-age=" + 60*60*24*365;
        const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || "Learner" } },
        });
        if (error) throw error;
        if (data.session) {
          document.cookie = "mango_visited=1;path=/;max-age=" + 60*60*24*365;
          router.push("/dashboard");
          router.refresh();
        } else {
          setNotice("注册成功，欢迎加入 Mango Learning OS。");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <img
          src="/apple-touch-icon.png"
          alt="Mango Learning OS"
          className="size-16 rounded-2xl shadow-md"
        />
        <h1 className="text-xl font-semibold tracking-tight">
          {isLogin ? "登录 Mango Learning OS" : "注册 Mango Learning OS"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isLogin ? "欢迎回来，继续你的学习" : "开始你的学习旅程"}
        </p>
      </div>

      {/* Invite code gate */}
      {!codeVerified ? (
        <div className="flex flex-col gap-3">
          {!configured && (
            <div className="bg-warning/10 text-warning-foreground flex items-start gap-2 rounded-lg border border-warning/30 p-3 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
              <div className="text-foreground/80">
                <p className="font-medium">尚未配置 Supabase</p>
                <p className="mt-0.5 text-xs">当前为游客模式，可直接使用应用（数据存于本地）。</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="inviteCode">邀请码</Label>
            <div className="relative">
              <Key className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => verifyCode(e.target.value)}
                placeholder="输入邀请码以继续"
                className="pl-9"
                autoFocus
                autoComplete="off"
              />
            </div>
            {codeError && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {codeError}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-muted-foreground text-xs hover:underline text-center"
          >
            以游客身份继续 →
          </button>
        </div>
      ) : (
        <>
          {!configured && (
            <div className="bg-warning/10 text-warning-foreground flex items-start gap-2 rounded-lg border border-warning/30 p-3 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
              <div className="text-foreground/80">
                <p className="font-medium">尚未配置 Supabase</p>
                <p className="mt-0.5 text-xs">当前为游客模式，可直接使用应用（数据存于本地）。</p>
              </div>
            </div>
          )}

          <div className="bg-primary/5 border-primary/20 rounded-lg border px-3 py-2 text-center">
            <p className="text-primary text-xs font-medium inline-flex items-center gap-1">
              <Key className="size-3" /> 邀请码验证通过
            </p>
          </div>

          {/* Guest entry — even after code verification */}
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-muted-foreground text-xs hover:underline text-center -mt-1 mb-1"
          >
            以游客身份继续 →
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground">或登录</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">昵称</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="你的名字"
                  disabled={!configured || loading}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={!configured || loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                minLength={6}
                required
                disabled={!configured || loading}
              />
            </div>

            {!isLogin && (
              <SimpleCaptcha onVerify={setCaptchaOk} />
            )}

            {error && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}
            {notice && (
              <div className="text-success flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {notice}
              </div>
            )}

            <Button type="submit" disabled={!configured || loading || (!isLogin && !captchaOk)} className="w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : isLogin ? "登录" : "注册"}
            </Button>
          </form>
        </>
      )}

      <div className="flex flex-col items-center gap-3 text-sm">
        <p className="text-muted-foreground">
          {isLogin ? "还没有账号？" : "已有账号？"}{" "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "注册" : "登录"}
          </Link>
        </p>
      </div>
    </div>
  );
}
