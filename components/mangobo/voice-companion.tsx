"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// 芒宝 Voice Companion — Lightweight Live2D-Style AI Pet
// Inspired by Open-LLM-VTuber (github.com/Open-LLM-VTuber/Open-LLM-VTuber)
// CSS animation float + breathe + expression switch + speech bubble
// ═══════════════════════════════════════════════════════════════

interface Message {
  role: "user" | "mangobo";
  text: string;
}

const GREETINGS = [
  "嗨！我是芒宝 🥭 今天想学点什么？",
  "你好呀～有什么我可以帮你的吗？",
  "嘿！准备好学习了没？一起加油！",
];

const EXPRESSIONS = ["😊", "🤔", "✨", "🥭", "💡", "🎉"];

export function MangoboVoiceCompanion() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "mangobo", text: GREETINGS[Math.floor(Math.random() * GREETINGS.length)] },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [expression, setExpression] = React.useState("🥭");
  const [isListening, setIsListening] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cycle expression randomly
  React.useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setExpression(EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(m => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setExpression("🤔");

    try {
      // Use the AI companion API
      const res = await fetch("/api/ai/mind-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", content: trimmed, source: "mangobo" }),
      });
      const data = await res.json();
      const reply = data.output?.body ?? data.content ?? data.message ?? "嗯嗯，我在听～";

      setMessages(m => [...m, { role: "mangobo", text: reply }]);
      setExpression("✨");
    } catch {
      setMessages(m => [...m, { role: "mangobo", text: "啊呀，网络不太好…稍等一下再试？" }]);
      setExpression("😊");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-20 right-4 z-40 size-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300",
          open
            ? "bg-surface border border-border rotate-45 scale-90"
            : "bg-gradient-to-br from-amber-400 to-orange-500 hover:scale-105 animate-float"
        )}
      >
        {open ? (
          <X className="size-5 text-fg-muted -rotate-45" />
        ) : (
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            🥭
          </motion.span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-36 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-border/30">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="size-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-sm"
              >
                {expression}
              </motion.div>
              <div>
                <p className="text-sm font-semibold font-serif">芒宝</p>
                <p className="text-[10px] text-fg-muted/90">AI 学习伴侣 · 随时陪伴</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-[280px] overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-bg-subtle/50">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "mangobo" && (
                    <span className="text-lg shrink-0 mt-0.5">🥭</span>
                  )}
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 max-w-[85%] text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-surface border border-border/50 rounded-bl-md"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <span className="text-lg">🥭</span>
                  <div className="bg-surface border border-border/50 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-border/30 bg-surface">
              <button
                onClick={() => setIsListening(!isListening)}
                className={cn("size-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                  isListening ? "bg-red-100 text-red-500" : "text-fg-muted/80 hover:text-fg-muted"
                )}
              >
                <Mic className="size-4" />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="和芒宝说点什么…"
                className="flex-1 h-9 rounded-xl border border-border/50 bg-bg-subtle px-3 text-[13px] focus:outline-none focus:border-primary/30"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="size-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0"
              >
                <Sparkles className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
