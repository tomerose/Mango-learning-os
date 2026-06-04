"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const isLogin = mode === "login";

  // Opt into guest mode via a server-side API route that sets the cookie
  // and redirects to /dashboard.  Using a full-page navigation (not
  // router.push) guarantees the browser sends the cookie on the redirected
  // request, so the middleware can wave the visitor through.
  function continueAsGuest() {
    window.location.href = "/api/guest";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || loading) return;
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
        // If email confirmation is on, there's no active session yet.
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setNotice("注册成功，请查收邮箱确认邮件后登录。");
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
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
          <GraduationCap className="text-primary size-6" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">
          {isLogin ? "登录 Mango Learning OS" : "注册 Mango Learning OS"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isLogin ? "欢迎回来，继续你的学习" : "开始你的学习旅程"}
        </p>
      </div>

      {!configured && (
        <div className="bg-warning/10 text-warning-foreground flex items-start gap-2 rounded-lg border border-warning/30 p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="text-foreground/80">
            <p className="font-medium">尚未配置 Supabase</p>
            <p className="mt-0.5 text-xs">
              当前为游客模式，可直接使用应用（数据存于本地）。配置 .env.local
              中的 Supabase 凭证后即可启用账号登录与云端同步。
            </p>
          </div>
        </div>
      )}

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

        <Button type="submit" disabled={!configured || loading} className="w-full">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isLogin ? (
            "登录"
          ) : (
            "注册"
          )}
        </Button>
      </form>

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
        <button
          type="button"
          onClick={continueAsGuest}
          className="text-muted-foreground text-xs hover:underline"
        >
          以游客身份继续 →
        </button>
      </div>
    </div>
  );
}
