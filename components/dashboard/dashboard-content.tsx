"use client";

import * as React from "react";

export function DashboardContent() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">加载中...</p>
          <h1 className="text-2xl font-semibold tracking-tight">欢迎</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">游客模式</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          欢迎使用 Mango Learning OS 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          系统正常运行中。所有功能已启用。
        </p>
      </header>

      <div className="bg-card rounded-xl border p-6">
        <p className="text-sm">✅ Dashboard 加载成功</p>
        <p className="text-sm text-muted-foreground mt-2">
          如果你看到这条消息，说明基础架构正常。
        </p>
      </div>
    </div>
  );
}
