"use client";

import Link from "next/link";
import { TrendingDown, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";

// Real weakness analysis driven by quiz history in the store. Shows the
// weakest topics first; the "生成针对性练习" button deep-links into the AI
// Tutor quiz tab pre-filled with the weakest area, closing the loop:
// quiz → diagnose → targeted practice → quiz.
export function WeaknessAnalysis() {
  const { weakAreas, hydrated } = useStore();

  // Surface the 5 weakest; the weakest drives the practice deep link.
  const top = weakAreas.slice(0, 5);
  const weakest = top[0];
  const practiceHref = weakest
    ? `/ai-tutor?tab=quiz&subject=${weakest.subject}&topic=${encodeURIComponent(
        weakest.topic
      )}`
    : "/ai-tutor?tab=quiz";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="size-4" /> 弱点分析
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hydrated ? (
          <p className="text-muted-foreground text-sm">加载中…</p>
        ) : top.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center">
            <Sparkles className="size-6 opacity-40" />
            <p className="text-sm">还没有测验记录</p>
            <p className="text-xs">完成 AI 导师的测验后，这里会按学科诊断你的薄弱点</p>
          </div>
        ) : (
          top.map((w) => {
            const meta = SUBJECT_META[w.subject];
            return (
              <div key={`${w.subject}-${w.topic}`} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    {w.topic}
                    <Badge variant="secondary" className="text-xs">
                      {meta.short}
                    </Badge>
                  </span>
                  <span
                    className={
                      w.accuracy < 60
                        ? "text-destructive text-xs tabular-nums"
                        : "text-muted-foreground text-xs tabular-nums"
                    }
                  >
                    {w.accuracy}% · {w.attempts}次
                  </span>
                </div>
                <Progress value={w.accuracy} />
              </div>
            );
          })
        )}
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href={practiceHref}>
            <Sparkles className="size-4" />
            {weakest ? `针对「${weakest.topic}」练习` : "去测验练习"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
