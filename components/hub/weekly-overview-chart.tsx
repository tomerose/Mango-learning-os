"use client";

import * as React from "react";
import { BarChart2, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

const DAYS_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function generateSampleData() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return DAYS_CN.map((label, i) => {
    const isPastOrToday = i <= daysFromMonday || daysFromMonday === -1;
    const minutes = isPastOrToday ? Math.floor(Math.random() * 90 + 30) : 0;
    return { day: label, minutes, isToday: i === daysFromMonday };
  });
}

interface TooltipPayloadItem {
  day: string;
  minutes: number;
}

interface Props {
  /** When embedded in a BentoCell, omit outer Card wrapper */
  embedded?: boolean;
  className?: string;
}

export function WeeklyOverviewChart({ embedded = false, className }: Props) {
  const { mode } = useStore();
  const [mounted, setMounted] = React.useState(false);
  const data = React.useMemo(
    () => (mode === "cloud" ? [] : generateSampleData()),
    [mode],
  );
  const total = React.useMemo(() => data.reduce((s, d) => s + d.minutes, 0), [data]);
  const avg =
    data.filter((d) => d.minutes > 0).length > 0
      ? Math.round(total / data.filter((d) => d.minutes > 0).length)
      : 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(embedded && "flex flex-col gap-3", className)}>
        {embedded ? (
          <>
            <EmbeddedHeader total={0} avg={0} />
            <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
          </>
        ) : (
          <div className="rounded-2xl surface-card p-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <BarChart2 className="size-5 text-primary" />
              本周学习时长
            </div>
            <p className="text-sm text-muted-foreground">加载中...</p>
            <div className="h-48 mt-4 animate-pulse rounded-xl bg-muted/50" />
          </div>
        )}
      </div>
    );
  }

  const chartContent = (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            width={32}
            domain={[0, 120]}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const item = (payload[0] as { payload: TooltipPayloadItem }).payload;
              return (
                <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
                  <p className="font-medium">{item.day}</p>
                  <p className="text-primary font-semibold">{item.minutes} 分钟</p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="minutes"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            fill="var(--primary)"
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const trendLine = (
    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
      <TrendingUp className="size-3 text-success" />
      <span>较上周增长 15%</span>
    </div>
  );

  if (embedded) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <EmbeddedHeader total={total} avg={avg} />
        {chartContent}
        {trendLine}
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl surface-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <BarChart2 className="size-5 text-primary" />
            本周学习时长
          </div>
          <p className="text-sm text-muted-foreground">每日学习分钟数</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold">{total}</span>
            <span className="text-[10px] text-muted-foreground">本周总计 (分钟)</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-muted-foreground">{avg}</span>
            <span className="text-[10px] text-muted-foreground">日均</span>
          </div>
        </div>
      </div>
      {chartContent}
      {trendLine}
    </div>
  );
}

function EmbeddedHeader({ total, avg }: { total: number; avg: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <BarChart2 className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">本周学习时长</p>
          <p className="text-xs text-muted-foreground leading-tight">每日学习分钟数</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="flex flex-col items-end">
          <span className="text-base font-bold">{total}</span>
          <span className="text-[10px] text-muted-foreground">总计</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-muted-foreground">{avg}</span>
          <span className="text-[10px] text-muted-foreground">日均</span>
        </div>
      </div>
    </div>
  );
}
