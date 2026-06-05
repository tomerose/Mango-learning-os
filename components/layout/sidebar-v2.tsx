"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItemsV2 } from "@/lib/navigation-v2";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─────────────────────────────────────────────────────────────
   Sidebar v4 — Premium restrained rail
   Collapsed: 68px icon rail with tooltips
   Expanded: 260px with brand + nav + subtle footer
   ───────────────────────────────────────────────────────────── */

export function SidebarV2() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[260px]",
      )}
    >
      {/* ── Brand ── */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/hub"
          className={cn(
            "flex items-center gap-2.5 font-semibold tracking-tight",
            collapsed && "justify-center",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" />
            </svg>
          </span>
          {!collapsed && (
            <span className="text-[15px] font-bold">Mango OS</span>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-7 rounded-lg hover:bg-sidebar-accent transition-all",
            collapsed && "hidden",
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItemsV2.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const link = (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive && "text-primary",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={200}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="text-xs font-medium ml-1"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      {/* ── Footer (expanded only) ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-sidebar-border p-3"
          >
            <div className="rounded-xl bg-sidebar-accent/40 p-3">
              <p className="text-[11px] font-semibold text-sidebar-foreground/60">
                第三自习室
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                和你一起成长的 AI 学习伴侣
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
