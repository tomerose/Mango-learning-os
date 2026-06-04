"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

/** Safe client-only date formatting — avoids hydration mismatch from
 *  server/client timezone differences and locale inconsistencies. */
function useClientDate() {
  const [label, setLabel] = React.useState("—");
  React.useEffect(() => {
    setLabel(
      new Date().toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    );
  }, []);
  return label;
}

function useGreeting() {
  const [greeting, setGreeting] = React.useState("—");
  React.useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好");
  }, []);
  return greeting;
}

export function DashboardGreeting() {
  const { tasks, hydrated } = useStore();
  const today = useClientDate();
  const greeting = useGreeting();

  const pending = tasks.filter((t) => !t.done).length;

  const motd = pending > 0
    ? `今天有 ${pending} 项任务待完成，先从最高优先级开始。专注，是最快的捷径。`
    : "今天的任务已全部完成！继续保持这份节奏。";

  return (
    <header className="flex flex-col gap-0.5 pt-1 pb-2" suppressHydrationWarning>
      <p className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wide">{today}</p>
      <h1 className="text-[1.5rem] md:text-2xl font-bold tracking-tight leading-tight">
        {greeting}，学习者<span className="ml-2">👋</span>
      </h1>
      <p className="text-muted-foreground/80 text-[13px] leading-relaxed mt-1 font-medium">
        {hydrated ? motd : "正在加载…"}
      </p>
    </header>
  );
}
