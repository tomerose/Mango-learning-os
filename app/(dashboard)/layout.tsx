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
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b bg-background/90 backdrop-blur px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm">
            <img src="/apple-touch-icon.png" alt="" className="size-5 rounded-md" />
            Mango学
          </Link>
          <div className="flex items-center gap-1">
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
