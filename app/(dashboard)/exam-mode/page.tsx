import { GraduationCap, Target, AlertTriangle, FileQuestion, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WeaknessAnalysis } from "@/components/exam-mode/weakness-analysis";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

export const metadata = { title: "Exam Mode · Mango Learning OS" };

const upcomingExams = [
  { course: "数学分析", subject: "math" as SubjectId, date: "6月18日", daysLeft: 14, readiness: 72 },
  { course: "微观经济学", subject: "economics" as SubjectId, date: "6月22日", daysLeft: 18, readiness: 58 },
  { course: "机器学习导论", subject: "ai" as SubjectId, date: "6月25日", daysLeft: 21, readiness: 65 },
];

export default function ExamModePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">考试模式</h1>
        <p className="text-muted-foreground text-sm">
          课程复习、冲刺计划、模拟测试与弱点分析 —— 把焦虑变成准备
        </p>
      </header>

      {/* Upcoming exams */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">即将到来的考试</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingExams.map((e, i) => {
            const meta = SUBJECT_META[e.subject];
            return (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      {e.course}
                    </span>
                    <Badge variant={e.daysLeft <= 14 ? "warning" : "secondary"}>
                      <Clock className="size-3" />{e.daysLeft}天
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{e.date}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">备考完成度</span>
                      <span className="tabular-nums">{e.readiness}%</span>
                    </div>
                    <Progress value={e.readiness} />
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    进入冲刺
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">备考工具</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { icon: Target, label: "重点概念", desc: "高频考点梳理" },
              { icon: FileQuestion, label: "模拟测试", desc: "AI 生成模拟题" },
              { icon: GraduationCap, label: "冲刺计划", desc: "倒计时复习路径" },
              { icon: AlertTriangle, label: "错题本", desc: "针对性巩固" },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <button key={i} className="hover:bg-accent flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors">
                  <Icon className="text-primary size-5" />
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-muted-foreground text-xs">{t.desc}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Weakness analysis — driven by real quiz history */}
        <WeaknessAnalysis />
      </div>
    </div>
  );
}
