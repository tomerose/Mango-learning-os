"use client";

import * as React from "react";
import { Trophy, Flame, Clock, Award, BookOpen, Brain, Star, Lock, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReflectionsSection } from "@/components/profile/reflections-section";
import { useStore } from "@/lib/store";

const achievements = [
  { icon: Flame, name: "七日连击", desc: "连续学习 7 天", unlocked: true, color: "var(--chart-3)" },
  { icon: BookOpen, name: "百题斩", desc: "完成 100 道练习", unlocked: true, color: "var(--chart-2)" },
  { icon: Brain, name: "测验达人", desc: "测验正确率 90%+", unlocked: true, color: "var(--chart-4)" },
  { icon: Star, name: "早起鸟", desc: "7 天早于 8 点学习", unlocked: false, color: "var(--chart-1)" },
  { icon: Award, name: "月度全勤", desc: "30 天不断签", unlocked: false, color: "var(--chart-5)" },
  { icon: Target, name: "目标达成者", desc: "完成一个学期目标", unlocked: false, color: "var(--chart-1)" },
];

// ── 个人档案内容 ───────────────────────────────────────────────
function ProfileTab() {
  const { stats, tasks, mode, storagePreference, setStoragePreference, syncLocalToCloud } = useStore();
  const { totalXp, level, xpToNextLevel, xpForCurrentLevel, streakDays, minutesToday } = stats;
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState("");

  const levelSpan = xpToNextLevel - xpForCurrentLevel || 1;
  const levelProgress = Math.round(((totalXp - xpForCurrentLevel) / levelSpan) * 100);
  const totalTasksDone = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-6">
      {/* 身份卡片 */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20 text-2xl">
            <AvatarFallback>{mode === "cloud" ? "你" : "学"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">学习者</h1>
              <Badge>Lv.{level}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {mode === "cloud" ? "云端同步已启用" : "游客模式 · 数据存于本地"}
            </p>
            <div className="flex w-full max-w-xs flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">距下一级</span>
                <span className="tabular-nums">{totalXp} / {xpToNextLevel} XP</span>
              </div>
              <Progress value={levelProgress} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Flame, label: "当前连击", value: `${streakDays} 天`, color: "var(--chart-3)" },
          { icon: Trophy, label: "累计 XP", value: `${totalXp}`, color: "var(--chart-1)" },
          { icon: Clock, label: "今日学习", value: `${minutesToday} min`, color: "var(--chart-2)" },
          { icon: Award, label: "已完成任务", value: `${totalTasksDone}`, color: "var(--chart-4)" },
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

      {/* 数据存储设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据存储</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {storagePreference === "local" ? "💻 本地存储" : "☁️ 云端存储"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {storagePreference === "local"
                  ? "数据保存在当前浏览器，换设备无法同步"
                  : "数据保存在云端，任何设备登录后自动同步"}
              </p>
            </div>
            <button
              onClick={() => setStoragePreference(storagePreference === "local" ? "cloud" : "local")}
              className="text-xs text-primary font-medium hover:underline shrink-0"
            >
              {storagePreference === "local" ? "切换到云端" : "切换到本地"}
            </button>
          </div>

          {mode === "cloud" && (
            <div className="pt-3 border-t">
              <button
                onClick={async () => {
                  setSyncing(true); setSyncMsg("");
                  try {
                    await syncLocalToCloud();
                    setSyncMsg("数据已同步到云端 ✅");
                  } catch {
                    setSyncMsg("同步失败，请稍后重试");
                  } finally { setSyncing(false); }
                }}
                disabled={syncing}
                className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {syncing ? "⏳ 同步中…" : "☁️ 一键上传数据到云端"}
              </button>
              {syncMsg && <p className="text-xs text-muted-foreground text-center mt-2">{syncMsg}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 成就墙 */}
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

      {/* 反思记录 */}
      <ReflectionsSection />

      {/* 关于我们 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关于我们</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>第三自习室出品 · 和你一起成长的学习伴侣。</p>
          <p className="text-xs">学习路上不孤单，我们一同前行。</p>
          <div className="mt-3 pt-3 border-t space-y-1 text-xs">
            <p className="flex items-center gap-2">
              <span className="font-medium text-foreground">WeChat</span>
              tokentome222 / sillyfind2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── 主入口 ──────────────────────────────────────────────────────
export function ProfileContent() {
  return <ProfileTab />;
}
