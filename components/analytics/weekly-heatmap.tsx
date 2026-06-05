"use client";

import * as React from "react";
import { Grid3X3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// WeeklyHeatmap — GitHub-style contribution heatmap.
// 7 columns (days of week) x 4 rows (weeks). Pure CSS grid.
// Color intensity by minutes studied. No D3 needed.
// ─────────────────────────────────────────────────────────────

interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  minutes: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ... 6=Sat
}

interface WeeklyHeatmapProps {
  data: HeatmapDay[];
}

const WEEKDAYS_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getIntensityColor(minutes: number, maxMinutes: number): string {
  if (minutes === 0) return "bg-muted/30";
  const ratio = maxMinutes > 0 ? minutes / maxMinutes : 0;

  if (ratio === 0) return "bg-muted/30";
  if (ratio <= 0.25) return "bg-chart-2/30";
  if (ratio <= 0.5) return "bg-chart-2/50";
  if (ratio <= 0.75) return "bg-chart-2/70";
  return "bg-chart-2";
}

function getIntensityInlineStyle(minutes: number, maxMinutes: number): React.CSSProperties {
  if (minutes === 0) {
    return { background: "var(--muted)", opacity: 0.3 };
  }
  const ratio = maxMinutes > 0 ? minutes / maxMinutes : 0;

  // Use interpolated green
  if (ratio <= 0.25) {
    return {
      background: `rgba(16, 185, 129, ${0.15 + ratio * 1.2})`,
    };
  }
  if (ratio <= 0.5) {
    return {
      background: `rgba(16, 185, 129, ${0.3 + (ratio - 0.25) * 1.6})`,
    };
  }
  if (ratio <= 0.75) {
    return {
      background: `rgba(16, 185, 129, ${0.55 + (ratio - 0.5) * 1.8})`,
    };
  }
  return { background: "rgba(16, 185, 129, 0.9)" };
}

export function WeeklyHeatmap({ data }: WeeklyHeatmapProps) {
  const maxMinutes = React.useMemo(
    () => Math.max(...data.map((d) => d.minutes), 1),
    [data]
  );

  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const activeDays = data.filter((d) => d.minutes > 0).length;

  // Organize data into a grid: weeks (rows) x 7 days (columns)
  // We'll display last 28 days (4 weeks)
  const grid = React.useMemo(() => {
    const weeks: (HeatmapDay | null)[][] = [];
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sorted.length === 0) {
      // Create empty 4x7 grid
      for (let w = 0; w < 4; w++) {
        weeks.push(Array(7).fill(null));
      }
      return weeks;
    }

    // Determine the first Monday on or before the earliest date
    const firstDate = new Date(sorted[0].date);
    const dayOfWeek = firstDate.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDate = new Date(firstDate);
    startDate.setDate(firstDate.getDate() + mondayOffset);

    // Build a map for quick lookup
    const dateMap = new Map<string, HeatmapDay>();
    for (const d of sorted) {
      dateMap.set(d.date, d);
    }

    // Fill 4 weeks starting from startDate
    const currentDate = new Date(startDate);
    for (let w = 0; w < 4; w++) {
      const week: (HeatmapDay | null)[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const day = dateMap.get(dateStr) ?? null;
        week.push(day);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Grid3X3 className="size-5 text-primary" />
          <CardTitle className="text-lg">Activity Heatmap</CardTitle>
        </div>
        <CardDescription>
          {activeDays} active days · {totalHours}h total · Last 4 weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {WEEKDAYS_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[14px] flex items-center text-[10px] text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div className="flex gap-1 flex-1">
            {/* We transpose: each column = one day of week, each row = a week */}
            {Array.from({ length: 7 }, (_, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1 flex-1">
                {grid.map((week, rowIdx) => {
                  const day = week[colIdx];
                  const minutes = day?.minutes ?? 0;
                  const dateStr = day?.date ?? "";
                  const tooltipLabel = day
                    ? `${dateStr}: ${day.minutes}min`
                    : "No data";

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className="aspect-square rounded-sm transition-transform hover:scale-125 hover:ring-1 hover:ring-foreground/50"
                      style={getIntensityInlineStyle(minutes, maxMinutes)}
                      title={tooltipLabel}
                      role="img"
                      aria-label={tooltipLabel}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const minutes = Math.round(ratio * maxMinutes);
            return (
              <div
                key={ratio}
                className="size-3 rounded-sm"
                style={getIntensityInlineStyle(minutes || (ratio === 0 ? 0 : 1), maxMinutes)}
                title={`${minutes} min`}
              />
            );
          })}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t">
          <div>
            <p className="text-lg font-bold text-primary">
              {activeDays}
            </p>
            <p className="text-[10px] text-muted-foreground">Active Days</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">
              {totalHours}h
            </p>
            <p className="text-[10px] text-muted-foreground">Total Time</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">
              {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0}m
            </p>
            <p className="text-[10px] text-muted-foreground">Avg / Day</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { HeatmapDay };
