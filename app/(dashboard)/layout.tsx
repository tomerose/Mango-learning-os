import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { StoreProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="bg-background flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop top bar */}
          <header className="bg-background/80 sticky top-0 z-10 hidden h-16 items-center justify-end gap-2 border-b px-6 backdrop-blur md:flex">
            <ThemeToggle />
            <UserMenu />
          </header>
          <main className="flex-1 px-4 py-4 pb-20 md:px-8 md:py-8 md:pb-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        {/* Mobile bottom tab bar — app-style navigation */}
        <MobileNav />
      </div>
    </StoreProvider>
  );
}
