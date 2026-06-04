"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-sidebar-primary" : ""
              )}
            />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar — sticky; body padding handles safe-area-inset-top */}
      <div className="bg-sidebar/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="text-sidebar-primary size-5" />
          <span>Mango Learning OS</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="touch-target-44"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer — full-height side panel below the top bar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div
            className="bg-background/60 absolute inset-0 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="bg-sidebar absolute top-14 left-0 w-64 border-r shadow-xl overflow-y-auto"
            style={{
              height: "calc(100dvh - 3.5rem)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="py-4">{nav}</div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r md:flex">
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-2 px-6 font-semibold"
        >
          <GraduationCap className="text-sidebar-primary size-6" />
          <span className="text-base">Mango Learning OS</span>
        </Link>
        <div className="flex-1 overflow-y-auto py-2">{nav}</div>
        <div className="flex flex-col gap-0.5 px-6 py-4">
          <span className="text-[11px] font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
            第三自习室出品
          </span>
          <span className="text-[11px] italic tracking-wide text-zinc-400/80 dark:text-zinc-500/80">
            把焦虑变成准备
          </span>
        </div>
      </aside>
    </>
  );
}
