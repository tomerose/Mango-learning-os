"use client";

import * as React from "react";
import { Bot, Layers, GraduationCap, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  {
    id: "focus",
    icon: Bot,
    label: "开始专注会话",
    description: "进入学习 Agent",
    href: "/agent",
    color: "var(--chart-1)",
  },
  {
    id: "review",
    icon: Layers,
    label: "复习待办卡片",
    description: "间隔重复系统",
    href: "/agent",
    color: "var(--chart-2)",
  },
  {
    id: "quiz",
    icon: GraduationCap,
    label: "参加测验",
    description: "自适应考试模式",
    href: "/exam",
    color: "var(--chart-4)",
  },
  {
    id: "journal",
    icon: Heart,
    label: "写反思日记",
    description: "心灵花园",
    href: "/grow",
    color: "var(--chart-5)",
  },
];

export function QuickActions() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <p className="text-sm font-semibold mb-3 text-muted-foreground">快捷操作</p>
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((action) => (
            <a
              key={action.id}
              href={action.href}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4",
                "transition-all duration-200 ease-out",
                "hover:border-primary/30 hover:bg-accent/40",
                "hover:scale-[1.03] hover:shadow-sm",
                "active:scale-[0.98]",
                "group",
              )}
            >
              <span
                className="flex size-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                style={{
                  backgroundColor: `color-mix(in oklch, ${action.color} 12%, transparent)`,
                }}
              >
                <action.icon
                  className="size-6 transition-colors duration-200"
                  style={{ color: action.color }}
                />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-[10px] text-muted-foreground -mt-1">
                {action.description}
              </span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
