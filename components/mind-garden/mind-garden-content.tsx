"use client";

import * as React from "react";
import {
  Heart, Plus, Send, Loader2, Sparkles, Brain, TrendingUp,
  Calendar, Smile, Frown, Meh, Sun, Cloud, CloudRain, Zap,
  ArrowRight, Download, Upload, Trash2, ChevronDown, ChevronUp,
  Activity, BookOpen, Target, Moon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreeHoleChat } from "@/components/ai-tutor/treehole-chat";
import { Progress } from "@/components/ui/progress";
import { idb } from "@/lib/storage/idb";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────

interface JournalEntry {
  id: string; type: "emotion" | "reflection" | "cbt" | "weekly";
  content: string; createdAt: string;
  analysis?: MoodAnalysis | CBTAnalysis | WeeklySummary | null;
}
interface MoodRecord { id: string; date: string; mood: number; note: string; }
interface MoodAnalysis { mood: { primary: string; secondary: string; intensity: number }; summary: string; keyConcerns: string[]; reflection: string; suggestions: { title: string; detail: string; category: string }[]; }
interface CBTAnalysis { automaticThought: string; evidenceFor: string[]; evidenceAgainst: string[]; cognitiveDistortion: string; alternativeInterpretation: string; actionPlan: { immediate: string; shortTerm: string; longTerm: string }; affirmation: string; }
interface WeeklySummary { overallMood: string; weeklyTrend: { day: string; mood: number; note: string }[]; highlights: string[]; growthAreas: string[]; nextWeekFocus: string; quote: string; }

const MOOD_EMOJIS = [
  { value: 5, icon: Sun, label: "很好", color: "text-warning" },
  { value: 4, icon: Smile, label: "不错", color: "text-success" },
  { value: 3, icon: Meh, label: "一般", color: "text-info" },
  { value: 2, icon: Cloud, label: "不太好", color: "text-muted-foreground" },
  { value: 1, icon: CloudRain, label: "很差", color: "text-destructive" },
];

// ── Main Component ────────────────────────────────────────────

export function MindGardenContent({ embedded }: { embedded?: boolean }) {
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [moods, setMoods] = React.useState<MoodRecord[]>([]);
  const [tab, setTab] = React.useState(embedded ? "treehole" : "journal");
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [currentAnalysis, setCurrentAnalysis] = React.useState<MoodAnalysis | CBTAnalysis | WeeklySummary | null>(null);
  const [analysisType, setAnalysisType] = React.useState<"mood" | "cbt" | "weekly">("mood");
  const [selectedMood, setSelectedMood] = React.useState(0);
  const [expandedEntry, setExpandedEntry] = React.useState<string | null>(null);

  // Load from IndexedDB
  React.useEffect(() => {
    (async () => {
      try { setEntries(await idb.getAll("mind_garden_entries")); setMoods(await idb.getAll("mind_garden_moods")); }
      catch {}
    })();
  }, []);

  // ── Actions ─────────────────────────────────────────────────
  async function submit() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setCurrentAnalysis(null);

    const entry: JournalEntry = { id: `mg-${Date.now()}`, type: analysisType === "mood" ? "emotion" : analysisType, content: input.trim(), createdAt: new Date().toISOString() };

    try {
      entry.analysis = null;
      setCurrentAnalysis(null);
      const next = [entry, ...entries];
      setEntries(next);
      await idb.put("mind_garden_entries", entry);

      // If mood selected, save mood record
      if (selectedMood > 0) {
        const mr: MoodRecord = { id: `mood-${Date.now()}`, date: new Date().toISOString().slice(0, 10), mood: selectedMood, note: input.slice(0, 100) };
        const nextMoods = [mr, ...moods];
        setMoods(nextMoods);
        await idb.put("mind_garden_moods", mr);
      }
      setError("本地模式已保存记录；云端分析需要在隐私设置中明确开启。");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setLoading(false); setInput(""); setSelectedMood(0); }
  }

  async function exportData() {
    const blob = new Blob([JSON.stringify({ entries, moods, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mind-garden-backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (json.entries) { for (const e of json.entries) await idb.put("mind_garden_entries", e); setEntries(await idb.getAll("mind_garden_entries")); }
      if (json.moods) { for (const m of json.moods) await idb.put("mind_garden_moods", m); setMoods(await idb.getAll("mind_garden_moods")); }
    } catch { setError("Import failed — invalid file format"); }
  }

  // ── Mood chart data ─────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const moodChart = last7Days.map(date => {
    const found = moods.find(m => m.date === date);
    return { date: date.slice(5), mood: found?.mood ?? 0 };
  });

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="text-primary size-6" strokeWidth={2} /> Mind Garden
          </h1>
          <p className="text-muted-foreground/60 text-sm">个人反思 · 情绪支持 · 认知成长</p>
        </header>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {embedded && <TabsTrigger value="treehole"><Heart className="size-4 text-emerald-500" />树洞</TabsTrigger>}
          <TabsTrigger value="journal"><BookOpen className="size-4" />写日记</TabsTrigger>
          <TabsTrigger value="history"><Calendar className="size-4" />历史</TabsTrigger>
          <TabsTrigger value="insights"><Activity className="size-4" />洞察</TabsTrigger>
        </TabsList>

        {embedded && <TabsContent value="treehole" className="mt-4"><TreeHoleChat /></TabsContent>}

        {/* ── Journal Tab ─────────────────────────────────── */}
        <TabsContent value="journal" className="mt-4">
          <Card className="card-premium rounded-2xl">
            <CardContent className="flex flex-col gap-4 pt-5">
              {/* Analysis type selector */}
              <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
                {[
                  { id: "mood" as const, icon: Smile, label: "心情记录" },
                  { id: "cbt" as const, icon: Brain, label: "CBT 重构" },
                  { id: "weekly" as const, icon: Calendar, label: "每周总结" },
                ].map(a => (
                  <button key={a.id} onClick={() => setAnalysisType(a.id)}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                      analysisType === a.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                    <a.icon className="size-3.5" />{a.label}</button>
                ))}
              </div>

              {/* Mood selector */}
              <div className="flex justify-between gap-1">
                {MOOD_EMOJIS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button key={m.value} onClick={() => setSelectedMood(m.value === selectedMood ? 0 : m.value)}
                      className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                        selectedMood === m.value ? "bg-primary/10 scale-110 shadow-sm" : "hover:bg-accent/50 opacity-60 hover:opacity-100")}>
                      <Icon className={cn("size-6", m.color)} strokeWidth={selectedMood === m.value ? 2.5 : 1.5} />
                      <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Text input */}
              <Textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder={analysisType === "mood" ? "今天感觉怎么样？发生了什么？" : analysisType === "cbt" ? "描述一个困扰你的想法或情境…" : "回顾本周的经历、收获和感受…"}
                className="min-h-32 text-sm leading-relaxed" />

              {/* Submit */}
              <Button onClick={submit} disabled={loading || !input.trim()} className="rounded-xl w-full">
                {loading ? <><Loader2 className="size-4 animate-spin" />分析中…</> : <><Sparkles className="size-4" />{analysisType === "mood" ? "分析心情" : analysisType === "cbt" ? "CBT 重构" : "生成总结"}</>}
              </Button>
              {error && <p className="text-destructive text-xs">{error}</p>}
            </CardContent>
          </Card>

          {/* ── Analysis Result ──────────────────────────── */}
          {currentAnalysis && "mood" in (currentAnalysis as MoodAnalysis) && (
            <MoodResultCard data={currentAnalysis as MoodAnalysis} />
          )}
          {currentAnalysis && "cognitiveDistortion" in (currentAnalysis as CBTAnalysis) && (
            <CBTResultCard data={currentAnalysis as CBTAnalysis} />
          )}
          {currentAnalysis && "weeklyTrend" in (currentAnalysis as WeeklySummary) && (
            <WeeklyResultCard data={currentAnalysis as WeeklySummary} />
          )}
        </TabsContent>

        {/* ── History Tab ────────────────────────────────── */}
        <TabsContent value="history" className="mt-4">
          {entries.length === 0 ? (
            <div className="text-muted-foreground/50 text-center py-16 text-sm">还没有记录。开始写第一篇日记吧。</div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map(e => (
                <Card key={e.id} className="card-premium rounded-2xl cursor-pointer" onClick={() => setExpandedEntry(expandedEntry === e.id ? null : e.id)}>
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{{ emotion: "心情", reflection: "反思", cbt: "CBT", weekly: "每周" }[e.type]}</Badge>
                        <span className="text-muted-foreground/50 text-[11px]">{new Date(e.createdAt).toLocaleString("zh-CN")}</span>
                      </div>
                      {expandedEntry === e.id ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{e.content}</p>
                    {expandedEntry === e.id && e.analysis && (
                      <div className="border-t pt-3 mt-1 text-xs text-muted-foreground">
                        {"summary" in (e.analysis as MoodAnalysis) && <p>{(e.analysis as MoodAnalysis).summary}</p>}
                        {"cognitiveDistortion" in (e.analysis as CBTAnalysis) && <p>认知扭曲：{(e.analysis as CBTAnalysis).cognitiveDistortion}</p>}
                        {"overallMood" in (e.analysis as WeeklySummary) && <p>{(e.analysis as WeeklySummary).overallMood}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Export / Import */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={exportData}><Download className="size-3.5" />导出数据</Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild><span><Upload className="size-3.5" />导入备份</span></Button>
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </TabsContent>

        {/* ── Insights Tab ───────────────────────────────── */}
        <TabsContent value="insights" className="mt-4">
          {/* Mood trend mini-chart */}
          <Card className="card-premium rounded-2xl mb-4">
            <CardContent className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-2"><TrendingUp className="size-4 text-primary" /><span className="text-sm font-semibold">情绪趋势 (7天)</span></div>
              <div className="flex items-end gap-2 h-24">
                {moodChart.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-full transition-all duration-500"
                      style={{ height: `${Math.max(4, (d.mood / 5) * 100)}%`, backgroundColor: d.mood >= 4 ? "var(--success)" : d.mood >= 2 ? "var(--warning)" : "var(--destructive)", opacity: d.mood > 0 ? 1 : 0.2 }} />
                    <span className="text-[9px] text-muted-foreground">{d.date}</span>
                  </div>
                ))}
              </div>
              {moods.length === 0 && <p className="text-muted-foreground/50 text-xs text-center py-4">记录心情后，趋势图会在这里显示</p>}
            </CardContent>
          </Card>

          {/* Stats */}
          {moods.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="card-premium rounded-2xl"><CardContent className="py-3"><p className="text-muted-foreground text-xs">平均心情</p><p className="text-xl font-bold">{(moods.reduce((s,m) => s + m.mood, 0) / moods.length).toFixed(1)}</p></CardContent></Card>
              <Card className="card-premium rounded-2xl"><CardContent className="py-3"><p className="text-muted-foreground text-xs">日记数</p><p className="text-xl font-bold">{entries.length}</p></CardContent></Card>
              <Card className="card-premium rounded-2xl"><CardContent className="py-3"><p className="text-muted-foreground text-xs">CBT 练习</p><p className="text-xl font-bold">{entries.filter(e=>e.type==="cbt").length}</p></CardContent></Card>
              <Card className="card-premium rounded-2xl"><CardContent className="py-3"><p className="text-muted-foreground text-xs">本周记录</p><p className="text-xl font-bold">{entries.filter(e=>new Date(e.createdAt)>new Date(Date.now()-604800000)).length}</p></CardContent></Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Result Sub-components ─────────────────────────────────────

function MoodResultCard({ data }: { data: MoodAnalysis }) {
  return (
    <Card className="card-premium rounded-2xl border-primary/10 mt-4">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-2">
          <Badge variant="info">{data.mood.primary}</Badge>
          {data.mood.secondary && <Badge variant="secondary">{data.mood.secondary}</Badge>}
          <span className="text-xs text-muted-foreground">强度 {data.mood.intensity}/10</span>
        </div>
        <p className="text-sm leading-relaxed">{data.summary}</p>
        {data.keyConcerns.length > 0 && (
          <div className="flex flex-wrap gap-1.5">{data.keyConcerns.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
        )}
        <div className="bg-muted/30 rounded-xl p-3 text-sm leading-relaxed italic">{data.reflection}</div>
        {data.suggestions?.length > 0 && (
          <div className="grid gap-2">{data.suggestions.map((s,i) => (
            <div key={i} className="flex items-start gap-2 bg-muted/20 rounded-lg p-2.5">
              <Target className="size-3.5 text-primary mt-0.5 shrink-0" /><div><p className="text-xs font-semibold">{s.title}</p><p className="text-muted-foreground text-[11px]">{s.detail}</p></div>
            </div>
          ))}</div>
        )}
      </CardContent>
    </Card>
  );
}

function CBTResultCard({ data }: { data: CBTAnalysis }) {
  return (
    <Card className="card-premium rounded-2xl border-primary/10 mt-4">
      <CardContent className="flex flex-col gap-3 py-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase">自动想法</span>
          <p className="text-sm font-medium mt-0.5">{data.automaticThought}</p>
        </div>
        <div className="bg-muted/20 rounded-xl p-3">
          <span className="text-xs text-muted-foreground font-medium uppercase">认知扭曲</span>
          <Badge variant="destructive" className="ml-2">{data.cognitiveDistortion}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-success/5 rounded-xl p-2.5">
            <span className="text-[10px] text-success font-medium">支持的证据</span>
            {data.evidenceFor.map((e,i)=><p key={i} className="text-xs mt-1 text-muted-foreground">• {e}</p>)}
          </div>
          <div className="bg-destructive/5 rounded-xl p-2.5">
            <span className="text-[10px] text-destructive font-medium">反对的证据</span>
            {data.evidenceAgainst.map((e,i)=><p key={i} className="text-xs mt-1 text-muted-foreground">• {e}</p>)}
          </div>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
          <span className="text-xs text-primary font-medium uppercase">替代解释</span>
          <p className="text-sm mt-1 leading-relaxed">{data.alternativeInterpretation}</p>
        </div>
        <div className="grid gap-2">
          {Object.entries(data.actionPlan).map(([k,v]) => (
            <div key={k} className="flex items-start gap-2 bg-muted/20 rounded-lg p-2.5">
              <ArrowRight className="size-3.5 text-primary mt-0.5 shrink-0" />
              <div><span className="text-[10px] text-muted-foreground font-medium uppercase">{{immediate:"立即行动",shortTerm:"短期目标",longTerm:"长期方向"}[k]}</span><p className="text-xs mt-0.5">{v as string}</p></div>
            </div>
          ))}
        </div>
        <div className="text-center py-2">
          <p className="text-sm font-medium italic text-primary">{data.affirmation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyResultCard({ data }: { data: WeeklySummary }) {
  return (
    <Card className="card-premium rounded-2xl border-primary/10 mt-4">
      <CardContent className="flex flex-col gap-3 py-4">
        <p className="text-sm font-semibold">{data.overallMood}</p>
        <div className="flex gap-1">{data.weeklyTrend.map((d,i) => (
          <div key={i} className="flex-1 text-center"><p className="text-[9px] text-muted-foreground">{d.day}</p><div className="h-1 rounded-full mt-0.5" style={{backgroundColor: d.mood>=4?"var(--success)":d.mood>=2?"var(--warning)":"var(--destructive)"}} /></div>
        ))}</div>
        {data.highlights.length>0 && <div>{data.highlights.map((h,i)=><p key={i} className="text-xs text-muted-foreground">✦ {h}</p>)}</div>}
        <p className="text-xs text-muted-foreground"><span className="font-medium">下周方向：</span>{data.nextWeekFocus}</p>
        <p className="text-sm italic text-center text-primary font-medium">{data.quote}</p>
      </CardContent>
    </Card>
  );
}
