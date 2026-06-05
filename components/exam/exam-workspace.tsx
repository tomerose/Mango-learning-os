"use client";

import * as React from "react";
import {
  Search, Sparkles, Play, FileText, Loader2,
  CheckCircle2, Eye, BookOpen, Target, AlertTriangle,
  ExternalLink, Globe, Calendar, Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/lib/subjects";

import { ReviewBooklet } from "@/components/exam/review-booklet";
import { KnowledgeMapView } from "@/components/exam/knowledge-map-view";
import { PracticeSession } from "@/components/exam/practice-session";
import { MockExamPlayer } from "@/components/exam/mock-exam-player";
import { PredictedTopics } from "@/components/exam/predicted-topics";
import { RevisionSchedule } from "@/components/exam/revision-schedule";
import { PDFExportButton } from "@/components/exam/pdf-export-button";
import type { KnowledgeNode } from "@/components/exam/knowledge-map-view";
import type { PredictedTopic } from "@/components/exam/predicted-topics";
import type { RevisionDay } from "@/components/exam/revision-schedule";

// ─────────────────────────────────────────────────────────────
// ExamWorkspace V2 — 双标签：讲义生成 + 刷题训练
// 恢复 v1.0 风格：联网搜索资料入口，简洁卡片 UI
// ─────────────────────────────────────────────────────────────

interface Chapter {
  title: string;
  summary: string;
  keyPoints: string[];
  importance: "high" | "medium" | "low";
}

interface KeyPoint {
  topic: string;
  point: string;
  formula?: string;
}

interface CommonMistake {
  topic: string;
  mistake: string;
  correction: string;
}

interface MockQuestion {
  id: string;
  type: "mcq" | "fill_blank" | "problem";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface ExamPackage {
  knowledgeMap: KnowledgeNode[];
  chapters: Chapter[];
  keyPoints: KeyPoint[];
  commonMistakes: CommonMistake[];
  predictedTopics: PredictedTopic[];
  revisionSchedule: RevisionDay[];
  mockQuestions: MockQuestion[];
}

export function ExamWorkspace() {
  const { subjects } = useSubjects();

  // ── 主标签 ────────────────────────────────────────────
  const [mainTab, setMainTab] = React.useState<"lecture" | "practice">("lecture");

  // ── 讲义生成状态 ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState("");
  const [searchError, setSearchError] = React.useState("");

  const [urlInput, setUrlInput] = React.useState("");
  const [fetchingUrl, setFetchingUrl] = React.useState(false);
  const [urlContent, setUrlContent] = React.useState("");
  const [topicsInput, setTopicsInput] = React.useState("");
  const [uploadedFileTexts, setUploadedFileTexts] = React.useState<string[]>([]);

  const [examSubject, setExamSubject] = React.useState(subjects[0]?.id ?? "ai");
  const [examDate, setExamDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [durationMinutes, setDurationMinutes] = React.useState(60);

  const [generating, setGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [genError, setGenError] = React.useState("");
  const [examPackage, setExamPackage] = React.useState<ExamPackage | null>(null);

  // ── 刷题训练状态 ──────────────────────────────────────
  const [practiceMode, setPracticeMode] = React.useState<"practice" | "mock">("practice");
  const [practiceView, setPracticeView] = React.useState<"mode" | "playing">("mode");
  const [practiceResults, setPracticeResults] = React.useState<
    { questionId: string; isCorrect: boolean }[]
  >([]);

  // ── 审阅子标签 ────────────────────────────────────────
  const [reviewTab, setReviewTab] = React.useState("booklet");

  // ── 联网搜索资料 ──────────────────────────────────────
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResults("");

    try {
      const res = await fetch("/api/ai/exam-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), subject: examSubject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "搜索失败");
      setSearchResults(data.text || "");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "搜索失败，请重试");
    } finally {
      setSearching(false);
    }
  }

  // ── URL 抓取 ──────────────────────────────────────────
  async function handleFetchUrl() {
    if (!urlInput.trim()) return;
    setFetchingUrl(true);
    try {
      const res = await fetch("/api/notes/import/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "抓取失败");
      setUrlContent((prev) => prev + "\n\n" + (data.text || "").slice(0, 5000));
      setUrlInput("");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "URL 抓取失败");
    } finally {
      setFetchingUrl(false);
    }
  }

  // ── 生成讲义 ──────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    setGenerationProgress(0);
    setGenError("");

    const progressInterval = setInterval(() => {
      setGenerationProgress((p) => Math.min(p + 8, 90));
    }, 350);

    try {
      // 合并所有材料：搜索 + URL + 上传文件
      const materials: string[] = [];
      if (searchResults) materials.push(searchResults.slice(0, 8000));
      if (urlContent) materials.push(urlContent.slice(0, 8000));
      for (const ft of uploadedFileTexts) { if (ft) materials.push(ft.slice(0, 8000)); }

      // 主题：手动输入 + 搜索关键词
      const topics = [
        ...topicsInput.split(/[,;，；]/).map((s) => s.trim()).filter(Boolean),
        searchQuery.trim(),
      ].filter(Boolean);

      const res = await fetch("/api/ai/exam-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: examSubject,
          topics: topics.length > 0 ? topics : [examSubject],
          examDate,
          materials,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `服务器错误: ${res.status}`);
      }

      const data: ExamPackage = await res.json();
      setExamPackage(data);

      setTimeout(() => setGenerationProgress(0), 800);
    } catch (err) {
      clearInterval(progressInterval);
      setGenError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  // ── 刷题完成回调 ─────────────────────────────────────
  function handlePracticeFinish(results: { questionId: string; isCorrect: boolean }[]) {
    setPracticeResults(results);
    setPracticeView("mode");
  }

  // ── 导出项 ────────────────────────────────────────────
  const exportItems = React.useMemo(() => {
    if (!examPackage) return [];
    return [
      { label: "章节摘要", count: (examPackage?.chapters?.length ?? 0) },
      { label: "重点公式", count: examPackage.keyPoints.length },
      { label: "常见错误", count: examPackage.commonMistakes.length },
      { label: "练习题", count: (examPackage?.mockQuestions?.length ?? 0) },
      { label: "预测考点", count: examPackage.predictedTopics.length },
    ];
  }, [examPackage]);

  const subjectLabel = subjects.find((s) => s.id === examSubject)?.label ?? examSubject;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "lecture" | "practice")}>
        <TabsList className="w-full max-w-sm">
          <TabsTrigger value="lecture" className="flex-1">
            <FileText className="size-4" /> 讲义生成
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex-1" disabled={!examPackage}>
            <Play className="size-4" /> 刷题训练
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════
             Tab 1: 讲义生成
           ═══════════════════════════════════════════ */}
        <TabsContent value="lecture" className="mt-4">
          <div className="flex flex-col gap-6">

            {/* ── 顶部：搜索 + 配置 二合一卡片 ──────────── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  联网搜索 & 配置
                </CardTitle>
                <CardDescription>
                  输入主题关键词，AI 自动搜索相关资料生成复习讲义
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* 搜索行 */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="输入考试主题，如「Transformer 注意力机制」"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()} variant="secondary">
                    {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    <span className="ml-1.5 hidden sm:inline">AI 搜索资料</span>
                  </Button>
                </div>

                {/* 搜索结果展示 */}
                {searchError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                    <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
                {searchResults && (
                  <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="size-4 text-success" />
                      <span className="text-sm font-medium text-success">资料搜索完成</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                      {searchResults.slice(0, 600)}
                    </p>
                  </div>
                )}

                {/* URL 抓取 */}
                <div className="flex gap-2">
                  <Input
                    placeholder="或粘贴网页链接获取内容…"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                    className="text-sm"
                  />
                  <Button onClick={handleFetchUrl} disabled={fetchingUrl || !urlInput.trim()} variant="outline" size="sm">
                    {fetchingUrl ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
                    <span className="ml-1 hidden sm:inline">抓取</span>
                  </Button>
                </div>
                {urlContent && (
                  <p className="text-xs text-muted-foreground">
                    已抓取网页内容（{urlContent.length} 字符）
                  </p>
                )}

                {/* 文件上传 */}
                <div className="flex items-center gap-3">
                  <Label className="text-xs shrink-0">上传资料：</Label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.pptx"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const form = new FormData(); form.append("file", file);
                      const res = await fetch("/api/notes/import/file", { method: "POST", body: form });
                      const data = await res.json();
                      if (res.ok && data.text) {
                        setUploadedFileTexts((prev) => [...prev, data.text]);
                        setSearchError("");
                      } else {
                        setSearchError(data.error || "文件解析失败");
                      }
                    }}
                    className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1 file:text-xs"
                  />
                </div>
                {uploadedFileTexts.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    已上传 {uploadedFileTexts.length} 个文件
                    <button onClick={() => setUploadedFileTexts([])} className="ml-2 text-destructive hover:underline">清除</button>
                  </p>
                )}

                {/* 手动输入主题 */}
                <div className="space-y-1.5">
                  <Label className="text-xs">考试主题（逗号分隔）</Label>
                  <Input
                    placeholder="例如：消费者理论，市场结构，价格弹性"
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                  />
                </div>

                {/* 配置行 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs">学科</Label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Calendar className="size-3" /> 考试日期</Label>
                    <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Clock className="size-3" /> 模拟时长（分钟）</Label>
                    <Input type="number" min={10} max={240} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── 生成按钮 ──────────────────────────── */}
            <div className="flex flex-col items-center gap-3">
              <Button onClick={handleGenerate} disabled={generating} size="lg" className="px-8">
                {generating ? (
                  <><Loader2 className="size-4 animate-spin" /> 正在生成讲义…</>
                ) : (
                  <><Sparkles className="size-4" /> 生成复习讲义</>
                )}
              </Button>
              {generating && (
                <div className="w-full max-w-sm space-y-1">
                  <Progress value={generationProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-center">{generationProgress}%</p>
                </div>
              )}
              {genError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive w-full max-w-md text-center">
                  {genError}
                </div>
              )}
            </div>

            {/* ── 生成结果 ───────────────────────────── */}
            {examPackage && (
              <div className="flex flex-col gap-6">
                {/* 统计概览 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: BookOpen, label: "章节", value: (examPackage?.chapters?.length ?? 0) },
                    { icon: Target, label: "重点公式", value: examPackage.keyPoints.length },
                    { icon: Play, label: "练习题", value: (examPackage?.mockQuestions?.length ?? 0) },
                    { icon: Calendar, label: "复习天数", value: examPackage.revisionSchedule.length },
                  ].map((item) => (
                    <Card key={item.label}>
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        <item.icon className="size-5 text-primary" />
                        <div>
                          <p className="text-xl font-bold tabular-nums">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 预测考点 + 复习日程 */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <PredictedTopics
                    topics={examPackage.predictedTopics}
                    onStudyTopic={(topic) => {
                      const el = document.querySelector(`[data-topic="${topic.topic}"]`);
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                  <RevisionSchedule schedule={examPackage.revisionSchedule} examDate={examDate} />
                </div>

                {/* 讲义审阅：复习手册 | 知识图谱 */}
                <Tabs value={reviewTab} onValueChange={setReviewTab}>
                  <TabsList>
                    <TabsTrigger value="booklet"><Eye className="size-4" /> 复习手册</TabsTrigger>
                    <TabsTrigger value="knowledge"><Eye className="size-4" /> 知识图谱</TabsTrigger>
                  </TabsList>
                  <TabsContent value="booklet" className="mt-4">
                    <ReviewBooklet
                      subject={subjectLabel}
                      chapters={examPackage.chapters}
                      keyPoints={examPackage.keyPoints}
                      commonMistakes={examPackage.commonMistakes}
                      mockQuestions={examPackage.mockQuestions}
                    />
                  </TabsContent>
                  <TabsContent value="knowledge" className="mt-4">
                    <KnowledgeMapView
                      data={examPackage.knowledgeMap}
                      onNodeClick={(node) => console.log("Clicked:", node.label)}
                    />
                  </TabsContent>
                </Tabs>

                {/* 导出 */}
                <div className="flex justify-center">
                  <PDFExportButton
                    subject={subjectLabel}
                    items={exportItems}
                    variant="default"
                    size="lg"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════
             Tab 2: 刷题训练 — 自给自足，无需讲义
           ═══════════════════════════════════════════ */}
        <TabsContent value="practice" className="mt-4">
          {practiceView === "mode" ? (
            <div className="flex flex-col gap-6">
              {/* 模式选择 */}
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-8">
                  <Sparkles className="size-10 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold text-lg">开始刷题</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      共 {(examPackage?.mockQuestions?.length ?? 0)} 道题，覆盖 {(examPackage?.chapters?.length ?? 0)} 个章节
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={practiceMode === "practice" ? "default" : "outline"}
                      onClick={() => { setPracticeMode("practice"); setPracticeView("playing"); }}
                    >
                      <Play className="size-4" /> 练习模式
                    </Button>
                    <Button
                      variant={practiceMode === "mock" ? "default" : "outline"}
                      onClick={() => { setPracticeMode("mock"); setPracticeView("playing"); }}
                    >
                      <FileText className="size-4" /> 模拟考试
                    </Button>
                  </div>

                  {/* 上次结果 */}
                  {practiceResults.length > 0 && (
                    <div className="w-full max-w-xs rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">上次成绩</p>
                      <div className="flex items-center justify-center gap-2">
                        <Progress
                          value={Math.round((practiceResults.filter((r) => r.isCorrect).length / practiceResults.length) * 100)}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm font-mono tabular-nums">
                          {practiceResults.filter((r) => r.isCorrect).length}/{practiceResults.length}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : practiceMode === "practice" ? (
            <PracticeSession
              questions={examPackage?.mockQuestions ?? []}
              subject={examSubject}
              onFinish={handlePracticeFinish}
            />
          ) : (
            <MockExamPlayer
              questions={examPackage?.mockQuestions ?? []}
              subject={examSubject}
              durationMinutes={durationMinutes}
              onFinish={(score) => {
                setPracticeResults(
                  score.answers.map((a) => ({
                    questionId: a.questionId,
                    isCorrect: a.isCorrect,
                  }))
                );
                setPracticeView("mode");
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
