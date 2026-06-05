"use client";

import * as React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjects } from "@/lib/subjects";

// ─────────────────────────────────────────────────────────────
// KnowledgeRadar — radar chart showing mastery % per subject.
// ─────────────────────────────────────────────────────────────

interface SubjectMastery {
  subject: string;
  mastery: number; // 0-100
  fullMark?: number;
}

interface KnowledgeRadarProps {
  subjects: SubjectMastery[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SubjectMastery }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  const color =
    data.mastery >= 80
      ? "text-success"
      : data.mastery >= 60
        ? "text-yellow-500"
        : "text-destructive";

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-semibold">{data.subject}</p>
      <p className="text-xs text-muted-foreground">
        Mastery:{" "}
        <span className="font-bold font-mono">{data.mastery}%</span>
      </p>
      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full")}
          style={{
            width: `${data.mastery}%`,
            background:
              data.mastery >= 80
                ? "#10b981"
                : data.mastery >= 60
                  ? "#f59e0b"
                  : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}

// Inline cn since we need it
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function KnowledgeRadar({ subjects }: KnowledgeRadarProps) {
  const { getMeta } = useSubjects();
  const chartData = subjects.map((s) => ({
    subject: getMeta(s.subject).short,
    mastery: s.mastery,
    fullMark: s.fullMark ?? 100,
    originalId: s.subject,
  }));

  const avgMastery =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + s.mastery, 0) / subjects.length
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="size-5 text-primary" />
          <CardTitle className="text-lg">学科掌握度</CardTitle>
        </div>
        <CardDescription>
          Average mastery: {avgMastery}% across {subjects.length} subjects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-sm text-muted-foreground">
              No subject data available.
            </p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={chartData}
              >
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Mastery %"
                  dataKey="mastery"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary bars */}
        <div className="mt-4 space-y-2">
          {subjects.map((s) => {
            const meta = getMeta(s.subject);
            const barColor =
              s.mastery >= 80
                ? "#10b981"
                : s.mastery >= 60
                  ? "#f59e0b"
                  : "#ef4444";
            return (
              <div key={s.subject} className="flex items-center gap-2 text-xs">
                <div
                  className="size-2 rounded-sm shrink-0"
                  style={{ background: meta.color }}
                />
                <span className="w-12 text-muted-foreground">
                  {meta.short}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.mastery}%`,
                      background: barColor,
                    }}
                  />
                </div>
                <span className="font-mono font-medium w-8 text-right">
                  {s.mastery}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export type { SubjectMastery };
