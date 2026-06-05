"use client";

import * as React from "react";
import { Zap, Loader2, CheckCircle2, Edit3, RotateCcw, Save, Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Flashcard } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Flashcard generator — generates flashcards from a knowledge
// node via AI. Shows preview grid, allows approve/edit/regenerate
// per card, and saves to the store.
// ─────────────────────────────────────────────────────────────

export interface GeneratedCard {
  front: string;
  back: string;
  deck: string;
  subject: string;
}

interface Props {
  topic: string;
  content: string;
  subject?: string;
  existingNodeId?: string;
  onClose: () => void;
}

type CardState = "approved" | "editing" | "pending";

interface CardWithState extends GeneratedCard {
  id: string;
  state: CardState;
}

export function FlashcardGenerator({ topic, content, subject, onClose }: Props) {
  const { addNote } = useStore(); // We'll save via addNote with flashcard data
  const [loading, setLoading] = React.useState(false);
  const [cards, setCards] = React.useState<CardWithState[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(new Set());

  // Generate on mount
  React.useEffect(() => {
    generateCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateCards() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/flashcard-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, content, count: 5, subject }),
      });
      const data = await res.json();
      const generated: GeneratedCard[] = data.flashcards ?? [];
      setCards(
        generated.map((c, i) => ({
          ...c,
          id: `gen-fc-${Date.now()}-${i}`,
          state: "pending" as CardState,
        }))
      );
    } catch {
      setError("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function updateCard(id: string, field: "front" | "back", value: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function approveCard(id: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: "approved" } : c))
    );
  }

  function editCard(id: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: "editing" } : c))
    );
  }

  function toggleFlip(id: string) {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveAll() {
    setSaving(true);
    try {
      // Save each approved card as a note (flashcards are managed via the store's flashcard list)
      // We create a note for each card and also prepare flashcard data
      const approvedCards = cards.filter((c) => c.state === "approved");
      for (const card of approvedCards) {
        // Use addNote to save the flashcard content as a note
        addNote({
          title: card.front,
          subject: (card.subject as Flashcard["subject"]) ?? subject ?? "general",
          body: card.back,
          tags: [card.deck, "flashcard", topic],
        });
      }
      onClose();
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  }

  const approvedCount = cards.filter((c) => c.state === "approved").length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">AI 正在生成闪卡...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-destructive">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateCards}>
              <RotateCcw className="size-3.5" /> 重新生成
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
          <Zap className="size-4" />
          生成闪卡 · {topic}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={generateCards} disabled={loading}>
            <RotateCcw className="size-3.5" /> 重新生成
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={saveAll}
            disabled={approvedCount === 0 || saving}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            保存全部 ({approvedCount})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {cards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isEditing = card.state === "editing";

          return (
            <div
              key={card.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                card.state === "approved"
                  ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
                  : "bg-card"
              )}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">问题面 (Front)</label>
                  <Textarea
                    value={card.front}
                    onChange={(e) => updateCard(card.id, "front", e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <label className="text-xs font-medium text-muted-foreground">答案面 (Back)</label>
                  <Textarea
                    value={card.back}
                    onChange={(e) => updateCard(card.id, "back", e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approveCard(card.id)}
                    >
                      <CheckCircle2 className="size-3.5" /> 确认
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {card.deck}
                    </Badge>
                    {card.state === "approved" && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-500/50">
                        <CheckCircle2 className="size-2.5 mr-0.5" />
                        已确认
                      </Badge>
                    )}
                    <div className="flex-1" />
                    <button
                      className="text-muted-foreground hover:text-foreground p-0.5"
                      onClick={() => toggleFlip(card.id)}
                      title={isFlipped ? "隐藏答案" : "显示答案"}
                    >
                      {isFlipped ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => editCard(card.id)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    {card.state !== "approved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-green-600"
                        onClick={() => approveCard(card.id)}
                      >
                        <CheckCircle2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">问题</span>
                      <p className="text-sm mt-0.5">{card.front}</p>
                    </div>
                    {isFlipped && (
                      <div>
                        <div className="bg-border h-px my-2" />
                        <span className="text-xs text-muted-foreground font-medium">答案</span>
                        <p className="text-sm text-muted-foreground mt-0.5">{card.back}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
