"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, MicOff, User, ChevronLeft, Brain, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/page-transition";
import { BUILTIN_PERSONAS, DEFAULT_IDENTITIES, type VoicePersona, type LearningIdentity } from "@/lib/ai/identity-engine";

/* ═══════════════════════════════════════════════════════════════
   Mango Voice — Standalone Voice OS Window
   Identity selection → real-time voice conversation
   ═══════════════════════════════════════════════════════════════ */

const WAVE_BARS = 24;

function VoicePageInner() {
  const searchParams = useSearchParams();
  const identityParam = searchParams.get("identity");

  const [activePersona, setActivePersona] = React.useState<VoicePersona>(BUILTIN_PERSONAS[0]);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array.from({ length: WAVE_BARS }, () => 8));
  const [greeted, setGreeted] = React.useState(false);

  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const recogRef = React.useRef<any>(null);

  // Init speech APIs
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "zh-CN";
      r.onresult = (e: any) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setTranscript(t); };
      r.onerror = () => setIsListening(false);
      recogRef.current = r;
    }
  }, []);

  // Auto-select identity from URL param
  React.useEffect(() => {
    if (identityParam) {
      const identity = DEFAULT_IDENTITIES.find(i => i.id === identityParam);
      if (identity) setActivePersona(identity.persona);
    }
  }, [identityParam]);

  // Auto-greet on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (synthRef.current && !greeted) {
        synthRef.current.cancel();
        const u = new SpeechSynthesisUtterance("Hello，我是芒宝，有什么我可以帮到你的吗？");
        u.lang = "zh-CN"; u.rate = 0.95; u.pitch = 1.1;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        synthRef.current.speak(u);
        setGreeted(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [greeted]);

  function toggleListening() {
    if (isListening) {
      setIsListening(false); synthRef.current?.cancel(); recogRef.current?.stop();
    } else {
      setIsListening(true); setTranscript(""); recogRef.current?.start();
      if (synthRef.current && activePersona) {
        synthRef.current.cancel();
        const u = new SpeechSynthesisUtterance("Hello，我是芒宝，有什么我可以帮到你的吗？");
        u.lang = "zh-CN"; u.rate = 0.95;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        synthRef.current.speak(u);
      }
    }
  }

  // Wave animation
  React.useEffect(() => {
    if (!isListening && !isSpeaking) { setWaveHeights(Array.from({ length: WAVE_BARS }, () => 8)); return; }
    const id = setInterval(() => {
      setWaveHeights(Array.from({ length: WAVE_BARS }, () => {
        const base = 8 + Math.random() * 32;
        const cf = 1 - Math.abs((WAVE_BARS / 2 - Math.floor(Math.random() * WAVE_BARS)) / (WAVE_BARS / 2)) * 0.5;
        return base + cf * 20;
      }));
    }, 120);
    return () => clearInterval(id);
  }, [isListening, isSpeaking]);

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

        {/* Identity selector chips */}
        <div className="absolute top-20 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto scrollbar-none z-10">
          {DEFAULT_IDENTITIES.map(id => (
            <button key={id.id}
              onClick={() => setActivePersona(id.persona)}
              className={cn("shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors",
                activePersona.id === id.persona.id ? "bg-white/15 text-white border border-white/20" : "bg-white/5 text-white/50 border border-white/5")}>
              <span className="size-2.5 rounded-full" style={{ backgroundColor: id.id === "ielts-candidate" ? "#C58B74" : id.id === "ai-engineer" ? "#7B8FCA" : "#8A9E8B" }} />
              {id.name}
            </button>
          ))}
        </div>

        {/* Center Orb */}
        <div className="relative flex flex-col items-center gap-8">
          <motion.div className="size-48 rounded-full border border-white/10"
            animate={{ scale: isListening ? [1, 1.15, 1] : 1, opacity: isListening ? [0.3, 0.8, 0.3] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute size-36 rounded-full border border-white/5"
            animate={{ scale: isListening ? [1, 1.08, 1] : 1, opacity: isListening ? [0.5, 1, 0.5] : 0.5 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} />

          <motion.button onClick={toggleListening}
            className="absolute size-24 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 40% 35%, rgba(197,139,116,0.8) 0%, rgba(180,120,100,0.6) 50%, rgba(160,100,80,0.4) 100%)" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: isListening ? "0 0 40px rgba(197,139,116,0.5)" : "0 0 20px rgba(197,139,116,0.2)" }}>
            {isListening ? <MicOff className="size-10 text-white" /> : <Mic className="size-10 text-white" />}
          </motion.button>

          {/* Waveform */}
          <div className="flex items-end gap-[2px] h-20">
            {waveHeights.map((h, i) => (
              <motion.div key={i} className="w-1 rounded-full" style={{ backgroundColor: "rgba(197,139,116,0.7)" }}
                animate={{ height: h }} transition={{ duration: 0.12 }} />
            ))}
          </div>

          <div className="text-center max-w-xs">
            <p className="text-lg font-medium text-white/90">{isListening ? "正在聆听..." : "点击开始对话"}</p>
            <p className="text-sm text-white/40 mt-1">{activePersona.name} · {activePersona.role}</p>
            {transcript && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-white/60 mt-3 bg-white/5 rounded-xl p-3 leading-relaxed">{transcript}</motion.p>
            )}
          </div>
        </div>

        {/* Teaching style */}
        <div className="absolute bottom-20 text-center px-8">
          <p className="text-xs text-white/30">{activePersona.teachingStyle}</p>
        </div>

        {isListening && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 flex items-center gap-2 text-xs text-rose-400/70">
            <span className="size-2 rounded-full bg-rose-400 animate-pulse" /> Recording
          </motion.div>
        )}
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
