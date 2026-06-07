import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-bg">
      {/* Ambient watercolor orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full watercolor-amber opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full watercolor-sage opacity-40" />
      </div>

      {/* Back to home */}
      <Link href="/hub"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-fg-muted/60 hover:text-fg-muted transition-colors">
        ← 返回首页
      </Link>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[360px]">
        {children}
      </div>
    </div>
  );
}
