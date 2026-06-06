"use client";

import * as React from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Heart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface WeeklySummaryData {
  moodPattern: string;
  keyInsight: string;
  focusArea: string;
  weeklyEncouragement: string;
}

const PLACEHOLDER: WeeklySummaryData = {
  moodPattern: "开始写日记即可看到每周心情模式",
  keyInsight: "AI 分析你的日记后，洞察将在这里呈现",
  focusArea: "试试本周每天写一篇日记",
  weeklyEncouragement: "每一次反思都是更了解自己的一步，加油！",
};

// ─── Component ─────────────────────────────────────────────────

export function WeeklySummaryCard() {
  const { reflections, storagePreference } = useStore();
  const [summary, setSummary] = React.useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [generated, setGenerated] = React.useState(false);

  // Get this week's journal entries
  const thisWeekEntries = React.useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return reflections
      .filter((r) => {
        const d = new Date(r.dateLabel);
        if (isNaN(d.getTime())) return false;
        return d >= weekAgo && d <= now;
      })
      .map((r) => r.body);
  }, [reflections]);

  // Derive mood summary from reflections
  const moodSummary = React.useMemo(() => {
    if (reflections.length === 0) return "No mood data yet";
    const moods = reflections
      .map((r) => {
        const match = r.body.match(/Mood: ([平静平常😢😡🤔])/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    if (moods.length === 0) return "Not recorded";
    // Count frequencies
    const freq: Record<string, number> = {};
    moods.forEach((m) => {
      freq[m!] = (freq[m!] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    const labelMap: Record<string, string> = {
      "平静": "mostly positive",
      "平常": "neutral",
      "😢": "somewhat low",
      "😡": "frustrated",
      "🤔": "reflective",
    };
    return labelMap[top[0]] ?? "varied";
  }, [reflections]);

  async function generate() {
    if (loading) return;
    if (storagePreference !== "cloud") {
      setError("Local privacy mode is on. Journal entries were not sent to cloud AI.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/mind-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weekly-summary",
          journalEntries: thisWeekEntries,
          mood: moodSummary,
          privacyMode: "cloud",
          cloudConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSummary(data);
      setGenerated(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "生成摘要失败"
      );
    } finally {
      setLoading(false);
    }
  }

  const display = summary ?? PLACEHOLDER;

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/10">
      <CardContent className="flex flex-col gap-4 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Weekly Reflection</h3>
          </div>
          {!generated && thisWeekEntries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={generate}
              disabled={loading}
              className="rounded-lg text-xs h-8"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5 mr-1.5" /> Generate
                </>
              )}
            </Button>
          )}
          {generated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generate}
              disabled={loading}
              className="rounded-lg text-xs h-8"
            >
              <RefreshCw
                className={cn("size-3.5 mr-1.5", loading && "animate-spin")}
              />
              Regenerate
            </Button>
          )}
        </div>

        {error && (
          <p className="text-destructive text-xs bg-destructive/5 rounded-lg p-2.5">
            {error}
          </p>
        )}

        {/* Summary grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Mood Pattern */}
          <div className="flex items-start gap-2.5 bg-background/80 rounded-xl p-3">
            <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wide">
                Mood Pattern
              </p>
              <p className="text-sm mt-0.5 leading-relaxed">
                {display.moodPattern}
              </p>
            </div>
          </div>

          {/* Key Insight */}
          <div className="flex items-start gap-2.5 bg-background/80 rounded-xl p-3">
            <Lightbulb className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wide">
                Key Insight
              </p>
              <p className="text-sm mt-0.5 leading-relaxed">
                {display.keyInsight}
              </p>
            </div>
          </div>

          {/* Focus Area */}
          <div className="flex items-start gap-2.5 bg-background/80 rounded-xl p-3">
            <Target className="size-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wide">
                Focus Area
              </p>
              <p className="text-sm mt-0.5 leading-relaxed">
                {display.focusArea}
              </p>
            </div>
          </div>

          {/* Weekly Encouragement */}
          <div className="flex items-start gap-2.5 bg-background/80 rounded-xl p-3">
            <Heart className="size-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wide">
                Encouragement
              </p>
              <p className="text-sm mt-0.5 leading-relaxed italic">
                {display.weeklyEncouragement}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
