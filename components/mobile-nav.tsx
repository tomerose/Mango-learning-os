"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Dna,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "首页" },
  { href: "/ai-tutor?tab=chat", icon: Bot, label: "AI导师" },
  { href: "/exam-mode", icon: GraduationCap, label: "考试" },
  { href: "/knowledge-hub", icon: BookOpen, label: "知识库" },
  { href: "/study-planner", icon: CalendarCheck, label: "计划" },
  { href: "/mango-dna", icon: Dna, label: "DNA" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/20 dark:border-white/5 md:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      {TABS.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(tab.href.split("?")[0]));
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-all duration-300",
              active
                ? "text-primary scale-105"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-[22px] transition-all duration-300",
                active ? "text-primary" : "opacity-60"
              )}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <span className="tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
