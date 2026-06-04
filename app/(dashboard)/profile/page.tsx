import { Trophy, Flame, Clock, Target, Award, BookOpen, Brain, Star, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReflectionsSection } from "@/components/profile/reflections-section";
import { getDashboardStats } from "@/lib/mock-data";

export const metadata = { title: "Profile · Mango Learning OS" };

const achievements = [
  { icon: Flame, name: "七日连击", desc: "连续学习 7 天", unlocked: true, color: "var(--chart-3)" },
  { icon: BookOpen, name: "百题斩", desc: "完成 100 道练习", unlocked: true, color: "var(--chart-2)" },
  { icon: Brain, name: "测验达人", desc: "测验正确率 90%+", unlocked: true, color: "var(--chart-4)" },
  { icon: Star, name: "早起鸟", desc: "7 天早于 8 点学习", unlocked: false, color: "var(--chart-1)" },
  { icon: Award, name: "月度全勤", desc: "30 天不断签", unlocked: false, color: "var(--chart-5)" },
  { icon: Target, name: "目标达成者", desc: "完成一个学期目标", unlocked: false, color: "var(--chart-1)" },
];

export default async function ProfilePage() {
  const s = await getDashboardStats();
  const levelSpan = s.xpToNextLevel - s.xpForCurrentLevel;
  const levelProgress = Math.round(((s.totalXp - s.xpForCurrentLevel) / levelSpan) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Identity header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20 text-2xl">
            <AvatarFallback>林</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">林深</h1>
              <Badge>Lv.{s.level}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">UIBE · 金融人工智能 · 大一</p>
            <div className="flex w-full max-w-xs flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">距下一级</span>
                <span className="tabular-nums">{s.totalXp} / {s.xpToNextLevel} XP</span>
              </div>
              <Progress value={levelProgress} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifetime stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Flame, label: "当前连击", value: `${s.streakDays} 天`, color: "var(--chart-3)" },
          { icon: Trophy, label: "累计 XP", value: `${s.totalXp}`, color: "var(--chart-1)" },
          { icon: Clock, label: "本周学习", value: "21.5 h", color: "var(--chart-2)" },
          { icon: Award, label: "已解锁成就", value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`, color: "var(--chart-4)" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="flex flex-col gap-2">
                <Icon className="size-5" style={{ color: stat.color }} />
                <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                <span className="text-muted-foreground text-xs">{stat.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">成就墙</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((a, i) => {
            const Icon = a.unlocked ? a.icon : Lock;
            return (
              <div
                key={i}
                className={
                  a.unlocked
                    ? "flex items-center gap-3 rounded-lg border p-3"
                    : "flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-60"
                }
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: a.unlocked ? `color-mix(in oklch, ${a.color} 15%, transparent)` : "var(--muted)" }}
                >
                  <Icon className="size-5" style={{ color: a.unlocked ? a.color : "var(--muted-foreground)" }} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{a.desc}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Reflection history */}
      <ReflectionsSection />
    </div>
  );
}
