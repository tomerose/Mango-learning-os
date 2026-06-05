"use client";

import * as React from "react";
import { Brain, Loader2, Sparkles, Lightbulb, Scale, ArrowRight, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface CBTResult {
  cognitiveDistortion: string;
  evidenceFor: string[];
  evidenceAgainst: string[];
  alternativeInterpretation: string;
  actionSuggestion: string;
}

// ─── Component ─────────────────────────────────────────────────

export function CbtReframer() {
  const [thought, setThought] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CBTResult | null>(null);
  const [error, setError] = React.useState("");

  async function handleReframe() {
    if (!thought.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/mind-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cbt-reframe",
          content: thought.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reframe failed");
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "CBT 重构失败"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 pt-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Brain className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">CBT Thought Reframer</h3>
            <p className="text-xs text-fg-muted">
              Challenge negative thinking patterns
            </p>
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="text-xs font-medium text-fg-muted mb-1.5 block">
            Write a negative thought you&apos;d like to reframe
          </label>
          <Textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="e.g., 'I always fail at everything I try' or 'Nobody really cares about me'"
            className="min-h-24 text-sm leading-relaxed resize-y"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleReframe}
          disabled={loading || !thought.trim()}
          className="rounded-xl w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="size-4 mr-2" /> Reframe This Thought
            </>
          )}
        </Button>

        {error && (
          <p className="text-destructive text-xs bg-destructive/5 rounded-lg p-2.5">
            {error}
          </p>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-3 mt-1 animate-in fade-in slide-in-from-top-2">
            {/* Cognitive Distortion */}
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3">
              <Scale className="size-4 text-purple-500 shrink-0" />
              <div>
                <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wide">
                  Cognitive Distortion
                </p>
                <Badge variant="destructive" className="mt-1">
                  {result.cognitiveDistortion}
                </Badge>
              </div>
            </div>

            {/* Evidence For / Against */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 dark:bg-red-950/10 rounded-xl p-3">
                <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide mb-1.5">
                  Evidence For
                </p>
                <ul className="space-y-1">
                  {result.evidenceFor.map((e, i) => (
                    <li
                      key={i}
                      className="text-xs text-fg-muted flex items-start gap-1"
                    >
                      <span className="text-red-400 mt-0.5">-</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/10 rounded-xl p-3">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide mb-1.5">
                  Evidence Against
                </p>
                <ul className="space-y-1">
                  {result.evidenceAgainst.map((e, i) => (
                    <li
                      key={i}
                      className="text-xs text-fg-muted flex items-start gap-1"
                    >
                      <span className="text-emerald-400 mt-0.5">-</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternative Interpretation */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="size-3.5 text-blue-500" />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
                  Alternative Interpretation
                </p>
              </div>
              <p className="text-sm leading-relaxed">
                {result.alternativeInterpretation}
              </p>
            </div>

            {/* Action Suggestion */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-900/30">
              <div className="flex items-center gap-2 mb-1.5">
                <ArrowRight className="size-3.5 text-emerald-500" />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                  Action Suggestion
                </p>
              </div>
              <p className="text-sm leading-relaxed">
                {result.actionSuggestion}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
