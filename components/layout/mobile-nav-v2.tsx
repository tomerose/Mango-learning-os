"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mobileNavItemsV2, navItemsV2 } from "@/lib/navigation-v2";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNavV2() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3">
        <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-bg/80 backdrop-blur-xl px-2 py-1.5 shadow-lg">
          {mobileNavItemsV2.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.id} href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors duration-150",
                  isActive ? "text-primary" : "text-fg-muted",
                )}>
                {isActive && (
                  <motion.div layoutId="mobile-active" className="absolute -top-0.5 h-0.5 w-5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                )}
                <motion.div whileTap={{ scale: 0.85 }}>
                  <item.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                </motion.div>
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-fg-muted">
                <MoreHorizontal className="size-5" />
                <span>More</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
              <SheetHeader><SheetTitle>All modules</SheetTitle></SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-5 mb-4">
                {navItemsV2.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive ? "bg-primary-subtle text-primary" : "hover:bg-bg-muted")}>
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
