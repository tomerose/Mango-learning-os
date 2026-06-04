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
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-background/95 backdrop-blur md:hidden"
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
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-5 transition-colors",
                active ? "text-primary" : ""
              )}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
