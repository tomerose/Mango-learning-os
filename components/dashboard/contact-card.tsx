"use client";

import { Mail, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ContactCard() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="surface-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Sparkles className="size-4 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">联系我们</p>
          <p className="text-muted-foreground/50 text-[11px]">Contact Us</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Email */}
        <button
          onClick={() => copy("1211000567@qq.com", "邮箱")}
          className="flex items-center gap-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors px-4 py-3 text-left group"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Mail className="size-4 text-primary" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">邮箱</p>
            <p className="text-muted-foreground/60 text-[12px] truncate">1211000567@qq.com</p>
          </div>
          <span className={cn(
            "text-[11px] font-medium shrink-0 transition-colors",
            copied === "邮箱" ? "text-success" : "text-muted-foreground/40"
          )}>
            {copied === "邮箱" ? "已复制" : "点击复制"}
          </span>
        </button>

        {/* WeChat 1 */}
        <button
          onClick={() => copy("tokentome222", "微信 1")}
          className="flex items-center gap-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors px-4 py-3 text-left group"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/15 transition-colors">
            <MessageCircle className="size-4 text-emerald-500" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">微信</p>
            <p className="text-muted-foreground/60 text-[12px] truncate">tokentome222</p>
          </div>
          <span className={cn(
            "text-[11px] font-medium shrink-0 transition-colors",
            copied === "微信 1" ? "text-success" : "text-muted-foreground/40"
          )}>
            {copied === "微信 1" ? "已复制" : "点击复制"}
          </span>
        </button>

        {/* WeChat 2 */}
        <button
          onClick={() => copy("sillyfind2025", "微信 2")}
          className="flex items-center gap-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors px-4 py-3 text-left group"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/15 transition-colors">
            <MessageCircle className="size-4 text-amber-500" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">微信</p>
            <p className="text-muted-foreground/60 text-[12px] truncate">sillyfind2025</p>
          </div>
          <span className={cn(
            "text-[11px] font-medium shrink-0 transition-colors",
            copied === "微信 2" ? "text-success" : "text-muted-foreground/40"
          )}>
            {copied === "微信 2" ? "已复制" : "点击复制"}
          </span>
        </button>
      </div>

      {/* Tagline */}
      <div className="text-center pt-1">
        <p className="text-muted-foreground/40 text-[11px] font-medium tracking-wide">
          期待我们一起成长，陪伴同行
        </p>
      </div>
    </div>
  );
}
