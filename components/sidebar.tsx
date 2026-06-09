"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

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
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors",
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
      {/* Mobile top bar — sits above the bottom tab bar */}
      <div className="bg-sidebar/80 sticky top-0 z-30 flex h-12 items-center justify-between border-b px-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/apple-touch-icon.png" alt="" className="size-5 rounded-md" />
          <span className="text-sm font-semibold">Mango学</span>
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
            className="size-9 touch-target-44"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer — overlays above bottom nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div
            className="bg-background/60 absolute inset-0 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="bg-sidebar absolute top-12 left-0 w-64 border-r shadow-xl overflow-y-auto"
            style={{
              height: "calc(100dvh - 3rem)",
              paddingBottom: "env(safe-area-inset-bottom, 4rem)",
            }}
          >
            <div className="py-3">{nav}</div>
            <div className="border-t mx-3 pt-3">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              >
                <User className="size-[18px]" />
                个人中心
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r border-sidebar-border/50 md:flex">
        <Link
          href="/dashboard"
          className="flex h-14 items-center gap-2 px-5 font-semibold"
        >
          <img src="/apple-touch-icon.png" alt="" className="size-5 rounded-md" />
          <span className="text-base">Mango Learning OS</span>
        </Link>
        <div className="flex-1 overflow-y-auto py-2">{nav}</div>
        <div className="flex flex-col gap-0.5 px-5 py-4 border-t border-sidebar-border/30 mt-2">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-foreground/35">
            第三自习室出品
          </span>
          <span className="text-[11px] italic tracking-wide text-foreground/25">
            把焦虑变成准备
          </span>
        </div>
      </aside>
    </>
  );
}
