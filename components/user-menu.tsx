"use client";

import * as React from "react";
import { LogOut, User as UserIcon, LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Reads real auth state when Supabase is configured; otherwise renders a
// guest avatar. The signout posts to /auth/signout (server route) so the
// session cookie is cleared server-side.
export function UserMenu() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!configured) return;

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const user = data.user;
        if (user) {
          setEmail(user.email ?? null);
          setDisplayName(
            (user.user_metadata?.display_name as string | undefined) ?? null
          );
        }
      });
    } catch (err) {
      console.error("[UserMenu] Failed to init Supabase:", err);
    }
  }, [configured]);

  const initial = displayName?.[0] ?? email?.[0]?.toUpperCase() ?? "林";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="用户菜单"
          className="focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-[3px]"
        >
          <Avatar className="size-8">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {displayName ?? (email ? "学习者" : "游客模式")}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {email ?? (configured ? "未登录" : "数据存于本地")}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {email ? (
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full">
              <DropdownMenuItem variant="destructive" asChild>
                <span className="flex w-full cursor-default items-center gap-2">
                  <LogOut className="size-4" /> 退出登录
                </span>
              </DropdownMenuItem>
            </button>
          </form>
        ) : (
          <DropdownMenuItem asChild>
            <a href="/login" className="flex items-center gap-2">
              {configured ? (
                <>
                  <LogIn className="size-4" /> 登录
                </>
              ) : (
                <>
                  <UserIcon className="size-4" /> 登录 / 注册
                </>
              )}
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
