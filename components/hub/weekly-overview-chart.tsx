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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function generateSampleData() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  // Calculate Monday of this week
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return DAYS_CN.map((label, i) => {
    // Days before or equal to today get data; future days in current week get 0
    const isPastOrToday = i <= daysFromMonday || daysFromMonday === -1;
    const minutes = isPastOrToday ? Math.floor(Math.random() * 90 + 30) : 0;
    return { day: label, minutes, isToday: i === daysFromMonday };
  });
}

interface TooltipPayloadItem {
  day: string;
  minutes: number;
}

export function WeeklyOverviewChart() {
  const { mode } = useStore();
  const [mounted, setMounted] = React.useState(false);
  const data = React.useMemo(() => mode === "cloud" ? [] : generateSampleData(), [mode]);
  const total = React.useMemo(() => data.reduce((s, d) => s + d.minutes, 0), [data]);
  const avg = data.filter((d) => d.minutes > 0).length > 0
    ? Math.round(total / data.filter((d) => d.minutes > 0).length)
    : 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart2 className="size-5 text-primary" />
            本周学习时长
          </CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart2 className="size-5 text-primary" />
              本周学习时长
            </CardTitle>
            <CardDescription>每日学习分钟数</CardDescription>
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
      </CardHeader>
      <CardContent>
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
                  const item = payload[0].payload as TooltipPayloadItem;
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

        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <TrendingUp className="size-3 text-success" />
          <span>较上周增长 15%</span>
        </div>
      </CardContent>
    </Card>
  );
}
