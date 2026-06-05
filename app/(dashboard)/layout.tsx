import { SidebarV2 } from "@/components/layout/sidebar-v2";
import { MobileNavV2 } from "@/components/layout/mobile-nav-v2";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { StoreProvider } from "@/lib/store";
import { SubjectProvider } from "@/lib/subjects";
import { UpdateModal } from "@/components/update-modal";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubjectProvider>
    <StoreProvider>
      <TooltipProvider delayDuration={300}>
      <UpdateModal />

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex min-h-screen bg-bg">
        <SidebarV2 />
        <div className="flex min-w-0 flex-1 flex-col ml-[68px] lg:ml-[240px] transition-all duration-300 ease-out">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b border-border/40 bg-bg/80 backdrop-blur-xl px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex md:hidden min-h-screen flex-col bg-bg">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between px-4 mx-3 mt-3 rounded-full border border-border/30 bg-bg/75 backdrop-blur-xl">
          <span className="text-sm font-semibold tracking-tight">Mango</span>
          <div className="flex items-center gap-0">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          {children}
        </main>
        <MobileNavV2 />
      </div>

      </TooltipProvider>
    </StoreProvider>
    </SubjectProvider>
  );
}
