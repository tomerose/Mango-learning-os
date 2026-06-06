export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-bg">
      <span className="text-6xl mb-6">🥭</span>
      <h1 className="text-display font-serif mb-2">离线模式</h1>
      <p className="text-sm text-fg-muted/60 max-w-xs leading-relaxed">
        你当前没有网络连接。Mango 的核心页面已缓存，可以先查看已保存的内容。
      </p>
      <div className="flex gap-3 mt-6">
        <a href="/hub" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">今日</a>
        <a href="/notes" className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium">笔记</a>
      </div>
      <p className="text-[10px] text-fg-muted/30 mt-8">Mango Learning OS · 离线可用</p>
    </div>
  );
}
