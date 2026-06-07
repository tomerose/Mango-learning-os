import { SidebarV2 } from "@/components/layout/sidebar-v2";
import { MobileNavV2 } from "@/components/layout/mobile-nav-v2";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { StoreProvider } from "@/lib/store";
import { SubjectProvider } from "@/lib/subjects";
import { UpdateModal } from "@/components/update-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MangoboCompanion } from "@/components/mangobo/mangobo-companion";
import { PWAInstallPrompt } from "@/components/ui/pwa-install";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubjectProvider>
    <StoreProvider>
      <TooltipProvider delayDuration={300}>
      <UpdateModal />

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex min-h-screen bg-background">
        <SidebarV2 />
        <div className="flex min-w-0 flex-1 flex-col ml-[68px] lg:ml-[240px] transition-all duration-300 ease-out">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b border-border/30 bg-background/70 backdrop-blur-xl px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-1"><ThemeToggle /><UserMenu /></div>
          </header>
          <main className="flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex md:hidden min-h-screen flex-col bg-[#070604] text-white">
        <header className="sticky top-0 z-30 mx-3 mt-3 flex h-12 shrink-0 items-center justify-between rounded-full border border-white/10 bg-zinc-950/60 px-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <span className="text-small font-semibold tracking-normal text-white/70">MangoOS</span>
          <div className="flex items-center gap-0"><ThemeToggle /><UserMenu /></div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">{children}</main>
        <MobileNavV2 />
      </div>

      {/* Mangobo — Global AI Companion */}
      <MangoboCompanion />
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      </TooltipProvider>
    </StoreProvider>
    </SubjectProvider>
  );
}
