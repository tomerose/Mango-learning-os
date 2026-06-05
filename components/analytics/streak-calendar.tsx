"use client";

import * as React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// StreakCalendar — monthly calendar view with colored dots
// for streak days, today highlighted, and streak count.
// ─────────────────────────────────────────────────────────────

interface CalendarStreak {
  date: string; // "YYYY-MM-DD"
  studied: boolean;
  minutes?: number;
}

interface StreakCalendarProps {
  data: CalendarStreak[];
  streakDays: number;
}

const WEEKDAYS_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function StreakCalendar({ data, streakDays }: StreakCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  // Build date lookup
  const dateMap = React.useMemo(() => {
    const map = new Map<string, CalendarStreak>();
    for (const d of data) {
      map.set(d.date, d);
    }
    return map;
  }, [data]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Calculate calendar grid
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // day of week: 0=Sun, 1=Mon, ...
    const startDow = firstDay.getDay();
    // Convert to Monday-start: 0=Mon ... 6=Sun
    const startPadding = startDow === 0 ? 6 : startDow - 1;

    const days: (number | null)[] = [];

    // Padding before first day
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }

    // Pad to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [viewYear, viewMonth]);

  // Stats for this month
  const monthStats = React.useMemo(() => {
    let studiedDays = 0;
    let totalMinutes = 0;

    for (const d of data) {
      const [y, m] = d.date.split("-").map(Number);
      if (y === viewYear && m === viewMonth + 1 && d.studied) {
        studiedDays++;
        totalMinutes += d.minutes ?? 0;
      }
    }

    return { studiedDays, totalMinutes };
  }, [data, viewYear, viewMonth]);

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Streak Calendar</CardTitle>
              <CardDescription>
                {streakDays} day{streakDays !== 1 ? "s" : ""} streak{" "}
                {streakDays >= 7 ? (
                  <Flame className="size-3.5 inline text-orange-500" />
                ) : null}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={goPrevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <button
              onClick={goToday}
              className="text-sm font-medium hover:underline px-1"
            >
              {MONTHS[viewMonth]} {viewYear}
            </button>
            <Button variant="ghost" size="icon" className="size-7" onClick={goNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS_HEADER.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const streakData = dateMap.get(dateStr);
            const studied = streakData?.studied ?? false;
            const minutes = streakData?.minutes ?? 0;
            const isToday = dateStr === todayStr;
            const isPast =
              new Date(dateStr) <= today;

            return (
              <div
                key={dateStr}
                className={cn(
                  "aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all",
                  isToday && "ring-2 ring-primary bg-primary/10 font-bold",
                  studied && !isToday && "bg-success/15",
                  !isPast && "opacity-30",
                  isPast && !studied && !isToday && "bg-muted/20"
                )}
                title={
                  studied
                    ? `${dateStr}: ${minutes} min studied`
                    : isToday
                      ? "Today"
                      : dateStr
                }
              >
                <span
                  className={cn(
                    isToday && "text-primary",
                    studied && !isToday && "text-success"
                  )}
                >
                  {day}
                </span>
                {studied && (
                  <div
                    className="size-1.5 rounded-full mt-0.5"
                    style={{
                      background:
                        minutes >= 120
                          ? "#10b981"
                          : minutes >= 60
                            ? "#34d399"
                            : "#6ee7b7",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Month stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t text-center">
          <div>
            <p className="text-lg font-bold">
              {monthStats.studiedDays}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Days Studied
            </p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {Math.round(monthStats.totalMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-[10px] text-muted-foreground">
              Hours This Month
            </p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {streakDays}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Day Streak
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-success/30" />
            Studied
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-muted/20" />
            Skipped
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full ring-1 ring-primary" />
            Today
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { CalendarStreak };
