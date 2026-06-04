import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { StoreProvider } from "@/lib/store";
import { SubjectProvider } from "@/lib/subjects";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubjectProvider>
    <StoreProvider>
      {/* ── DESKTOP: sidebar + content ─────────────────────── */}
      <div className="bg-background hidden md:flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/80 sticky top-0 z-10 flex h-16 items-center justify-end gap-2 border-b px-6 backdrop-blur">
            <ThemeToggle />
            <UserMenu />
          </header>
          <main className="flex-1 px-8 py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>

      {/* ── MOBILE: app shell with header + content + bottom tabs ─── */}
      <div className="bg-background flex md:hidden min-h-screen flex-col">
        {/* Mobile top bar — frosted glass, Apple-style */}
        <header className="glass sticky top-0 z-30 flex h-11 shrink-0 items-center justify-between px-4 border-b border-white/20 dark:border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="" className="size-6 rounded-xl shadow-sm" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[13px] tracking-tight">第三自习室</span>
              <span className="text-[10px] text-muted-foreground font-medium">把焦虑变成准备</span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-3 pb-20 overflow-y-auto">
          {children}
        </main>
        <MobileNav />
      </div>
    </StoreProvider>
    </SubjectProvider>
  );
}
