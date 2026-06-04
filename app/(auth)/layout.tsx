export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {children}
      <div className="mt-10 flex flex-col items-center gap-0.5">
        <span className="text-[11px] font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
          第三自习室出品
        </span>
        <span className="text-[11px] italic tracking-wide text-zinc-400/80 dark:text-zinc-500/80">
          把焦虑变成准备
        </span>
      </div>
    </div>
  );
}
