"use client";

import * as React from "react";
import { Save, Loader2, Tags, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

type MoodEmoji = "平静" | "平常" | "低落" | "烦躁" | "沉思";
type MoodLabel = "Calm" | "Neutral" | "Low" | "Irritated" | "Thoughtful";

interface MoodOption {
  emoji: MoodEmoji;
  label: MoodLabel;
  description: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { emoji: "平静", label: "Calm", description: "Feeling good" },
  { emoji: "平常", label: "Neutral", description: "Just okay" },
  { emoji: "低落", label: "Low", description: "Down or blue" },
  { emoji: "烦躁", label: "Irritated", description: "Frustrated" },
  { emoji: "沉思", label: "Thoughtful", description: "Deep in thought" },
];

// ─── Component ─────────────────────────────────────────────────

export function JournalEditor() {
  const { addReflection } = useStore();

  const [mood, setMood] = React.useState<MoodEmoji | null>(null);
  const [stress, setStress] = React.useState(5);
  const [motivation, setMotivation] = React.useState(5);
  const [body, setBody] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags((p) => p.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    setSaved(false);

    try {
      addReflection({
        mood: mood ?? "平常",
        body: [
          `Mood: ${mood ?? "unspecified"}`,
          `Stress: ${stress}/10`,
          `Motivation: ${motivation}/10`,
          tags.length ? `Tags: ${tags.join(", ")}` : "",
          "",
          body.trim(),
        ].join("\n"),
      });
      setSaved(true);
      setBody("");
      setTags([]);
      setMood(null);
      setStress(5);
      setMotivation(5);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silently handle — store handles persistence
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 pt-5">
        {/* Mood selector */}
        <div>
          <p className="text-xs font-medium text-fg-muted mb-2">
            How are you feeling?
          </p>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.emoji}
                onClick={() => setMood(mood === opt.emoji ? null : opt.emoji)}
                title={opt.description}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-2.5 rounded-xl transition-all text-2xl",
                  mood === opt.emoji
                    ? "bg-primary-subtle scale-110 ring-2 ring-primary/30"
                    : "hover:bg-bg-muted/50 opacity-70 hover:opacity-100"
                )}
              >
                {opt.emoji}
                <span className="text-[10px] text-fg-muted font-medium">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress & Motivation sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-fg-muted">
                Stress Level
              </label>
              <span className="text-xs font-semibold tabular-nums">
                {stress}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-bg-muted cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-sm"
            />
            <div className="flex justify-between text-[10px] text-fg-muted/50">
              <span>Calm</span>
              <span>Max</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-fg-muted">
                Motivation
              </label>
              <span className="text-xs font-semibold tabular-nums">
                {motivation}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={motivation}
              onChange={(e) => setMotivation(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-bg-muted cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-sm"
            />
            <div className="flex justify-between text-[10px] text-fg-muted/50">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Journal body */}
        <div>
          <label className="text-xs font-medium text-fg-muted mb-1.5 block">
            Journal Entry
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="今天有什么想写的？自由记录…"
            className="min-h-32 text-sm leading-relaxed resize-y"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-fg-muted mb-1.5 block">
            Tags (optional)
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="添加标签…"
              className="h-8 text-xs max-w-[200px]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              className="h-8 text-xs"
            >
              <Tags className="size-3 mr-1" /> Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1 text-[11px]"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving || !body.trim()}
          className="rounded-xl w-full"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="size-4 mr-2" /> Saved!
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" /> Save Journal
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
