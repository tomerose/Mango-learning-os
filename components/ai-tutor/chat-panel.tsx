"use client";

import * as React from "react";
import { Send, Sparkles, Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getStarters(subject: string): string[] {
  const map: Record<string, string[]> = {
    ai: ["解释 Transformer 的自注意力机制", "什么是梯度消失，如何缓解？"],
    economics: ["消费者剩余和生产者剩余的区别", "解释价格弹性及其应用"],
    finance: ["DCF 估值的核心逻辑是什么？", "解释 CAPM 模型"],
    math: ["特征值和特征向量的几何意义", "解释中心极限定理"],
    english: ["雅思写作 Task 2 高分结构", "如何拆解长难句？"],
  };
  return map[subject] ?? [`解释「${subject}」的核心概念`, `关于「${subject}」的入门学习路径`];
}

export function ChatPanel() {
  const { subjects } = useSubjects();
  const [subject, setSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || `请求失败 (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "出错了，请重试";
      setError(msg);
      setMessages((m) => m.slice(0, -1)); // drop the empty assistant bubble
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] flex-col gap-4 md:h-[calc(100dvh-10rem)]">
      {/* Subject selector */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSubject(s.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              subject === s.id
                ? "border-transparent bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="bg-card flex-1 overflow-y-auto rounded-xl border p-4 md:p-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
              <Sparkles className="text-primary size-6" />
            </span>
            <div>
              <p className="font-medium">向 AI 导师提问</p>
              <p className="text-muted-foreground mt-1 text-sm">
                选择学科，输入问题，获得结构化讲解
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {getStarters(subject).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2 text-sm transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
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
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="输入你的问题…（Enter 发送，Shift+Enter 换行）"
          className="max-h-32 min-h-11 flex-1 resize-none"
          rows={1}
          disabled={streaming}
        />
        <Button
          size="icon"
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          aria-label="发送"
          className="size-11 shrink-0"
        >
          {streaming ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
