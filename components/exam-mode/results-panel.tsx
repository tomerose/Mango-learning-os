"use client";

import * as React from "react";
import { Trophy, TrendingUp, BookOpen, Calendar, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubjects } from "@/lib/subjects";
import type { ExamResult } from "@/lib/types";

interface Props {
  results: ExamResult[];
  loading: boolean;
  guest: boolean;
  onRefresh: () => void;
}

export function ResultsPanel({ results, loading, guest, onRefresh }: Props) {
  const { getMeta } = useSubjects();

  if (loading) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center text-sm">加载中…</CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <BookOpen className="size-8 opacity-40" />
          <p className="text-muted-foreground text-sm">还没有练习记录</p>
          <p className="text-muted-foreground text-xs">完成一次练习后，结果与统计数据会显示在这里</p>
          {guest && <Badge variant="secondary" className="text-[10px] mt-1">游客模式 — 登录后永久保存</Badge>}
        </CardContent>
      </Card>
    );
  }

  // Stats
  const avgPct = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const best = results.reduce((best, r) => r.percentage > best.percentage ? r : best, results[0]);
  const totalDone = results.reduce((s, r) => s + r.total, 0);
  const totalScore = results.reduce((s, r) => s + r.score, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Star,     label: "练习次数", value: `${results.length}`, color: "var(--chart-1)" },
          { icon: TrendingUp, label: "平均正确率", value: `${avgPct}%`, color: "var(--chart-2)" },
          { icon: Trophy,   label: "总得分",   value: `${totalScore}/${totalDone}`, color: "var(--chart-3)" },
          { icon: Star,     label: "最佳成绩", value: `${best.percentage}%`, color: "var(--chart-4)" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i}>
              <CardContent className="flex flex-col gap-2 py-3 px-4">
                <Icon className="size-4" style={{ color: s.color }} />
                <div>
                  <p className="text-lg font-bold tabular-nums">{s.value}</p>
                  <p className="text-muted-foreground text-[11px]">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* History list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="size-4" /> 练习历史
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {results.map(r => {
            const meta = getMeta(r.subject);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.topic || r.subject}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {meta.short} · {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold tabular-nums ${r.percentage >= 80 ? "text-success" : r.percentage >= 50 ? "text-warning" : "text-destructive"}`}>
                      {r.percentage}%
                    </span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">{r.score}/{r.total}</span>
                  </div>
                  <Progress value={r.percentage} className="w-16 h-1.5" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {guest && (
        <p className="text-muted-foreground text-[11px] text-center">游客模式 — 登录后记录持久保存到云端</p>
      )}
    </div>
  );
}
