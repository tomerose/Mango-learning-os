"use client";

import * as React from "react";
import { BookOpen, Play, BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionBank } from "@/components/exam-mode/question-bank";
import { AIGenerateDialog } from "@/components/exam-mode/ai-generate-dialog";
import { ImportDialog } from "@/components/exam-mode/import-dialog";
import { ExercisePlayer } from "@/components/exam-mode/exercise-player";
import { ResultsPanel } from "@/components/exam-mode/results-panel";
import { useStore } from "@/lib/store";
import type { ExamQuestion, ExamResult, ExamResultDetail } from "@/lib/types";

// Local-only exam support (guest mode / offline)
const LOCAL_QUESTIONS_KEY = "mango-exam-questions-v1";
const LOCAL_RESULTS_KEY = "mango-exam-results-v1";

function loadLocal(key: string) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveLocal(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function ExamModeContent() {
  const { mode } = useStore();
  const guest = mode !== "cloud";
  const [tab, setTab] = React.useState("bank");

  // ── Questions state ──────────────────────────────────────
  const [questions, setQuestions] = React.useState<ExamQuestion[]>(() => loadLocal(LOCAL_QUESTIONS_KEY));
  const [questionLoading, setQuestionLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // ── Results state ────────────────────────────────────────
  const [results, setResults] = React.useState<ExamResult[]>(() => loadLocal(LOCAL_RESULTS_KEY));
  const [resultLoading, setResultLoading] = React.useState(true);

  // ── Practice session state ───────────────────────────────
  const [practiceQuestions, setPracticeQuestions] = React.useState<ExamQuestion[]>([]);
  const [inPractice, setInPractice] = React.useState(false);

  // Load from DB on mount
  React.useEffect(() => {
    async function load() {
      try {
        // Questions
        const qRes = await fetch("/api/exam/questions");
        if (qRes.ok) {
          const qData = await qRes.json();
          if (qData.questions?.length > 0) {
            setQuestions(qData.questions);
            saveLocal(LOCAL_QUESTIONS_KEY, qData.questions);
          }
        }
      } catch {}
      setQuestionLoading(false);

      try {
        // Results
        const rRes = await fetch("/api/exam/results");
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.results?.length > 0) {
            setResults(rData.results);
            saveLocal(LOCAL_RESULTS_KEY, rData.results);
          }
        }
      } catch {}
      setResultLoading(false);
    }
    load();
  }, []);

  // ── CRUD handlers ────────────────────────────────────────
  async function handleAddQuestion(q: Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">) {
    setSaving(true);
    const newQ: ExamQuestion = {
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local
    const next = [newQ, ...questions];
    setQuestions(next);
    saveLocal(LOCAL_QUESTIONS_KEY, next);

    // Try server
    try {
      const res = await fetch("/api/exam/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.question) {
          const merged = [d.question, ...questions];
          setQuestions(merged);
          saveLocal(LOCAL_QUESTIONS_KEY, merged);
        }
      }
    } catch {}
    setSaving(false);
  }

  function handleAddMany(addedQs: Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">[]) {
    if (addedQs.length === 0) return;
    const now = new Date().toISOString();
    const newQs: ExamQuestion[] = addedQs.map(q => ({
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    }));
    const next = [...newQs, ...questions];
    setQuestions(next);
    saveLocal(LOCAL_QUESTIONS_KEY, next);
    // Try to save to server in background (best-effort)
    for (const q of addedQs) {
      fetch("/api/exam/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
      }).catch(() => {});
    }
  }

  function handleUpdateQuestion(id: string, updates: Partial<ExamQuestion>) {
    const next = questions.map(q => q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q);
    setQuestions(next);
    saveLocal(LOCAL_QUESTIONS_KEY, next);
    if (!guest) {
      fetch(`/api/exam/questions/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
  }

  function handleDeleteQuestion(id: string) {
    const next = questions.filter(q => q.id !== id);
    setQuestions(next);
    saveLocal(LOCAL_QUESTIONS_KEY, next);
    if (!guest) {
      fetch(`/api/exam/questions/${id}`, { method: "DELETE" }).catch(() => {});
    }
  }

  function handleStartPractice(ids: string[]) {
    const qs = questions.filter(q => ids.includes(q.id));
    if (qs.length === 0) return;
    setPracticeQuestions(qs);
    setInPractice(true);
    setTab("practice");
  }

  async function handleSubmitAnswers(answers: { id: string; question: string; type: string; userAnswer: string; correctAnswer: string }[]) {
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: practiceQuestions[0]?.subject ?? "",
          topic: practiceQuestions[0]?.topic ?? "",
          questions: answers.map(a => ({ ...a, maxPoints: 4 })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newResult: ExamResult = {
          id: data.saved?.id ?? `r-${Date.now()}`,
          subject: practiceQuestions[0]?.subject ?? "",
          topic: practiceQuestions[0]?.topic ?? "",
          score: data.score,
          total: data.total,
          percentage: data.percentage,
          details: data.details,
          createdAt: new Date().toISOString(),
        };
        const next = [newResult, ...results];
        setResults(next);
        saveLocal(LOCAL_RESULTS_KEY, next);
        return data;
      }
    } catch {}
    return null;
  }

  function handleBackFromPractice() {
    setInPractice(false);
    setPracticeQuestions([]);
    setTab("bank");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">考试模式</h1>
        <p className="text-muted-foreground text-sm">
          个性化题库、智能评分、错题分析 —— 把焦虑变成准备
        </p>
      </header>

      {inPractice ? (
        <ExercisePlayer
          questions={practiceQuestions}
          onSubmit={handleSubmitAnswers}
          onBack={handleBackFromPractice}
        />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="bank"><BookOpen className="size-4" />题库</TabsTrigger>
            <TabsTrigger value="practice"><Play className="size-4" />练习</TabsTrigger>
            <TabsTrigger value="results"><BarChart3 className="size-4" />成绩</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="mt-4">
            {/* Quick toolbar for batch operations */}
            <div className="flex gap-2 mb-3">
              <AIGenerateDialog onAddMany={handleAddMany} disabled={saving} />
              <ImportDialog onAddMany={handleAddMany} defaultSubject="ai" disabled={saving} />
            </div>
            <QuestionBank
              questions={questions}
              onAdd={handleAddQuestion}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              onStartPractice={handleStartPractice}
              saving={saving}
              guest={guest}
            />
          </TabsContent>

          <TabsContent value="practice" className="mt-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <BookOpen className="size-10 opacity-40" />
                <div>
                  <p className="font-medium">开始练习</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    在「题库」中选择题目，点击「练习选中」开始答题。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <ResultsPanel
              results={results}
              loading={resultLoading}
              guest={guest}
              onRefresh={() => {
                const local = loadLocal(LOCAL_RESULTS_KEY);
                setResults(local);
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
