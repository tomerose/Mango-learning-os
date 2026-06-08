"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mobileNavItemsV2, moreNavItems } from "@/lib/navigation-v2";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

export function MobileNavV2() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [showAdmin, setShowAdmin] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      setShowAdmin(isAdmin((data.session.user as any)?.plan, data.session.user.email));
    }).catch(() => {});
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 rounded-[26px] border border-white/12 bg-zinc-950/78 px-1.5 py-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          {mobileNavItemsV2.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.id} href={item.href}
                className={cn(
                  "relative flex min-h-12 min-w-[58px] flex-col items-center justify-center gap-0.5 rounded-[20px] px-2.5 py-1.5 text-[10px] font-semibold tracking-normal transition-colors duration-150",
                  isActive ? "text-amber-100" : "text-white/65",
                )}>
                {isActive && (
                  <motion.div layoutId="mobile-active" className="absolute inset-0 rounded-[20px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                )}
                <motion.div whileTap={{ scale: 0.85 }} className="relative z-10">
                  <item.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                </motion.div>
                <span className="relative z-10">{item.shortLabel}</span>
              </Link>
            );
          })}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button whileTap={{ scale: 0.85 }}
                className="flex min-h-12 min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-[20px] px-2.5 py-1.5 text-[10px] font-semibold text-white/65">
                <MoreHorizontal className="size-5" />
                <span>更多</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="premium-sheet max-h-[70vh] overflow-y-auto rounded-t-[28px] pb-safe">
              <SheetHeader><SheetTitle className="text-fg">更多模块</SheetTitle></SheetHeader>
              <div className="flex flex-col gap-1 mt-4 mb-4">
                {/* Secondary items */}
                {moreNavItems.filter(n => n.tier === "secondary").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive ? "bg-primary/15 text-primary" : "text-fg hover:bg-bg-muted")}>
                      <item.icon className="size-5" />
                      <div className="flex-1">{item.label}</div>
                      <span className="text-[11px] text-fg-muted/90">{item.description}</span>
                    </Link>
                  );
                })}
                {/* Divider */}
                <div className="my-2 border-t border-border/50" />
                <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-muted/90">内测功能</p>
                {/* Beta items */}
                {moreNavItems.filter(n => n.tier === "beta").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                        isActive ? "bg-bg-muted text-fg" : "text-fg-muted/90 hover:bg-bg-muted")}>
                      <item.icon className="size-5" />
                      <div className="flex-1">{item.label}</div>
                      <Badge variant="secondary" className="text-[9px]">内测</Badge>
                    </Link>
                  );
                })}

                {/* Admin — only visible to admin users */}
                {showAdmin && (
                  <>
                    <div className="my-1 border-t border-amber-200/30" />
                    <Link href="/admin" onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                        pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700" : "text-amber-600/80 hover:bg-amber-50/50")}>
                      <Shield className="size-5" />
                      <div className="flex-1">Admin Console</div>
                      <Badge className="text-[9px] bg-amber-100 text-amber-700">Admin</Badge>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
