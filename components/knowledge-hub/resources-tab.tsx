"use client";

import * as React from "react";
import { Plus, ExternalLink, Trash2, BookMarked, Upload, Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { SUBJECT_META } from "@/lib/mock-data";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  type: string;
  subject: SubjectId;
  url: string;
}

// Persist resources to localStorage so they survive refresh
const STORAGE_KEY = "mango-resources-v1";

function loadResources(): Resource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveResources(items: Resource[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

const TYPES = ["文章", "视频", "论文", "课程", "工具", "其他"];

const SEED: Resource[] = [
  { id: "s1", title: "Attention Is All You Need", type: "论文", subject: "ai", url: "https://arxiv.org/abs/1706.03762" },
  { id: "s2", title: "3Blue1Brown 线性代数", type: "视频", subject: "math", url: "https://www.3blue1brown.com/topics/linear-algebra" },
  { id: "s3", title: "Damodaran 估值课程", type: "课程", subject: "finance", url: "https://pages.stern.nyu.edu/~adamodar/" },
];

export function ResourcesTab() {
  const { subjects } = useSubjects();
  const [items, setItems] = React.useState<Resource[]>(() => {
    const saved = loadResources();
    return saved.length > 0 ? saved : SEED;
  });
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [type, setType] = React.useState("文章");
  const [subject, setSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");

  React.useEffect(() => { saveResources(items); }, [items]);

  function add() {
    if (!title.trim() || !url.trim()) return;
    const item: Resource = {
      id: `r-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      type,
      subject,
    };
    setItems(prev => [item, ...prev]);
    setTitle(""); setUrl(""); setType("文章"); setSubject("ai");
    setOpen(false);
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function exportResources() {
    const md = items.map((r) => `- [${r.title}](${r.url || "#"}) — ${r.type} · ${SUBJECT_META[r.subject]?.label ?? r.subject}`).join("\n");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><style>body{font-family:'Microsoft YaHei',sans-serif;line-height:2;padding:2cm;}h1{font-size:20px;}li{font-size:14px;margin:8px 0;}</style></head><body><h1>📚 学习资料导出</h1><p style="color:#888;">共 ${items.length} 条 · ${new Date().toLocaleDateString("zh-CN")}</p><ul>${items.map((r) => `<li><strong>${r.title}</strong> — ${r.type} · ${SUBJECT_META[r.subject]?.label ?? r.subject}<br><a href="${r.url}">${r.url}</a></li>`).join("")}</ul></body></html>`;
    const blob = new Blob(["﻿" + html], { type: "application/msword;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Mango_资料_${new Date().toISOString().slice(0,10)}.doc`; a.click(); URL.revokeObjectURL(a.href);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">{items.length} 个资源</p>
          {items.length > 0 && (
            <button onClick={exportResources} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <Download className="size-3" /> 导出
            </button>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="size-4" /> 添加资源</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加学习资源</DialogTitle>
              <DialogDescription>保存文章、视频、论文链接，构建你的学习资源库。</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {subjects.map(s => (
                  <button key={s.id} onClick={() => setSubject(s.id)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      subject === s.id ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{s.label}</button>
                ))}
              </div>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="资源名称" autoFocus />
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." type="url" />
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      type === t ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{t}</button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button onClick={add} disabled={!title.trim() || !url.trim()}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <BookMarked className="size-8 opacity-40" />
          <p className="text-sm">还没有资源，点击「添加资源」开始收藏</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map(r => {
            const meta = SUBJECT_META[r.subject];
            return (
              <div key={r.id}
                className="hover:bg-accent/30 group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors">
                <BookMarked className="size-4 shrink-0" style={{ color: meta.color }} />
                <div className="min-w-0 flex-1">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1">
                    {r.title} <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                    <span className="text-muted-foreground text-[11px]">{meta.short}</span>
                  </div>
                </div>
                <button onClick={() => remove(r.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
