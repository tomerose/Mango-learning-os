"use client";

import * as React from "react";
import { Send, Loader2, Wind, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message { role: "user" | "assistant"; content: string; }

const GREETING: Message = {
  role: "assistant",
  content: "嗨，我是小树。这里没有评判，只有倾听。今天想聊点什么？",
};

const PROMPTS = [
  "最近有点焦虑，想找人说说话",
  "今天发生了一件事让我很难受",
  "对未来感到很迷茫",
  "想知道怎么调整自己的情绪",
];

export function TreeHoleChat() {
  const [messages, setMessages] = React.useState<Message[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next); setInput(""); setStreaming(true);
    setMessages(m => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/treehole", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("失败");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
      }
    } catch { setMessages(m => m.slice(0, -1)); }
    finally { setStreaming(false); }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-14rem)] md:h-[calc(100dvh-12rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-2xl bg-muted/20 px-4 py-4">
        {messages.length === 1 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center">
              <Leaf className="size-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-base">心灵树洞</p>
              <p className="text-muted-foreground/60 text-sm mt-1">放心说，小树在听</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-left text-sm text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-xl px-4 py-2.5 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-background border rounded-bl-md shadow-sm text-foreground/85"}`}>
                  {m.content || (streaming && i === messages.length - 1 ? <Loader2 className="size-4 animate-spin" /> : null)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 mt-3">
        <Textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="想说什么都可以…" rows={1} className="min-h-11 max-h-32 resize-none rounded-xl" disabled={streaming} />
        <Button size="icon" onClick={() => send(input)} disabled={streaming || !input.trim()}
          className="size-11 shrink-0 rounded-xl bg-emerald-500 hover:bg-emerald-600">
          {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
