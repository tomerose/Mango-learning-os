"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// LearningHoursChart — bar chart showing daily study hours
// for the last 30 days, stacked by subject where possible.
// ─────────────────────────────────────────────────────────────

interface DailyHours {
  date: string; // "MM-DD"
  total: number;
  [subject: string]: number | string;
}

interface LearningHoursChartProps {
  data: DailyHours[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="size-2.5 rounded-sm"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">{entry.value}h</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t text-xs font-semibold">
        Total: {payload.reduce((s, e) => s + e.value, 0)}h
      </div>
    </div>
  );
}

export function LearningHoursChart({ data }: LearningHoursChartProps) {
  const { getColor } = useSubjects();

  // Extract all subject keys from data
  const subjectKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const day of data) {
      for (const key of Object.keys(day)) {
        if (key !== "date" && key !== "total") {
          keys.add(key);
        }
      }
    }
    return Array.from(keys);
  }, [data]);

  const totalHours = data.reduce((s, d) => s + d.total, 0);
  const avgHours = data.length > 0 ? (totalHours / data.length).toFixed(1) : "0";

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              学习时长趋势
            </CardTitle>
            <CardDescription>
              Last 30 days · Avg {avgHours}h/day · Total {totalHours.toFixed(0)}h
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground text-sm">
              No study data yet. Start tracking to see your trends.
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  domain={[0, Math.ceil(maxTotal * 1.2)]}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.15 }} />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="rect"
                  iconSize={8}
                />
                {subjectKeys.length > 0 ? (
                  subjectKeys.map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="a"
                      fill={getColor(key)}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={20}
                    />
                  ))
                ) : (
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    name="Total"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { DailyHours };
