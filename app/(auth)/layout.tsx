export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="surface-card p-6 w-full max-w-sm">
        {children}
      </div>
      <div className="mt-8 flex flex-col items-center gap-0.5">
        <span className="caption">第三自习室出品</span>
        <span className="text-[11px] text-muted-foreground/60 italic tracking-wide">把焦虑变成准备</span>
      </div>
    </div>
  );
}
