"use client";

import * as React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Pencil,
  Timer,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/lib/subjects";

// ─────────────────────────────────────────────────────────────
// RevisionSchedule — day-by-day revision timetable with a
// simple calendar grid. Shows days until exam, topic assigned
// per day, and supports navigation through weeks.
// ─────────────────────────────────────────────────────────────

interface RevisionDay {
  day: number;
  date: string;
  topic: string;
  subject: string;
  type: "review" | "practice" | "mock" | "rest";
}

interface RevisionScheduleProps {
  schedule: RevisionDay[];
  examDate: string;
}

const typeConfig: Record<
  RevisionDay["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  review: { icon: BookOpen, color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Review" },
  practice: { icon: Pencil, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Practice" },
  mock: { icon: Timer, color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Mock Exam" },
  rest: { icon: Coffee, color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Rest Day" },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function RevisionSchedule({
  schedule,
  examDate,
}: RevisionScheduleProps) {
  const { getMeta } = useSubjects();
  const [currentWeek, setCurrentWeek] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Group schedule into weeks
  const weeks = React.useMemo(() => {
    const result: RevisionDay[][] = [];
    let currentWeekDays: RevisionDay[] = [];

    // Find first Monday before or on the first schedule day
    const firstDate = schedule.length > 0 ? new Date(schedule[0].date) : new Date();
    const dayOfWeek = firstDate.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayDate = new Date(firstDate);
    mondayDate.setDate(firstDate.getDate() + mondayOffset);

    // Pad beginning of first week with null placeholders
    const startOffset = Math.max(0, dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    for (let i = 0; i < startOffset; i++) {
      currentWeekDays.push(null as unknown as RevisionDay);
    }

    for (const day of schedule) {
      if (currentWeekDays.length === 7) {
        result.push(currentWeekDays);
        currentWeekDays = [];
      }

      // Check if this day starts a new week (gap)
      if (currentWeekDays.length > 0) {
        const lastDate = new Date(
          currentWeekDays[currentWeekDays.length - 1]?.date ?? ""
        );
        const thisDate = new Date(day.date);
        const dayDiff = Math.round(
          (thisDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff > 1) {
          // Fill gaps
          for (let g = 1; g < dayDiff; g++) {
            if (currentWeekDays.length === 7) {
              result.push(currentWeekDays);
              currentWeekDays = [];
            }
            currentWeekDays.push(null as unknown as RevisionDay);
          }
        }
      }

      currentWeekDays.push(day);
    }

    // Pad last week
    while (currentWeekDays.length < 7) {
      currentWeekDays.push(null as unknown as RevisionDay);
    }
    result.push(currentWeekDays);

    return result;
  }, [schedule]);

  const totalWeeks = weeks.length;
  const displayWeek = Math.min(Math.max(0, currentWeek), totalWeeks - 1);
  const displayDays = weeks[displayWeek] ?? [];

  const examD = new Date(examDate);
  const daysUntilExam = Math.max(
    0,
    Math.ceil((examD.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const reviewCount = schedule.filter((d) => d.type === "review").length;
  const practiceCount = schedule.filter((d) => d.type === "practice").length;
  const mockCount = schedule.filter((d) => d.type === "mock").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <CardTitle className="text-lg">Revision Schedule</CardTitle>
        </div>
        <CardDescription>
          {schedule.length} days planned · {daysUntilExam} days until exam ·{" "}
          {reviewCount} review / {practiceCount} practice / {mockCount} mock
          exams
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Week navigation */}
        {totalWeeks > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={displayWeek === 0}
              onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous Week
            </Button>
            <span className="text-xs text-muted-foreground">
              Week {displayWeek + 1} of {totalWeeks}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={displayWeek >= totalWeeks - 1}
              onClick={() =>
                setCurrentWeek((w) => Math.min(totalWeeks - 1, w + 1))
              }
            >
              Next Week
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-muted-foreground py-1 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {displayDays.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-md bg-muted/20"
                />
              );
            }

            const meta = getMeta(day.subject);
            const config = typeConfig[day.type];
            const Icon = config.icon;
            const dateLabel = day.date.slice(5); // MM-DD
            const isToday =
              day.date === new Date().toISOString().slice(0, 10);
            const isSelected = selectedDay === i;

            return (
              <button
                key={i}
                onClick={() =>
                  setSelectedDay(isSelected ? null : i)
                }
                className={cn(
                  "relative aspect-square rounded-lg border p-1 flex flex-col items-center justify-center transition-all hover:scale-105",
                  config.color,
                  isToday && "ring-2 ring-primary",
                  isSelected && "ring-2 ring-foreground"
                )}
                title={day.topic}
              >
                <span className="text-[9px] font-bold">{dateLabel}</span>
                <Icon className="size-3.5 mt-0.5" />
                <span className="text-[8px] font-medium truncate w-full text-center mt-0.5">
                  {meta.short}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay !== null && displayDays[selectedDay] && (
          <div className="rounded-lg border bg-muted/30 p-3">
            {(() => {
              const day = displayDays[selectedDay];
              if (!day) return null;
              const config = typeConfig[day.type];
              const Icon = config.icon;
              const meta = getMeta(day.subject);
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: meta.color, color: meta.color }}
                    >
                      {meta.short}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Day {day.day} · {day.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{day.topic}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="size-3.5" />
                    <span>
                      {day.type === "review"
                        ? "Review notes, flashcards, and key concepts"
                        : day.type === "practice"
                          ? "Complete practice problems for this topic"
                          : day.type === "mock"
                            ? "Take a timed mock exam on this topic"
                            : "Take a break — recovery improves retention"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {(Object.entries(typeConfig) as [RevisionDay["type"], typeof typeConfig[keyof typeof typeConfig]][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-1">
                  <div
                    className={cn(
                      "size-4 rounded border flex items-center justify-center",
                      config.color
                    )}
                  >
                    <Icon className="size-2.5" />
                  </div>
                  {config.label}
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export type { RevisionDay };
