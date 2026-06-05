"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItemsV2, navItemsV2 } from "@/lib/navigation-v2";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// ─────────────────────────────────────────────────────────────
// V2.0 Mobile Bottom Nav — 5 主 tab + "更多"
// ─────────────────────────────────────────────────────────────

export function MobileNavV2() {
  const pathname = usePathname();

  return (
    <>
      <nav className="mobile-nav-pill fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3">
        <div className="flex items-center gap-1 rounded-2xl border bg-background/80 backdrop-blur-xl px-2 py-1.5 shadow-lg">
          {mobileNavItemsV2.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}

          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-all">
                <MoreHorizontal className="size-5" />
                <span>更多</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader><SheetTitle>所有功能</SheetTitle></SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {navItemsV2.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all", isActive ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                      <item.icon className="size-5" />{item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
