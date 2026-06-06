"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mobileNavItemsV2, moreNavItems } from "@/lib/navigation-v2";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function MobileNavV2() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-2 pointer-events-none">
        <div className="flex items-center gap-0.5 rounded-2xl border border-border/40 bg-bg/85 backdrop-blur-xl px-1.5 py-1.5 shadow-lg shadow-black/5 pointer-events-auto">
          {mobileNavItemsV2.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.id} href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium transition-colors duration-150",
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
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium text-fg-muted">
                <MoreHorizontal className="size-5" />
                <span>更多</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-safe max-h-[60vh] overflow-y-auto">
              <SheetHeader><SheetTitle>更多模块</SheetTitle></SheetHeader>
              <div className="flex flex-col gap-1 mt-4 mb-4">
                {/* Secondary items */}
                {moreNavItems.filter(n => n.tier === "secondary").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive ? "bg-primary-subtle text-primary" : "hover:bg-bg-muted")}>
                      <item.icon className="size-5" />
                      <div className="flex-1">{item.label}</div>
                      <span className="text-xs text-fg-muted/50">{item.description}</span>
                    </Link>
                  );
                })}
                {/* Divider */}
                <div className="my-2 border-t border-border/30" />
                <p className="text-[10px] text-fg-muted/50 px-4 uppercase tracking-wide font-medium">内测 / 即将上线</p>
                {/* Beta items */}
                {moreNavItems.filter(n => n.tier === "beta").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors opacity-60",
                        isActive ? "bg-bg-muted" : "hover:bg-bg-muted")}>
                      <item.icon className="size-5" />
                      <div className="flex-1">{item.label}</div>
                      <Badge variant="secondary" className="text-[9px]">内测</Badge>
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
