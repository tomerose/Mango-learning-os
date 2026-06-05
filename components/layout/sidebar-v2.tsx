"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItemsV2 } from "@/lib/navigation-v2";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────────────────────
// MangoLearningOS Sidebar — collapsible rail
// Collapsed state: 72px icon-only rail
// ─────────────────────────────────────────────────────────────

export function SidebarV2() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/hub" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <img src="/favicon-32.png" alt="Mango" className="size-8 rounded-lg" />
            <span className="font-bold">Mango OS</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/hub" className="flex size-10 items-center justify-center">
            <img src="/favicon-32.png" alt="Mango" className="size-8 rounded-lg" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </Button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItemsV2.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("size-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      {/* Footer — 关于我们 */}
      {!collapsed && (
        <div className="border-t p-3 space-y-2">
          <div className="rounded-xl bg-muted/50 p-2.5">
            <p className="text-[11px] font-medium">关于我们</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              第三自习室 · 和你一起成长的 AI 学习伴侣
            </p>
            <div className="mt-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">📧 tokentome222</p>
              <p className="text-[10px] text-muted-foreground">📧 sillyfind2025</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
