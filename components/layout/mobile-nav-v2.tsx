"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mobileNavItemsV2, navItemsV2 } from "@/lib/navigation-v2";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/* ─────────────────────────────────────────────────────────────
   Mobile Nav v4 — Spring-physics tab bar + Bottom Sheet
   ───────────────────────────────────────────────────────────── */

export function MobileNavV2() {
  const pathname = usePathname();

  return (
    <>
      <nav className="mobile-nav-pill fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3">
        <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-background/75 backdrop-blur-xl px-2 py-1.5 shadow-lg shadow-black/5 dark:shadow-black/30">
          {mobileNavItemsV2.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-0.5 h-0.5 w-5 rounded-full bg-primary"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <item.icon
                    className={cn(
                      "size-5 transition-all",
                      isActive && "stroke-[2.5]",
                    )}
                  />
                </motion.div>
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}

          {/* More drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <MoreHorizontal className="size-5" />
                <span>更多</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
              <SheetHeader>
                <SheetTitle className="text-base">所有功能</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-5 mb-4">
                {navItemsV2.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-5",
                          isActive && "text-primary stroke-[2.5]",
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
