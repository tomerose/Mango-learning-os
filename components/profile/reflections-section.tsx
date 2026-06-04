"use client";

import * as React from "react";
import { PencilLine, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

const MOODS = ["专注", "充实", "疲惫", "突破", "焦虑", "平静"];

export function ReflectionsSection() {
  const { reflections, addReflection } = useStore();
  const [open, setOpen] = React.useState(false);
  const [mood, setMood] = React.useState(MOODS[0]);
  const [body, setBody] = React.useState("");

  function submit() {
    if (!body.trim()) return;
    addReflection({ mood, body: body.trim() });
    setMood(MOODS[0]);
    setBody("");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <PencilLine className="size-4" /> 反思记录
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="size-4" /> 写反思
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>今日反思</DialogTitle>
                <DialogDescription>
                  记录状态与收获，持续复盘是成长的复利。本地保存，刷新不丢。
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        mood === m
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "hover:bg-accent text-muted-foreground"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="今天学到了什么？哪里卡住了？明天怎么调整？"
                  className="min-h-28"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={submit} disabled={!body.trim()}>
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reflections.map((r) => (
          <div key={r.id} className="flex gap-3 rounded-lg border px-3 py-2.5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground text-xs tabular-nums">
                {r.dateLabel}
              </span>
              <Badge variant="secondary">{r.mood}</Badge>
            </div>
            <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">
              {r.body}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
