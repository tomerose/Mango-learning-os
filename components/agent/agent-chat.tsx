"use client";

import * as React from "react";
import { Send, Sparkles, Loader2, AlertCircle, Bot } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId, WeakArea } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Agent Chat — context-aware streaming chat for the Learning Agent.
// POSTs to /api/ai/agent with subject + messages + learning context
// and renders the SSE stream as a conversation.
// ─────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatProps {
  subject: SubjectId;
  onConversationUpdate?: (messages: Message[]) => void;
  className?: string;
}

function getEmptyPlaceholder(subjectLabel: string): { title: string; desc: string } {
  return {
    title: `向 ${subjectLabel} 学习助手提问`,
    desc: "我会记住你的学习进度，给出个性化讲解与练习建议",
  };
}

function buildContextPayload(
  subject: SubjectId,
  weakAreas: WeakArea[],
  recentTopics: string[],
  goals: string[]
) {
  return {
    weakAreas: weakAreas.filter((w) => w.subject === subject).slice(0, 5),
    goals: goals.slice(0, 5),
    recentTopics: recentTopics.slice(0, 10),
  };
}

export function AgentChat({ subject, onConversationUpdate, className }: AgentChatProps) {
  const store = useStore();
  const { getMeta } = useSubjects();
  const subjectMeta = getMeta(subject);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Derive context from store
  const recentTopics = React.useMemo(() => {
    const seen = new Set<string>();
    const topics: string[] = [];
    for (const qa of store.quizAttempts) {
      const key = `${qa.subject}::${qa.topic}`;
      if (!seen.has(key)) {
        seen.add(key);
        topics.push(qa.topic);
      }
    }
    return topics.slice(0, 10);
  }, [store.quizAttempts]);

  // Derive active goals from tasks (undone, high-priority)
  const goals = React.useMemo(() => {
    return store.tasks
      .filter((t) => !t.done && t.priority === "high")
      .slice(0, 5)
      .map((t) => t.title);
  }, [store.tasks]);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  // Notify parent when messages change
  React.useEffect(() => {
    onConversationUpdate?.(messages);
  }, [messages, onConversationUpdate]);

  // Listen for suggestion events from AgentSuggestions — fills input
  React.useEffect(() => {
    function handleSuggestion(e: Event) {
      const detail = (e as CustomEvent<{ prompt: string }>).detail;
      if (detail?.prompt) {
        setInput(detail.prompt);
        // Focus the textarea via the input state change
        const textarea = document.querySelector(
          '[data-agent-chat-input]'
        ) as HTMLTextAreaElement | null;
        textarea?.focus();
      }
    }
    window.addEventListener("agent:suggestion", handleSuggestion);
    return () => window.removeEventListener("agent:suggestion", handleSuggestion);
  }, []);

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
    // Add empty assistant bubble for streaming
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const context = buildContextPayload(subject, store.weakAreas, recentTopics, goals);

      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          messages: nextMessages,
          context,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => `请求失败 (${res.status})`);
        throw new Error(errText || `请求失败 (${res.status})`);
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
      // Remove the empty assistant bubble on error
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const placeholder = getEmptyPlaceholder(subjectMeta.label);

  return (
    <div className={cn("flex flex-col h-full gap-3", className)}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 md:p-5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="size-6 text-primary" />
            </span>
            <div>
              <p className="font-medium">{placeholder.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {placeholder.desc}
              </p>
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
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {m.content ? (
                    // Render markdown content with basic formatting
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-background [&_pre]:rounded-md [&_pre]:p-3 [&_code]:text-xs [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(m.content),
                      }}
                    />
                  ) : streaming && i === messages.length - 1 ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span className="text-xs">思考中...</span>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 shrink-0">
        <Textarea
          data-agent-chat-input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
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

// ─── Lightweight Markdown → HTML ──────────────────────────────
// Does NOT pull in a full MD parser dependency.
// Escapes HTML then applies safe regex conversions.

function formatMarkdown(md: string): string {
  let s = escapeHtml(md);

  // Code blocks: ```...```
  s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre><code class="language-${escapeHtml(lang || "plaintext")}">${escaped}</code></pre>`;
  });

  // Inline code: `...`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold: **...**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic: *...* (but not **)
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  // Inline math: $...$
  s = s.replace(/\$(.+?)\$/g, "<code class=\"math\">$1</code>");

  // Headings: ### Title
  s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.+)$/gm, "<h3>$1</h3>");

  // Unordered lists: - item or * item
  s = s.replace(/^[*-] (.+)$/gm, "<li>$1</li>");
  // Wrap consecutive <li> in <ul>
  s = s.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Numbered lists: 1. item
  s = s.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs: blank line → <br/>
  s = s.replace(/\n\n+/g, "<br/><br/>");

  // Single newlines within paragraphs → nothing (already handled)

  return s;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}
