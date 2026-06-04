"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, GraduationCap, BookOpen, CalendarCheck, Dna } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "首页" },
  { href: "/ai-tutor", icon: Bot, label: "AI导师" },
  { href: "/exam-mode", icon: GraduationCap, label: "考试" },
  { href: "/knowledge-hub", icon: BookOpen, label: "知识库" },
  { href: "/study-planner", icon: CalendarCheck, label: "计划" },
  { href: "/mango-dna", icon: Dna, label: "DNA" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <nav className="surface-glass px-1.5 py-1.5 flex">
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
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-300",
                active
                  ? "text-primary scale-[1.02]"
                  : "text-muted-foreground/50 hover:text-muted-foreground/80"
              )}
            >
              <Icon
                className={cn("size-[22px] transition-all duration-300", active ? "opacity-100" : "opacity-40")}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className={cn("tracking-tight", active ? "font-semibold" : "font-normal")}>{tab.label}</span>
              {active && (
                <span className="absolute -bottom-[3px] w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
