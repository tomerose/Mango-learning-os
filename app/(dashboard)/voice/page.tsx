"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, MicOff, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/page-transition";
import { BUILTIN_PERSONAS, DEFAULT_IDENTITIES, type VoicePersona } from "@/lib/ai/identity-engine";

/* ═══════════════════════════════════════════════════════════════
   Mango Voice v2 — Full Conversation Loop
   STT → AI (with persona prompt) → TTS → repeat
   ═══════════════════════════════════════════════════════════════ */

const WAVE_BARS = 24;

// Persona voice configs
const VOICE_CONFIGS: Record<string, { pitch: number; rate: number; lang: string }> = {
  "ielts-examiner": { pitch: 1.0, rate: 0.95, lang: "en-GB" },
  "korean-teacher": { pitch: 1.15, rate: 0.85, lang: "ko-KR" },
  "ai-mentor": { pitch: 1.0, rate: 0.95, lang: "zh-CN" },
  "startup-advisor": { pitch: 1.05, rate: 1.0, lang: "zh-CN" },
  "research-supervisor": { pitch: 0.95, rate: 0.9, lang: "zh-CN" },
};

interface Turn { role: "user" | "assistant"; text: string; }

function VoicePageInner() {
  const searchParams = useSearchParams();
  const identityParam = searchParams.get("identity");

  const [activePersona, setActivePersona] = React.useState<VoicePersona>(BUILTIN_PERSONAS[0]);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isThinking, setIsThinking] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [conversation, setConversation] = React.useState<Turn[]>([]);
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array.from({ length: WAVE_BARS }, () => 8));
  const [greeted, setGreeted] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const recogRef = React.useRef<any>(null);
  const convRef = React.useRef<Turn[]>([]);

  // Keep ref in sync for async callbacks
  React.useEffect(() => { convRef.current = conversation; }, [conversation]);

  // Init speech APIs
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = false; // Stop after each utterance for turn-based
      r.interimResults = true;
      r.lang = "zh-CN";
      r.onresult = (e: any) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setTranscript(t);
        // If final result, process
        if (e.results[0]?.isFinal) {
          handleUserSpeech(t);
        }
      };
      r.onerror = () => { setIsListening(false); setStatus("语音识别出错，请重试"); };
      r.onend = () => { setIsListening(false); };
      recogRef.current = r;
    }
  }, []);

  // Auto-select identity
  React.useEffect(() => {
    if (identityParam) {
      const identity = DEFAULT_IDENTITIES.find(i => i.id === identityParam);
      if (identity) setActivePersona(identity.persona);
    }
  }, [identityParam]);

  // Auto-greet
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!greeted) greetUser();
    }, 800);
    return () => clearTimeout(timer);
  }, [greeted, activePersona.id]);

  function greetUser() {
    const greeting = "Hello，我是芒宝，有什么我可以帮到你的吗？";
    setConversation([{ role: "assistant", text: greeting }]);
    speak(greeting);
    setGreeted(true);
  }

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const cfg = VOICE_CONFIGS[activePersona.id] ?? { pitch: 1.0, rate: 0.95, lang: "zh-CN" };
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = cfg.lang;
    utter.rate = cfg.rate;
    utter.pitch = cfg.pitch;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }

  async function handleUserSpeech(userText: string) {
    if (!userText.trim() || isThinking) return;
    setIsListening(false);
    setIsThinking(true);
    setStatus("芒宝正在思考...");

    // Add user turn
    const newConv: Turn[] = [...convRef.current, { role: "user", text: userText }];
    setConversation(newConv);

    try {
      // Call AI with persona prompt
      const messages = [
        { role: "system", content: activePersona.prompt },
        ...newConv.map(t => ({ role: t.role as "user" | "assistant", content: t.text })),
      ];

      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "general", messages }),
      });

      if (!res.ok || !res.body) throw new Error("AI unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += decoder.decode(value, { stream: true });
        setStatus("芒宝正在回答...");
      }

      // Add AI response
      const aiText = responseText.trim() || "抱歉，我没有理解你的意思，可以再说一遍吗？";
      const finalConv: Turn[] = [...newConv, { role: "assistant", text: aiText }];
      setConversation(finalConv);
      setStatus("");

      // Speak the response
      speak(aiText);
    } catch {
      setStatus("网络出错了，请重试");
    } finally {
      setIsThinking(false);
      setTranscript("");
    }
  }

  function toggleListening() {
    if (isListening) {
      setIsListening(false);
      recogRef.current?.stop();
    } else {
      if (!recogRef.current) {
        setStatus("你的浏览器不支持语音识别，请使用 Chrome 或 Edge");
        return;
      }
      synthRef.current?.cancel();
      setIsListening(true);
      setTranscript("");
      setStatus("正在聆听...");
      recogRef.current.start();
    }
  }

  // Wave animation
  React.useEffect(() => {
    if (!isListening && !isSpeaking && !isThinking) {
      setWaveHeights(Array.from({ length: WAVE_BARS }, () => 8));
      return;
    }
    const id = setInterval(() => {
      setWaveHeights(Array.from({ length: WAVE_BARS }, () => {
        const base = 8 + Math.random() * 32;
        const cf = 1 - Math.abs((WAVE_BARS / 2 - Math.floor(Math.random() * WAVE_BARS)) / (WAVE_BARS / 2)) * 0.5;
        return base + cf * 20;
      }));
    }, 120);
    return () => clearInterval(id);
  }, [isListening, isSpeaking, isThinking]);

  return (
    <PageTransition>
      <motion.div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0C0C0D 0%, #1A1512 50%, #0C0C0D 100%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Ambient blobs */}
        <motion.div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(197,139,116,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity }} />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
          <a href="/agent" className="size-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ChevronLeft className="size-5 text-white/70" />
          </a>
          <span className="text-sm text-white/50">Mango Voice</span>
          <div className="size-10" />
        </div>

        {/* Persona chips */}
        <div className="absolute top-20 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto scrollbar-none z-10">
          {DEFAULT_IDENTITIES.map(id => (
            <button key={id.id} onClick={() => { setActivePersona(id.persona); setConversation([]); setGreeted(false); }}
              className={cn("shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors",
                activePersona.id === id.persona.id ? "bg-white/15 text-white border border-white/20" : "bg-white/5 text-white/50 border border-white/5")}>
              <span className="size-2.5 rounded-full" style={{ backgroundColor: id.id === "ielts-candidate" ? "#C58B74" : id.id === "ai-engineer" ? "#7B8FCA" : "#8A9E8B" }} />
              {id.name}
            </button>
          ))}
        </div>

        {/* Conversation history */}
        <div className="absolute top-32 bottom-52 left-0 right-0 overflow-y-auto px-6 flex flex-col gap-3">
          {conversation.map((turn, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                turn.role === "user"
                  ? "self-end bg-white/10 text-white/90"
                  : "self-start bg-white/5 text-white/80 border border-white/10")}>
              {turn.text}
            </motion.div>
          ))}
          {isThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="self-start bg-white/5 rounded-2xl px-4 py-3 text-sm text-white/50 border border-white/10 flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> {status || "芒宝正在思考..."}
            </motion.div>
          )}
        </div>

        {/* Center Orb */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
          <motion.div className="size-48 rounded-full border border-white/10"
            animate={{ scale: isListening ? [1, 1.15, 1] : 1, opacity: isListening ? [0.3, 0.8, 0.3] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute size-36 rounded-full border border-white/5"
            animate={{ scale: isListening ? [1, 1.08, 1] : 1, opacity: isListening ? [0.5, 1, 0.5] : 0.5 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} />

          <motion.button onClick={toggleListening} disabled={isThinking}
            className="absolute size-24 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{ background: isListening ? "radial-gradient(circle at 40% 35%, rgba(220,80,60,0.8) 0%, rgba(200,60,40,0.6) 50%, rgba(180,40,30,0.4) 100%)" : "radial-gradient(circle at 40% 35%, rgba(197,139,116,0.8) 0%, rgba(180,120,100,0.6) 50%, rgba(160,100,80,0.4) 100%)" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: isListening ? "0 0 40px rgba(220,80,60,0.5)" : "0 0 20px rgba(197,139,116,0.2)" }}>
            {isListening ? <MicOff className="size-10 text-white" /> : <Mic className="size-10 text-white" />}
          </motion.button>

          {/* Waveform */}
          <div className="flex items-end gap-[2px] h-16">
            {waveHeights.map((h, i) => (
              <motion.div key={i} className="w-1 rounded-full" style={{ backgroundColor: "rgba(197,139,116,0.7)" }}
                animate={{ height: h }} transition={{ duration: 0.12 }} />
            ))}
          </div>

          <div className="text-center">
            <p className="text-base font-medium text-white/90">
              {isListening ? "正在聆听..." : isThinking ? "芒宝思考中..." : isSpeaking ? "芒宝正在回答..." : "点击开始对话"}
            </p>
            <p className="text-sm text-white/40 mt-1">{activePersona.name} · {activePersona.role}</p>
            {transcript && !isThinking && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-white/70 mt-2 bg-white/5 rounded-xl px-3 py-2">{transcript}</motion.p>
            )}
          </div>
        </div>

        <div className="absolute bottom-16 text-center px-8">
          <p className="text-xs text-white/25">{activePersona.teachingStyle}</p>
          {status && !isListening && <p className="text-xs text-white/40 mt-1">{status}</p>}
        </div>
      </motion.div>
    </PageTransition>
  );
}

export default function VoicePage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0C0C0D]"><p className="text-white/50">加载中…</p></div>}>
      <VoicePageInner />
    </React.Suspense>
  );
}
