"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItemsV2 } from "@/lib/navigation-v2";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

export function SidebarV2() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [showAdmin, setShowAdmin] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const u = data.session.user;
      setShowAdmin(isAdmin((u as any)?.plan, u.email));
    }).catch(() => {});
  }, []);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/40 bg-bg-subtle transition-all duration-300 ease-out",
      collapsed ? "w-[68px]" : "w-[240px]",
    )}>
      {/* Brand */}
      <div className={cn("flex h-14 items-center border-b border-border/40 px-3", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/hub" className="flex items-center gap-2.5">
          <img src="/favicon-32.png" alt="Mango" className="size-8 rounded-lg" />
          {!collapsed && <span className="text-sm font-semibold tracking-tight">Mango</span>}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="size-7 flex items-center justify-center rounded-lg hover:bg-bg-muted transition-colors">
            <ChevronLeft className="size-3.5 text-fg-subtle" />
          </button>
        )}
      </div>

      {/* Nav — primary items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItemsV2.filter(n => n.tier === "primary").map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link key={item.id} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive ? "bg-primary-subtle text-primary" : "text-fg-muted hover:bg-bg-muted hover:text-fg",
                collapsed && "justify-center px-2",
              )}>
              <item.icon className={cn("size-5 shrink-0", isActive && "text-primary")} strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          if (collapsed) {
            return <Tooltip key={item.id} delayDuration={200}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right" className="text-xs">{item.label}</TooltipContent></Tooltip>;
          }
          return link;
        })}

        {/* Divider */}
        {!collapsed && <div className="my-2 border-t border-border/30" />}

        {/* Secondary items */}
        {navItemsV2.filter(n => n.tier === "secondary").map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link key={item.id} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive ? "bg-bg-muted text-fg" : "text-fg-muted/70 hover:bg-bg-muted hover:text-fg",
                collapsed && "justify-center px-2",
              )}>
              <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          if (collapsed) {
            return <Tooltip key={item.id} delayDuration={200}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right" className="text-xs">{item.label}</TooltipContent></Tooltip>;
          }
          return link;
        })}

        {/* Divider + Beta label */}
        {!collapsed && <div className="my-2 border-t border-border/30" />}
        {!collapsed && <p className="text-[9px] text-fg-subtle/90 px-3 pb-1 uppercase tracking-widest font-medium">内测</p>}

        {/* Beta items */}
        {navItemsV2.filter(n => n.tier === "beta").map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link key={item.id} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 opacity-50 hover:opacity-80",
                isActive ? "bg-bg-muted text-fg" : "text-fg-muted/80 hover:bg-bg-muted hover:text-fg",
                collapsed && "justify-center px-2",
              )}>
              <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="flex items-center gap-2">{item.label}<Badge variant="secondary" className="text-[9px] px-1 py-0">内测</Badge></span>}
            </Link>
          );
          if (collapsed) {
            return <Tooltip key={item.id} delayDuration={200}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right" className="text-xs">{item.label} · 内测</TooltipContent></Tooltip>;
          }
          return link;
        })}

        {/* Admin — only visible to admin users */}
        {showAdmin && (
          <>
            {!collapsed && <div className="my-2 border-t border-amber-200/40" />}
            {!collapsed && <p className="text-[9px] text-amber-600/70 px-3 pb-1 uppercase tracking-widest font-medium">Admin</p>}
            {(() => {
              const isActive = pathname === "/admin" || pathname.startsWith("/admin/");
              const link = (
                <Link key="admin" href="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive ? "bg-amber-50 text-amber-700" : "text-amber-600/70 hover:bg-amber-50/50 hover:text-amber-700",
                    collapsed && "justify-center px-2",
                  )}>
                  <Shield className="size-5 shrink-0" strokeWidth={1.5} />
                  {!collapsed && <span>Admin</span>}
                </Link>
              );
              if (collapsed) {
                return <Tooltip key="admin" delayDuration={200}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right" className="text-xs">Admin Console</TooltipContent></Tooltip>;
              }
              return link;
            })()}
          </>
        )}
      </nav>
    </aside>
  );
}
