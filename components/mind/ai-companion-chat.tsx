"use client";

import * as React from "react";
import { Send, Loader2, Heart, Leaf, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

// ─── Types ─────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi there. I'm your companion here in the Mind Garden — no judgment, just a safe space to talk. How are you feeling today?",
};

const SUGGESTED_PROMPTS = [
  "最近考试压力很大，总感觉很焦虑…",
  "今天发生了一些让我不太开心的事",
  "我不太确定未来的方向是什么",
  "怎么才能对自己好一点？",
];

// ─── Component ─────────────────────────────────────────────────

export function AiCompanionChat() {
  const { storagePreference } = useStore();
  const [messages, setMessages] = React.useState<Message[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");

    // Always try the API — local mode just means we don't store to cloud
    setLoading(true);
    setMessages((m) => [...m, { role: "assistant", content: "…" }]);

    try {
      const res = await fetch("/api/ai/mind-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          content: trimmed,
          privacyMode: "cloud",
          cloudConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      // Replace placeholder with actual response
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: data.reply ?? "我在听，愿意多说说吗？",
        };
        return copy;
      });
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "连接有些困难，但我还在。想再试一次吗？",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <Card className="rounded-2xl overflow-hidden border-rose-200 dark:border-rose-900/30">
      <CardContent className="p-0 flex flex-col h-[calc(100dvh-20rem)] min-h-[400px]">
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-border bg-bg-subtle">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-accent flex items-center justify-center shadow-sm">
              <Heart className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Companion</p>
              <p className="text-[11px] text-muted-foreground">
                Your safe space to talk
              </p>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.length === 1 ? (
            /* Welcome state */
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-bg-muted flex items-center justify-center">
                <Leaf
                  className="size-10 text-rose-400"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="font-semibold text-base">Mind Garden Companion</p>
                <p className="text-muted-foreground/60 text-sm mt-1 max-w-xs">
                  Talk about anything — your feelings, worries, or just what&apos;s
                  on your mind
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-left text-sm text-muted-foreground hover:text-foreground
                      bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100/50 dark:hover:bg-rose-950/20
                      rounded-xl px-4 py-2.5 transition-colors border border-border"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat bubbles */
            <div className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-rose-500 text-white rounded-br-md"
                        : "bg-muted/60 border rounded-bl-md shadow-sm"
                    )}
                  >
                    {m.content || (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 border rounded-bl-md rounded-2xl px-4 py-2.5 shadow-sm">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="分享你的想法…"
              rows={1}
              className="min-h-11 max-h-32 resize-none rounded-xl border-rose-200 dark:border-rose-900/30 focus-visible:ring-rose-400"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="size-11 shrink-0 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
