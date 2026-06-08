"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";
import {
  Shield, Users, Key, FileText, FlaskConical, Library,
  ArrowRight, Loader2, AlertTriangle,
} from "lucide-react";

const CARDS = [
  {
    href: "/admin/codes",
    icon: Key,
    title: "Mango Code / Invite Code",
    desc: "生成、管理、停用 Pro 兑换码与内测邀请码。",
    ready: true,
  },
  {
    href: null,
    icon: Users,
    title: "User & Role Management",
    desc: "查看用户列表、角色分配、Plan 变更。",
    ready: false,
    todo: "TODO: 接入 Supabase profiles 管理界面",
  },
  {
    href: null,
    icon: Shield,
    title: "Pro Access Control",
    desc: "管理 Pro 权益开关、功能门禁、配额配置。",
    ready: false,
    todo: "TODO: 接入 PlanGate 配置面板",
  },
  {
    href: null,
    icon: FileText,
    title: "Agent Output Review",
    desc: "抽查 Agent 生成质量、来源准确性、内容深度。",
    ready: false,
    todo: "TODO: 接入 Agent 输出审查面板",
  },
  {
    href: null,
    icon: FlaskConical,
    title: "Research Quality Center",
    desc: "监控 Research Pipeline 成功率、来源评分趋势。",
    ready: false,
    todo: "TODO: 接入 Research Pipeline 统计面板",
  },
  {
    href: null,
    icon: Library,
    title: "Library & Export History",
    desc: "查看全站 Artifact 生成量、导出统计、热门任务。",
    ready: false,
    todo: "TODO: 接入 Library 统计 API",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);
  const [admin, setAdmin] = React.useState(false);
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const u = data.session.user;
      const plan = (u as any)?.plan;
      const e = u.email || "";
      setEmail(e);
      if (!isAdmin(plan, e)) { router.push("/hub"); return; }
      setAdmin(true);
      setChecking(false);
    }).catch(() => { router.push("/hub"); });
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-6 animate-spin text-fg-muted/90" />
      </div>
    );
  }

  if (!admin) return null; // Will redirect

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <header>
        <h1 className="text-display font-serif">Mango Admin Console</h1>
        <p className="text-sm text-fg-muted/90 mt-1">
          Experimental control layer for MangoOS.
        </p>
        <p className="text-[11px] text-fg-subtle/90 mt-1 font-mono">
          {email}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className={`card-card p-5 flex flex-col gap-3 transition-all ${
              card.ready
                ? "hover:shadow-md cursor-pointer group"
                : "opacity-70"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
                <card.icon className="size-5" />
              </span>
              {card.ready ? (
                <Link
                  href={card.href!}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                  进入 <ArrowRight className="size-3" />
                </Link>
              ) : (
                <span className="text-[10px] rounded-full bg-amber-50 text-amber-600 px-2 py-0.5 font-medium">
                  规划中
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold">{card.title}</h3>
              <p className="text-xs text-fg-muted/90 mt-1 leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* TODO comment — invisible in production but clear in source */}
            {!card.ready && card.todo && (
              <p className="text-[9px] text-fg-subtle/90 italic font-mono">
                // {card.todo}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
