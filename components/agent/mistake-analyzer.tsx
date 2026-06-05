"use client";

import * as React from "react";
import {
  Search,
  Loader2,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId, QuizAttempt, WeakArea } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Mistake Analyzer — root cause analysis of wrong quiz answers.
// Shows recent low-performing attempts with per-mistake analysis
// powered by the AI agent.
// ─────────────────────────────────────────────────────────────

interface MistakeAnalyzerProps {
  subject: SubjectId;
  className?: string;
}

interface AnalysisResult {
  error: string | null;
  sections: {
    whatWentWrong: string;
    why: string;
    fix: string;
    practice: string;
  } | null;
}

// Threshold: attempts with accuracy <= this are considered "mistakes to analyze"
const MISTAKE_THRESHOLD = 70;

function MistakeEntry({
  attempt,
  subject,
}: {
  attempt: QuizAttempt;
  subject: SubjectId;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult>({
    error: null,
    sections: null,
  });

  async function analyze() {
    if (analyzing) return;
    setAnalyzing(true);
    setExpanded(true);
    setResult({ error: null, sections: null });

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          messages: [
            {
              role: "user",
              content: `请分析我以下测验中的错题，诊断思维误区：

学科：${attempt.subject}
主题：${attempt.topic}
总题数：${attempt.total}
正确数：${attempt.correct}
正确率：${Math.round((attempt.correct / attempt.total) * 100)}%

请按照以下格式分析：
1. 可能的思维误区（根因诊断）
2. 为什么会产生这个误区
3. 如何纠正（具体步骤）
4. 一个针对性的巩固练习建议

请用中文回答，简明扼要。`,
            },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => `请求失败 (${res.status})`);
        throw new Error(text || `请求失败 (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
      }

      // Parse the 4-section analysis
      const sections = parseAnalysis(acc);
      setResult({ error: null, sections });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "分析失败，请重试";
      setResult({ error: msg, sections: null });
    } finally {
      setAnalyzing(false);
    }
  }

  const accuracy = Math.round((attempt.correct / attempt.total) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingDown className="size-4 text-destructive shrink-0" />
              <span className="truncate">{attempt.topic}</span>
            </CardTitle>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant="outline" className="text-[10px]">
                {attempt.correct}/{attempt.total} 正确
              </Badge>
              <Progress
                value={accuracy}
                className="w-20 h-1.5"
                indicatorClassName={cn(
                  accuracy < 40
                    ? "bg-destructive"
                    : accuracy < 70
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                )}
              />
              <span
                className={cn(
                  "text-xs font-mono tabular-nums",
                  accuracy < 40
                    ? "text-destructive"
                    : accuracy < 70
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {accuracy}%
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!expanded && !result.sections && !result.error) {
                analyze();
              } else {
                setExpanded(!expanded);
              }
            }}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="size-3.5 mr-1 animate-spin" />
                分析中
              </>
            ) : expanded ? (
              <>
                <ChevronUp className="size-3.5 mr-1" />
                收起
              </>
            ) : (
              <>
                <Search className="size-3.5 mr-1" />
                分析根因
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Expanded analysis */}
      {expanded && (
        <CardContent className="pb-4 pt-0">
          {/* Error */}
          {result.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="size-3.5 inline mr-1.5" />
              {result.error}
            </div>
          )}

          {/* Loading */}
          {analyzing && !result.sections && !result.error && (
            <div className="space-y-2">
              <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-muted/50 animate-pulse" />
            </div>
          )}

          {/* Analysis sections */}
          {result.sections && (
            <div className="flex flex-col gap-3">
              {/* What went wrong */}
              <div className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2.5">
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-destructive mb-0.5">
                    思维误区
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.sections.whatWentWrong}
                  </p>
                </div>
              </div>

              {/* Why */}
              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/5 px-3 py-2.5">
                <Lightbulb className="size-4 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-0.5">
                    根因分析
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.sections.why}
                  </p>
                </div>
              </div>

              {/* How to fix */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary mb-0.5">
                    如何纠正
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.sections.fix}
                  </p>
                </div>
              </div>

              {/* Practice suggestion */}
              <div className="flex items-start gap-2 rounded-lg bg-emerald-500/5 px-3 py-2.5">
                <ArrowRight className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">
                    巩固练习
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.sections.practice}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Parse AI analysis response ───────────────────────────────

function parseAnalysis(raw: string): AnalysisResult["sections"] {
  const extract = (regex: RegExp, text: string): string => {
    const m = text.match(regex);
    return m ? m[1].trim() : "";
  };

  return {
    whatWentWrong:
      extract(/(?:可能的思维误区|1\.\s*可能的思维误区)[：:]\s*([\s\S]*?)(?=(?:\n\s*(?:为什么|2\.|如何纠正|3\.|巩固练习|4\.)|\s*$))/i, raw) ||
      extract(/(?:思维误区|误区诊断)[：:]\s*(.+)/i, raw) ||
      "未能解析",
    why:
      extract(/(?:为什么会产生这个误区|2\.\s*为什么[^：:]*)[：:]\s*([\s\S]*?)(?=(?:\n\s*(?:如何纠正|3\.|巩固练习|4\.)|\s*$))/i, raw) ||
      extract(/(?:根因|为什么)[：:]\s*(.+)/i, raw) ||
      "未能解析",
    fix:
      extract(/(?:如何纠正|3\.\s*如何纠正)[：:]\s*([\s\S]*?)(?=(?:\n\s*(?:巩固练习|4\.)|\s*$))/i, raw) ||
      extract(/(?:纠正方法|如何改进)[：:]\s*(.+)/i, raw) ||
      "未能解析",
    practice:
      extract(/(?:巩固练习建议|4\.\s*巩固[^：:]*)[：:]\s*([\s\S]*?)$/i, raw) ||
      extract(/(?:练习建议|巩固)[：:]\s*(.+)/i, raw) ||
      "未能解析",
  };
}

// ─────────────────────────────────────────────────────────────

export function MistakeAnalyzer({ subject, className }: MistakeAnalyzerProps) {
  const store = useStore();

  // Filter quiz attempts for this subject that have low accuracy
  const lowAttempts = React.useMemo(() => {
    return store.quizAttempts
      .filter((a) => {
        if (a.total <= 0) return false;
        const accuracy = Math.round((a.correct / a.total) * 100);
        return a.subject === subject && accuracy <= MISTAKE_THRESHOLD;
      })
      .slice(0, 10); // most recent first (quizAttempts is newest-first)
  }, [store.quizAttempts, subject]);

  // Also show weak areas that need attention
  const subjectWeakAreas: WeakArea[] = React.useMemo(
    () => store.weakAreas.filter((w) => w.subject === subject),
    [store.weakAreas, subject]
  );

  if (lowAttempts.length === 0 && subjectWeakAreas.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 py-12 text-center", className)}>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <CheckCircle2 className="size-5 text-primary" />
        </span>
        <div>
          <p className="text-sm font-medium">暂无错题需要分析</p>
          <p className="mt-1 text-xs text-muted-foreground">
            完成一些测验后，准确率较低的题目会自动出现在这里
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingDown className="size-4" />
        <span>
          {lowAttempts.length} 个低正确率测验，{subjectWeakAreas.length} 个薄弱领域
        </span>
      </div>

      {/* Weak areas overview */}
      {subjectWeakAreas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subjectWeakAreas.map((area) => (
            <Badge
              key={`${area.subject}::${area.topic}`}
              variant="secondary"
              className={cn(
                "text-xs",
                area.accuracy < 40
                  ? "bg-destructive/10 text-destructive"
                  : area.accuracy < 70
                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              )}
            >
              {area.topic} ({area.accuracy}%)
            </Badge>
          ))}
        </div>
      )}

      {/* Mistake entries */}
      {lowAttempts.map((attempt) => (
        <MistakeEntry
          key={attempt.id}
          attempt={attempt}
          subject={subject}
        />
      ))}
    </div>
  );
}
