"use client";

import * as React from "react";
import { Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// FocusScoreGauge — SVG donut gauge showing focus score with
// color ranges: red < 40, yellow 40-70, green > 70.
// ─────────────────────────────────────────────────────────────

interface FocusScoreGaugeProps {
  score: number; // 0-100
  previousScore?: number;
}

function DonutGauge({ percentage, color }: { percentage: number; color: string }) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  // Background circle with gradient segments
  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      className="mx-auto"
    >
      {/* Background circle (track) */}
      <circle
        stroke="var(--muted)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        opacity={0.3}
      />

      {/* Foreground circle (value) */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference + " " + circumference}
        style={{
          strokeDashoffset,
          transition: "stroke-dashoffset 1s ease-in-out",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />

      {/* Center text */}
      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
        style={{ fontSize: "28px", fontWeight: "bold" }}
      >
        {percentage}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        style={{ fontSize: "12px" }}
      >
        / 100
      </text>
    </svg>
  );
}

export function FocusScoreGauge({ score, previousScore }: FocusScoreGaugeProps) {
  const color =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  const status =
    score >= 70 ? "Excellent" : score >= 40 ? "Moderate" : "Needs Attention";

  const statusColor =
    score >= 70
      ? "text-success"
      : score >= 40
        ? "text-yellow-500"
        : "text-destructive";

  const change =
    previousScore !== undefined ? score - previousScore : null;

  const ChangeIcon =
    change === null ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const changeColor =
    change === null
      ? "text-muted-foreground"
      : change > 0
        ? "text-success"
        : "text-destructive";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Brain className="size-5" style={{ color }} />
          Focus Score
        </CardTitle>
        <CardDescription>
          <span className={cn("font-semibold", statusColor)}>{status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <DonutGauge percentage={score} color={color} />

        {/* Change indicator */}
        {change !== null && (
          <div className={cn("flex items-center gap-1 text-sm", changeColor)}>
            <ChangeIcon className="size-4" />
            <span>
              {change > 0 ? "+" : ""}
              {change} from last week
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-red-500" />
            &lt;40
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-yellow-500" />
            40-70
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-green-500" />
            &gt;70
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground text-center mt-1">
          {score >= 70
            ? "Your focus is great! Maintain your current routine and consider increasing study complexity."
            : score >= 40
              ? "Decent focus. Try the Pomodoro technique (25min study + 5min break) to improve concentration."
              : "Focus needs work. Minimize distractions, set specific goals per session, and take regular breaks."}
        </div>
      </CardContent>
    </Card>
  );
}
