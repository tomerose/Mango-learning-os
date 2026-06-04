import { CalendarCheck, Plus, Target, Flag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

export const metadata = { title: "Study Planner · Mango Learning OS" };

interface PlanItem {
  time: string;
  title: string;
  subject: SubjectId;
  done: boolean;
}

const dailyPlan: PlanItem[] = [
  { time: "09:00", title: "Transformer 注意力机制复习", subject: "ai", done: true },
  { time: "11:00", title: "微观经济学习题", subject: "economics", done: true },
  { time: "14:00", title: "DCF 估值模型搭建", subject: "finance", done: false },
  { time: "16:00", title: "线性代数证明", subject: "math", done: false },
  { time: "20:00", title: "雅思精读 + 生词卡", subject: "english", done: false },
];

const weekPlan = [
  { day: "周一", load: 4, focus: "AI 深度学习" },
  { day: "周二", load: 3, focus: "金融建模" },
  { day: "周三", load: 5, focus: "数学 + 经济" },
  { day: "周四", load: 3, focus: "英语强化" },
  { day: "周五", load: 4, focus: "AI 项目实战" },
  { day: "周六", load: 6, focus: "综合复习" },
  { day: "周日", load: 2, focus: "复盘 + 规划" },
];

const semesterGoals = [
  { title: "完成深度学习课程 + 1 个项目", subject: "ai" as SubjectId, pct: 65 },
  { title: "金融建模能力达到实习水平", subject: "finance" as SubjectId, pct: 48 },
  { title: "数学分析期末 90+", subject: "math" as SubjectId, pct: 72 },
  { title: "雅思模考稳定 7.0", subject: "english" as SubjectId, pct: 55 },
];

function PlanRow({ item }: { item: PlanItem }) {
  const meta = SUBJECT_META[item.subject];
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <span className="text-muted-foreground w-12 shrink-0 text-sm tabular-nums">
        {item.time}
      </span>
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <div className="min-w-0 flex-1">
        <p className={item.done ? "text-muted-foreground text-sm line-through" : "text-sm font-medium"}>
          {item.title}
        </p>
        <p className="text-muted-foreground text-xs">{meta.short}</p>
      </div>
      {item.done && <Badge variant="success">已完成</Badge>}
    </div>
  );
}

export default function StudyPlannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">学习计划</h1>
          <p className="text-muted-foreground text-sm">
            日 / 周 / 月 / 学期四级规划，目标层层对齐
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" /> 新建计划
        </Button>
      </header>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">每日</TabsTrigger>
          <TabsTrigger value="weekly">每周</TabsTrigger>
          <TabsTrigger value="monthly">每月</TabsTrigger>
          <TabsTrigger value="semester">学期</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="size-4" /> 今日时间表
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {dailyPlan.map((item, i) => (
                <PlanRow key={i} item={item} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>本周负荷分布</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {weekPlan.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-sm font-medium">{d.day}</span>
                  <div className="flex-1">
                    <Progress value={(d.load / 6) * 100} />
                  </div>
                  <span className="text-muted-foreground w-28 shrink-0 text-right text-xs">
                    {d.focus} · {d.load}h
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Target className="size-8 opacity-40" />
              <p className="text-sm">月视图日历即将上线 —— 将聚合周计划与里程碑</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="size-4" /> 本学期目标
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {semesterGoals.map((g, i) => {
                const meta = SUBJECT_META[g.subject];
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        {g.title}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{g.pct}%</span>
                    </div>
                    <Progress value={g.pct} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
