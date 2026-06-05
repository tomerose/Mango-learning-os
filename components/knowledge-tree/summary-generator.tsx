"use client";

import * as React from "react";
import { Sparkles, Loader2, Save, RotateCcw, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { SubjectId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Summary generator — AI generates a markdown summary from a
// knowledge node's content. Edit and save as a note.
// ─────────────────────────────────────────────────────────────

interface Props {
  topic: string;
  content: string;
  subject?: string;
  onClose: () => void;
}

export function SummaryGenerator({ topic, content, subject, onClose }: Props) {
  const { addNote } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<string>("");
  const [editing, setEditing] = React.useState(false);
  const [editedSummary, setEditedSummary] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/summary-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, content }),
      });
      const data = await res.json();
      const text = data.summary ?? "";
      setSummary(text);
      setEditedSummary(text);
    } catch {
      setError("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    setEditedSummary(summary);
    setEditing(true);
  }

  function cancelEditing() {
    setEditedSummary(summary);
    setEditing(false);
  }

  async function saveAsNote() {
    setSaving(true);
    try {
      const finalSummary = editing ? editedSummary : summary;
      addNote({
        title: `${topic} — AI 摘要`,
        subject: (subject as SubjectId) ?? "general",
        body: finalSummary,
        tags: ["AI摘要", topic],
      });
      onClose();
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  }

  function renderMarkdown(text: string) {
    // Simple markdown renderer for h2, h3, bold, lists, paragraphs
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-sm font-semibold mt-4 mb-2 first:mt-0">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="text-sm font-medium mt-3 mb-1 text-muted-foreground">
            {line.slice(4)}
          </h4>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.match(/^\d+\. /)) {
        return (
          <li key={i} className="text-sm text-muted-foreground ml-4 list-decimal">
            {line.replace(/^\d+\. /, "")}
          </li>
        );
      }
      // Bold
      const withBold = line.replace(/\*\*(.+?)\*\*/g, (_, text) => {
        return text; // We'll use a span
      });
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      // Handle inline bold with a simpler approach
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="size-10 text-primary animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">AI 正在生成摘要...</p>
            <p className="text-xs text-muted-foreground">分析「{topic}」的核心内容</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !summary) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-destructive">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateSummary}>
              <RotateCcw className="size-3.5" /> 重试
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          AI 摘要 · {topic}
        </CardTitle>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSummary(editedSummary);
                  setEditing(false);
                }}
              >
                <CheckIcon className="size-3.5" /> 确认
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={startEditing}>
                编辑
              </Button>
              <Button variant="ghost" size="sm" onClick={generateSummary}>
                <RotateCcw className="size-3.5" /> 重新生成
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={saveAsNote}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                保存为笔记
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(summary)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
