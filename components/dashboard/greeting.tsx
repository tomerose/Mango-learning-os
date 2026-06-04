"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

function useClientDate() {
  const [label, setLabel] = React.useState("");
  React.useEffect(() => {
    setLabel(new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" }));
  }, []);
  return label;
}

function useGreeting() {
  const [g, setG] = React.useState("");
  React.useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "早上好" : h < 18 ? "下午好" : "晚上好");
  }, []);
  return g;
}

export function DashboardGreeting() {
  const { tasks, hydrated } = useStore();
  const today = useClientDate();
  const greeting = useGreeting();
  const pending = tasks.filter(t => !t.done).length;

  return (
    <header className="flex flex-col gap-1.5 pt-2 pb-4" suppressHydrationWarning>
      <p className="caption">{today}</p>
      <h1 className="heading-xl">
        {greeting}<span className="text-muted-foreground/20 mx-1.5">·</span>学习者
      </h1>
      {hydrated && (
        <p className="body-text text-muted-foreground/60 font-medium">
          {pending > 0
            ? `今天还有 ${pending} 项任务。专注，是最快的捷径。`
            : "今天的任务已全部完成。保持节奏。"}
        </p>
      )}
    </header>
  );
}
