"use client";

import * as React from "react";
import { Brain, Zap, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec1",
    icon: Brain,
    title: "复习薄弱知识点",
    description: "你在「多元函数极值」和「市场失灵」模块正确率偏低，建议针对性复习。",
    href: "/exam",
    color: "var(--chart-1)",
  },
  {
    id: "rec2",
    icon: Zap,
    title: "完成今日闪卡复习",
    description: "7 张卡片等待复习。保持间隔重复节奏，巩固长期记忆。",
    href: "/knowledge-tree",
    color: "var(--chart-3)",
  },
  {
    id: "rec3",
    icon: BookOpen,
    title: "试试微积分测验",
    description: "根据你的进度，推荐完成「多元函数极值」专项测验，检验掌握情况。",
    href: "/exam",
    color: "var(--chart-4)",
  },
];

export function AiRecommendations() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" />
          学习推荐
        </CardTitle>
        <CardDescription>个性化学习建议</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {RECOMMENDATIONS.map((rec) => (
            <div
              key={rec.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                "hover:border-primary/20 hover:bg-accent/30",
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in oklch, ${rec.color} 12%, transparent)`,
                }}
              >
                <rec.icon className="size-4" style={{ color: rec.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {rec.description}
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild className="shrink-0 h-8 px-2">
                <a href={rec.href}>
                  <span className="sr-only">开始</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
