"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

export function DashboardGreeting() {
  const { tasks, hydrated } = useStore();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  const pending = tasks.filter((t) => !t.done).length;

  // Derive today's date string
  const today = now.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const motd = pending > 0
    ? `今天有 ${pending} 项任务待完成，先从最高优先级开始。专注，是最快的捷径。`
    : "今天的任务已全部完成！继续保持这份节奏。";

  return (
    <header className="flex flex-col gap-1">
      <p className="text-muted-foreground text-sm">{today}</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting}，学习者 👋
      </h1>
      <p className="text-muted-foreground text-sm">
        {hydrated ? motd : "正在加载…"}
      </p>
    </header>
  );
}
