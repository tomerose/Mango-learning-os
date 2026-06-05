"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItemsV2 } from "@/lib/navigation-v2";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarV2() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/40 bg-bg-subtle transition-all duration-300 ease-out",
      collapsed ? "w-[68px]" : "w-[240px]",
    )}>
      {/* Brand */}
      <div className={cn("flex h-14 items-center border-b border-border/40 px-3", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/hub" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-on text-sm font-bold">M</span>
          {!collapsed && <span className="text-sm font-semibold tracking-tight">Mango</span>}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="size-7 flex items-center justify-center rounded-lg hover:bg-bg-muted transition-colors">
            <ChevronLeft className="size-3.5 text-fg-subtle" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItemsV2.map((item) => {
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
      </nav>
    </aside>
  );
}
