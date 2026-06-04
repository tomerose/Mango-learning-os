"use client";

import * as React from "react";
import {
  BookMarked, Upload, Sparkles, Loader2, FileText, Download, Printer,
  CheckCircle2, AlertCircle, ChevronRight, Layers, Brain, Target, Zap,
  ListChecks, Lightbulb, Trash2, Eye, Moon, Sun,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSubjects } from "@/lib/subjects";
import { idb } from "@/lib/storage/idb";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ExamPackage {
  id: string; subject: string; topic: string; createdAt: string;
  data: GeneratedPackage;
}
interface GeneratedPackage {
  package: { title: string; subject: string; topic: string; overview: string };
  knowledgeMap: { description: string; nodes: { name: string; children: string[] }[] };
  chapters: { title: string; keyPoints: string[]; summary: string; commonMistakes: string[]; examples: { problem: string; solution: string; tips: string }[] }[];
  examPrep: { highFrequencyTopics: string[]; predictedQuestions: string[]; studyStrategy: string };
  cheatSheet: string;
}

// ── Component ─────────────────────────────────────────────────
export function ExamMasterContent() {
  const { subjects } = useSubjects();
  const [tab, setTab] = React.useState("create");
  const [packages, setPackages] = React.useState<ExamPackage[]>([]);
  const [subj, setSubj] = React.useState(subjects[0]?.id ?? "");
  const [topic, setTopic] = React.useState("");
  const [extra, setExtra] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [current, setCurrent] = React.useState<GeneratedPackage | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [packTab, setPackTab] = React.useState("overview");
  const [printMode, setPrintMode] = React.useState(false);

  React.useEffect(() => { (async () => { try { setPackages(await idb.getAll("exam_master_packages")); } catch {} })(); }, []);

  // ── File upload handler ────────────────────────────────────
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name); setLoading(true); setProgress(20);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("action", "parse-file");
      const res = await fetch("/api/exam-master", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setContent(data.text || ""); setProgress(50);
      setFileName(file.name + " ✓");
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setLoading(false); }
  }

  // ── Generate exam package ──────────────────────────────────
  async function generate() {
    if (!subj) { setError("请选择学科"); return; }
    setLoading(true); setError(""); setProgress(20); setCurrent(null);
    try {
      const res = await fetch("/api/exam-master", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", subject: subj, topic: topic.trim(), extra: extra.trim(), content }),
      });
      setProgress(70);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCurrent(data);
      setProgress(100);

      // Save to IndexedDB
      const pkg: ExamPackage = { id: `em-${Date.now()}`, subject: subj, topic: topic.trim(), createdAt: new Date().toISOString(), data };
      await idb.put("exam_master_packages", pkg);
      setPackages(prev => [pkg, ...prev]);
    } catch (err) { setError(err instanceof Error ? err.message : "Generation failed"); }
    finally { setLoading(false); setTab("view"); setPackTab("overview"); }
  }

  // ── Export ──────────────────────────────────────────────────
  function exportPDF() {
    if (!current) return;
    // Build printable HTML
    const html = buildPrintableHTML(current);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${current.package.title || "exam-package"}.html`;
    a.click(); URL.revokeObjectURL(url);
  }

  function printPackage() {
    if (!current) return;
    const w = window.open("", "_blank")!;
    w.document.write(buildPrintableHTML(current));
    w.document.close();
    setTimeout(() => w.print(), 500);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="text-primary size-6" strokeWidth={2} /> Final Exam Master
        </h1>
        <p className="text-muted-foreground/60 text-sm">结构化期末复习 · AI 生成完整备考资料包</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="create"><Sparkles className="size-4" />创建</TabsTrigger>
          <TabsTrigger value="view"><Eye className="size-4" />{current ? "当前结果" : "查看"}</TabsTrigger>
          <TabsTrigger value="history"><Layers className="size-4" />历史 ({packages.length})</TabsTrigger>
        </TabsList>

        {/* ── Create Tab ──────────────────────────────────── */}
        <TabsContent value="create" className="mt-4">
          <Card className="card-premium rounded-2xl">
            <CardContent className="flex flex-col gap-4 pt-5">
              {/* Subject + Topic */}
              <div className="flex gap-2">
                <select value={subj} onChange={e => setSubj(e.target.value)} className="rounded-xl border px-3 py-2 text-sm bg-background flex-1">
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="主题 / 课程名" className="flex-1" />
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 text-center flex flex-col items-center gap-2 hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="size-8 text-muted-foreground/30" />
                <p className="text-sm font-medium">上传课程资料</p>
                <p className="text-muted-foreground/50 text-xs">PDF / DOCX / PPT / TXT / MD / 图片</p>
                <input type="file" accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.jpg,.png,.jpeg" onChange={handleFile}
                  className="text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:text-xs file:font-medium" />
                {fileName && <p className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="size-3"/>{fileName}</p>}
              </div>

              {/* Or paste text */}
              <Textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="或者直接粘贴课程笔记、讲义内容…" className="min-h-24 text-sm" />

              {/* Extra instructions */}
              <Input value={extra} onChange={e => setExtra(e.target.value)}
                placeholder="额外要求（可选）如：侧重计算题、包含历年真题风格…" />

              {loading && <Progress value={progress} className="h-1.5" />}
              {error && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="size-3"/>{error}</p>}

              <Button onClick={generate} disabled={loading || !subj} className="rounded-xl w-full" size="lg">
                {loading ? <><Loader2 className="size-4 animate-spin"/>生成中…</> : <><Sparkles className="size-4"/>生成复习包</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── View Tab ────────────────────────────────────── */}
        <TabsContent value="view" className="mt-4">
          {!current ? (
            <div className="text-muted-foreground/50 text-center py-16 text-sm">先在「创建」中生成复习包。</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Sub-tabs for package sections */}
              <Tabs value={packTab} onValueChange={setPackTab}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="overview"><BookMarked className="size-3.5" />概览</TabsTrigger>
                  <TabsTrigger value="knowledge"><Brain className="size-3.5" />知识图谱</TabsTrigger>
                  <TabsTrigger value="chapters"><Layers className="size-3.5" />章节 ({current.chapters.length})</TabsTrigger>
                  <TabsTrigger value="exam"><Target className="size-3.5" />考试攻略</TabsTrigger>
                  <TabsTrigger value="cheatsheet"><Zap className="size-3.5" />速查表</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-3">
                  <Card className="card-premium rounded-2xl"><CardContent className="py-4">
                    <h3 className="font-bold text-lg">{current.package.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">{current.package.overview}</p>
                  </CardContent></Card>
                </TabsContent>

                <TabsContent value="knowledge" className="mt-3">
                  <Card className="card-premium rounded-2xl"><CardContent className="py-4">
                    <p className="text-sm text-muted-foreground mb-3">{current.knowledgeMap.description}</p>
                    <div className="grid gap-3">
                      {current.knowledgeMap.nodes.map((n, i) => (
                        <div key={i} className="bg-muted/20 rounded-xl p-3">
                          <p className="text-sm font-semibold">{n.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">{n.children.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                </TabsContent>

                <TabsContent value="chapters" className="mt-3">
                  <div className="flex flex-col gap-3">
                    {current.chapters.map((ch, i) => (
                      <Card key={i} className="card-premium rounded-2xl"><CardContent className="py-4 flex flex-col gap-3">
                        <h3 className="font-bold">{i + 1}. {ch.title}</h3>
                        <p className="text-sm text-muted-foreground">{ch.summary}</p>
                        {ch.keyPoints.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-primary">重点</span>
                            <ul className="mt-1 space-y-0.5">{ch.keyPoints.map((kp, j) => <li key={j} className="text-xs text-muted-foreground flex items-start gap-1"><CheckCircle2 className="size-3 text-success mt-0.5 shrink-0" />{kp}</li>)}</ul>
                          </div>
                        )}
                        {ch.commonMistakes.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-destructive">常见错误</span>
                            <ul className="mt-1 space-y-0.5">{ch.commonMistakes.map((cm, j) => <li key={j} className="text-xs text-muted-foreground flex items-start gap-1"><AlertCircle className="size-3 text-destructive mt-0.5 shrink-0" />{cm}</li>)}</ul>
                          </div>
                        )}
                        {ch.examples.map((ex, j) => (
                          <div key={j} className="bg-muted/20 rounded-xl p-3">
                            <p className="text-xs font-semibold">例题 {j + 1}</p>
                            <p className="text-sm mt-1 font-medium">{ex.problem}</p>
                            <div className="mt-2 bg-background/60 rounded-lg p-2.5">
                              <p className="text-xs font-semibold text-success">解答</p>
                              <p className="text-xs mt-0.5 text-muted-foreground whitespace-pre-wrap">{ex.solution}</p>
                            </div>
                            {ex.tips && <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1"><Lightbulb className="size-3 text-warning"/>{ex.tips}</p>}
                          </div>
                        ))}
                      </CardContent></Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="exam" className="mt-3">
                  <Card className="card-premium rounded-2xl"><CardContent className="py-4 flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-semibold text-primary">高频考点</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">{current.examPrep.highFrequencyTopics.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary">可能考题</span>
                      <ul className="mt-1.5 space-y-1">{current.examPrep.predictedQuestions.map((q, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5"><ChevronRight className="size-3.5 text-primary mt-0.5 shrink-0" />{q}</li>)}</ul>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <span className="text-xs font-semibold text-primary">复习策略</span>
                      <p className="text-sm mt-1 leading-relaxed">{current.examPrep.studyStrategy}</p>
                    </div>
                  </CardContent></Card>
                </TabsContent>

                <TabsContent value="cheatsheet" className="mt-3">
                  <Card className="card-premium rounded-2xl"><CardContent className="py-4">
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{current.cheatSheet}</pre>
                  </CardContent></Card>
                </TabsContent>
              </Tabs>

              {/* Export buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportPDF}><Download className="size-4" />导出 HTML</Button>
                <Button variant="outline" onClick={printPackage}><Printer className="size-4" />打印</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── History Tab ─────────────────────────────────── */}
        <TabsContent value="history" className="mt-4">
          {packages.length === 0 ? (
            <div className="text-muted-foreground/50 text-center py-16 text-sm">还没有生成过复习包。</div>
          ) : (
            <div className="flex flex-col gap-3">
              {packages.map(p => (
                <Card key={p.id} className="card-premium rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setCurrent(p.data); setTab("view"); setPackTab("overview"); }}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{p.data.package.title}</p>
                      <p className="text-muted-foreground text-[11px]">{p.subject} · {p.topic} · {new Date(p.createdAt).toLocaleString("zh-CN")}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Printable HTML builder ────────────────────────────────────
function buildPrintableHTML(pkg: GeneratedPackage): string {
  const ch = pkg.chapters.map((c, i) => `
    <section style="page-break-inside:avoid;margin-bottom:20px">
      <h2>${i + 1}. ${c.title}</h2>
      <p>${c.summary}</p>
      ${c.keyPoints.length ? `<h4>重点</h4><ul>${c.keyPoints.map(k => `<li>${k}</li>`).join("")}</ul>` : ""}
      ${c.commonMistakes.length ? `<h4 style="color:#dc2626">易错点</h4><ul>${c.commonMistakes.map(m => `<li>${m}</li>`).join("")}</ul>` : ""}
      ${c.examples.map(e => `<div style="background:#f4f4f5;padding:12px;border-radius:8px;margin:8px 0"><strong>例题：</strong>${e.problem}<br/><strong style="color:#16a34a">解答：</strong>${e.solution}</div>`).join("")}
    </section>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${pkg.package.title}</title>
<style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;line-height:1.6;color:#1e293b}
h1{font-size:24px;border-bottom:2px solid #4f46e5;padding-bottom:8px}h2{font-size:18px;color:#4f46e5;margin-top:24px}h3{font-size:15px}h4{font-size:13px;color:#64748b}
ul{padding-left:20px}li{margin:4px 0}pre{white-space:pre-wrap;font-family:inherit;background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0}
@media print{body{padding:0;font-size:12px}h1{font-size:20px}h2{font-size:16px}}</style></head><body>
<h1>${pkg.package.title}</h1><p>${pkg.package.overview}</p>
${ch}
<h2>速查表</h2><pre>${pkg.cheatSheet}</pre>
<h2>考试攻略</h2><p>${pkg.examPrep.studyStrategy}</p>
<p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:32px">Generated by Mango Learning OS · Final Exam Master</p>
</body></html>`;
}
