"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, ChevronLeft, User, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUILTIN_PERSONAS, type VoicePersona } from "@/lib/ai/identity-engine";

/* ═══════════════════════════════════════════════════════════════
   Voice OS — Full-screen immersive voice experience
   Breathing orb, persona switching, ambient gradients
   ═══════════════════════════════════════════════════════════════ */

interface VoiceOSProps {
  onClose: () => void;
  subject?: string;
}

const WAVE_BARS = 24;

export function VoiceOS({ onClose, subject }: VoiceOSProps) {
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  React.useEffect(() => { if(typeof window!=="undefined") synthRef.current = window.speechSynthesis; }, []);
  const [activePersona, setActivePersona] = React.useState<VoicePersona>(BUILTIN_PERSONAS[2]);
  const [showPersonas, setShowPersonas] = React.useState(false);
  const [waveHeights, setWaveHeights] = React.useState<number[]>(
    Array.from({ length: WAVE_BARS }, () => 8 + Math.random() * 4),
  );

  // Animate wave bars when listening
  React.useEffect(() => {
    if (!isListening && !isSpeaking) {
      setWaveHeights(Array.from({ length: WAVE_BARS }, () => 8 + Math.random() * 4));
      return;
    }
    const id = setInterval(() => {
      setWaveHeights(Array.from({ length: WAVE_BARS }, () => {
        const base = 8 + Math.random() * 32;
        // Center bars taller
        const centerFactor = 1 - Math.abs((WAVE_BARS / 2 - Math.floor(Math.random() * WAVE_BARS)) / (WAVE_BARS / 2)) * 0.5;
        return base + centerFactor * 20;
      }));
    }, 120);
    return () => clearInterval(id);
  }, [isListening, isSpeaking]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0C0C0D 0%, #1A1512 50%, #0C0C0D 100%)" }}
    >
      {/* Ambient gradients */}
      <motion.div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(197,139,116,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(138,158,139,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
        <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <ChevronLeft className="size-5 text-white/70" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPersonas(!showPersonas)}
            className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors">
            <User className="size-4" /> {activePersona.name}
          </button>
        </div>
        <div className="size-10" />
      </div>

      {/* Persona selector */}
      <AnimatePresence>
        {showPersonas && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 z-20 card-card p-3 flex flex-col gap-1 max-w-sm mx-auto">
            {BUILTIN_PERSONAS.map(p => (
              <button key={p.id} onClick={() => { setActivePersona(p); setShowPersonas(false); }}
                className={cn("flex items-center gap-3 rounded-xl p-3 text-left hover:bg-bg-muted transition-colors",
                  activePersona.id === p.id && "bg-primary-subtle")}>
                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">{p.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-caption">{p.role}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center: Breathing Voice Orb */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Outer ring */}
        <motion.div className="size-48 rounded-full border border-white/10"
          animate={{ scale: isListening ? [1, 1.15, 1] : 1, opacity: isListening ? [0.3, 0.8, 0.3] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity }} />
        <motion.div className="absolute size-36 rounded-full border border-white/5"
          animate={{ scale: isListening ? [1, 1.08, 1] : 1, opacity: isListening ? [0.5, 1, 0.5] : 0.5 }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} />

        {/* Core orb */}
        <motion.button
          onClick={() => { if(isListening){setIsListening(false);synthRef.current?.cancel();}else{setIsListening(true);if(synthRef.current){synthRef.current.cancel();const u=new SpeechSynthesisUtterance("你好，我是"+activePersona.name+"。"+activePersona.teachingStyle);u.lang="zh-CN";u.rate=0.9;u.onstart=()=>setIsSpeaking(true);u.onend=()=>setIsSpeaking(false);synthRef.current.speak(u);}} }}
          className="absolute size-24 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 40% 35%, rgba(197,139,116,0.8) 0%, rgba(180,120,100,0.6) 50%, rgba(160,100,80,0.4) 100%)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: isListening ? "0 0 40px rgba(197,139,116,0.5)" : "0 0 20px rgba(197,139,116,0.2)" }}>
          {isListening ? (
            <MicOff className="size-10 text-white" />
          ) : (
            <Mic className="size-10 text-white" />
          )}
        </motion.button>

        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-20">
          {waveHeights.map((h, i) => (
            <motion.div key={i} className="w-1 rounded-full"
              style={{ backgroundColor: "rgba(197,139,116,0.7)" }}
              animate={{ height: h }}
              transition={{ duration: 0.12 }} />
          ))}
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-lg font-medium text-white/90">
            {isListening ? "正在聆听..." : "点击开始对话"}
          </p>
          <p className="text-sm text-white/40 mt-1">
            {activePersona.name} · {activePersona.role}
          </p>
        </div>
      </div>

      {/* Teaching style hint */}
      <div className="absolute bottom-20 text-center px-8">
        <p className="text-xs text-white/30">{activePersona.teachingStyle}</p>
      </div>

      {/* Bottom: Recording indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-8 flex items-center gap-2 text-xs text-rose-400/70">
            <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
            Recording · Tap to stop
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
