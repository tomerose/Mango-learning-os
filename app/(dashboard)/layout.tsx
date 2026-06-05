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
      {/* ── DESKTOP ──────────────────────────────────────── */}
      <div className="bg-background hidden md:flex min-h-screen">
        <SidebarV2 />
        <div className="flex min-w-0 flex-1 flex-col ml-[72px] lg:ml-[280px] transition-all duration-300">
          <header className="bg-background/80 sticky top-0 z-10 flex h-16 items-center justify-end gap-2 border-b px-6 backdrop-blur">
            <ThemeToggle /><UserMenu />
          </header>
          <main className="flex-1 px-6 py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────── */}
      <div className="bg-background flex md:hidden min-h-screen flex-col">
        <header className="surface-glass sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between px-4 mx-3 mt-3 rounded-full">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <GraduationCapSVG />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[13px] tracking-tight">第三自习室</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">把焦虑变成准备</span>
            </div>
          </div>
          <div className="flex items-center gap-0">
            <ThemeToggle /><UserMenu />
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

function GraduationCapSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
