"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, MicOff, ChevronLeft, Loader2, Brain, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/page-transition";
import { useStore } from "@/lib/store";
import { BUILTIN_PERSONAS, DEFAULT_IDENTITIES, type VoicePersona } from "@/lib/ai/identity-engine";

const WAVE_BARS = 24;

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
  const { addNote } = useStore();

  const [activePersona, setActivePersona] = React.useState<VoicePersona>(BUILTIN_PERSONAS[0]);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isThinking, setIsThinking] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [conversation, setConversation] = React.useState<Turn[]>([]);
  const [saved, setSaved] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [textInput, setTextInput] = React.useState("");
  const [greeted, setGreeted] = React.useState(false);
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array.from({ length: WAVE_BARS }, () => 8));

  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const recogRef = React.useRef<any>(null);
  const convRef = React.useRef<Turn[]>([]);
  const voicesLoaded = React.useRef(false);

  React.useEffect(() => { convRef.current = conversation; }, [conversation]);

  // ═══ Init Speech APIs ═══
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // TTS — ensure voices are loaded before speaking
    synthRef.current = window.speechSynthesis;
    const loadVoices = () => {
      voicesLoaded.current = true;
      if (!greeted) greetUser();
    };
    if (synthRef.current.getVoices().length > 0) {
      loadVoices();
    } else {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    // Browser STT — continuous listening
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true;  // CRITICAL: don't stop after each phrase
      r.interimResults = true;
      r.lang = "zh-CN";
      r.onresult = (e: any) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setTranscript(t);
        // Only process on final
        const last = e.results[e.results.length - 1];
        if (last?.isFinal && t.trim()) {
          handleUserSpeech(t.trim());
        }
      };
      r.onerror = (e: any) => {
        console.log("STT error:", e.error);
        if (e.error === "no-speech" || e.error === "aborted") {
          // Don't stop — keep listening
          try { r.start(); } catch {}
        } else {
          setIsListening(false);
          setStatus("语音识别出错，请用文字输入");
        }
      };
      r.onend = () => {
        // Auto-restart if still listening
        if (isListening) {
          try { r.start(); } catch { setIsListening(false); }
        }
      };
      recogRef.current = r;
    }

    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  // Auto-select identity
  React.useEffect(() => {
    if (identityParam) {
      const identity = DEFAULT_IDENTITIES.find(i => i.id === identityParam);
      if (identity) setActivePersona(identity.persona);
    }
  }, [identityParam]);

  // ═══ Greet ═══
  function greetUser() {
    const greeting = "Hello，我是芒宝，有什么我可以帮到你的吗？";
    setConversation([{ role: "assistant", text: greeting }]);
    // DO NOT auto-speak — iOS Safari blocks audio without user gesture
    setGreeted(true);
  }

  // ═══ TTS — gated by user gesture, chunked for Android Chrome ═══
  const speakState = React.useRef({ cancelled: false });

  function speak(text: string) {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();
    speakState.current.cancelled = true; // cancel previous chunk sequence
    speakState.current = { cancelled: false };
    const state = speakState.current;

    // iOS warmup: empty utterance unblocks audio session
    const warmup = new SpeechSynthesisUtterance("");
    warmup.volume = 0;
    synth.speak(warmup);

    // Wait for voices to be available
    const doSpeak = () => {
      const cfg = VOICE_CONFIGS[activePersona.id] ?? { pitch: 1.0, rate: 0.95, lang: "zh-CN" };

      // Chunk text for Android Chrome (cuts off after ~200 chars)
      const MAX_CHUNK = 150;
      const chunks = text.match(new RegExp(`.{1,${MAX_CHUNK}}`, "g")) ?? [text];

      setIsSpeaking(true);
      let idx = 0;

      function speakChunk() {
        if (state.cancelled || idx >= chunks.length) {
          if (idx >= chunks.length) setIsSpeaking(false);
          return;
        }
        const u = new SpeechSynthesisUtterance(chunks[idx]);
        u.lang = cfg.lang;
        u.rate = cfg.rate;
        u.pitch = cfg.pitch;
        u.volume = 1;
        u.onend = () => { idx++; speakChunk(); };
        u.onerror = () => { idx++; speakChunk(); };
        synth.speak(u);
      }
      speakChunk();
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => { doSpeak(); };
    } else {
      doSpeak();
    }
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    speakState.current.cancelled = true;
    setIsSpeaking(false);
  }

  // ═══ Handle user input ═══
  async function handleUserSpeech(userText: string) {
    if (!userText.trim() || isThinking) return;
    setIsThinking(true);
    setStatus("芒宝正在思考...");

    const newConv: Turn[] = [...convRef.current, { role: "user", text: userText }];
    setConversation(newConv);
    setTranscript("");

    try {
      const history = newConv.map(t => ({ role: t.role as "user" | "assistant", content: t.text }));
      const res = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, personaId: activePersona.id, history }),
      });

      if (!res.ok || !res.body) throw new Error("API unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += decoder.decode(value, { stream: true });
      }

      const aiText = responseText.trim() || "抱歉，我没有理解你的意思，可以再说一遍吗？";
      setConversation([...newConv, { role: "assistant", text: aiText }]);
      setStatus("");
      // DO NOT auto-speak — user taps play button on each message
    } catch (err) {
      setStatus("网络出错了，请重试");
    } finally {
      setIsThinking(false);
    }
  }

  function toggleListening() {
    if (isListening) {
      recogRef.current?.stop();
      setIsListening(false);
      setStatus("");
    } else {
      if (!recogRef.current) {
        // No browser STT available — just use text input
        setStatus("请使用下方文字输入框");
        setTimeout(() => setStatus(""), 3000);
        return;
      }
      try {
        recogRef.current.lang = activePersona.id === "ielts-examiner" ? "en-GB" : activePersona.id === "korean-teacher" ? "ko-KR" : "zh-CN";
        recogRef.current.start();
        setIsListening(true);
        setStatus("正在聆听...");
      } catch {
        setStatus("语音不可用，请用文字输入");
      }
    }
  }

  function handleSaveConversation() {
    if (conversation.length < 2 || saved) return;
    const lastTurn = conversation[conversation.length - 1];
    const userTurn = conversation[conversation.length - 2];
    addNote({
      subject: "ai",
      title: (userTurn?.text ?? "语音对话").slice(0, 60),
      body: `## 提问\n${userTurn?.text ?? ""}\n\n## ${activePersona.name}的回答\n${lastTurn?.text ?? ""}\n\n---\n*芒宝语音捕获*`,
      tags: ["语音对话", activePersona.id],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Waveform animation
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
              <span className="size-2.5 rounded-full" style={{ backgroundColor: id.id === "ielts-candidate" ? "#C58B74" : "#7B8FCA" }} />
              {id.name}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="absolute top-32 bottom-52 left-0 right-0 overflow-y-auto px-6 flex flex-col gap-3">
          {conversation.map((turn, i) => (
            <div key={i} className={cn("flex flex-col gap-1.5", turn.role === "user" ? "items-end" : "items-start")}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  turn.role === "user" ? "bg-white/10 text-white/90" : "bg-white/5 text-white/80 border border-white/10")}>
                {turn.text}
              </motion.div>
              {turn.role === "assistant" && (
                <button
                  onClick={() => {
                    if (isSpeaking) { stopSpeaking(); }
                    else { speak(turn.text); }
                  }}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors ml-1"
                >
                  {isSpeaking
                    ? <><div className="size-2 rounded-sm bg-amber-400/60" /> 停止</>
                    : <><div className="size-2 rounded-full border border-white/30" /> 播放</>
                  }
                </button>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="self-start bg-white/5 rounded-2xl px-4 py-3 text-sm text-white/50 border border-white/10 flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> {status}
            </div>
          )}
          {/* Save button */}
          {conversation.length >= 2 && !isThinking && (
            <div className="flex justify-center">
              {saved ? (
                <span className="text-xs text-emerald-400/70 flex items-center gap-1"><Check className="size-3" />已保存到知识库</span>
              ) : (
                <button onClick={handleSaveConversation} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                  <Brain className="size-3" /> 保存对话到知识库
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center orb + waveform */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
          <motion.div className="size-48 rounded-full border border-white/10"
            animate={{ scale: isListening ? [1, 1.15, 1] : 1, opacity: isListening ? [0.3, 0.8, 0.3] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }} />

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
              {isListening ? "正在聆听...（说完会自动识别）" : isThinking ? "芒宝思考中..." : isSpeaking ? "芒宝正在回答..." : "点击麦克风开始对话"}
            </p>
            <p className="text-sm text-white/40 mt-1">{activePersona.name} · {activePersona.role}</p>
            {transcript && !isThinking && (
              <p className="text-sm text-white/70 mt-2 bg-white/5 rounded-xl px-3 py-2">{transcript}</p>
            )}
          </div>
        </div>

        {/* Text input — always available */}
        <div className="absolute bottom-16 left-0 right-0 px-4 sm:px-6">
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && textInput.trim()) { handleUserSpeech(textInput.trim()); setTextInput(""); } }}
              placeholder="输入文字，芒宝语音回复..."
              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30" />
            <button onClick={() => { if (textInput.trim()) { handleUserSpeech(textInput.trim()); setTextInput(""); } }}
              disabled={isThinking || !textInput.trim()}
              className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-white/20 transition-colors disabled:opacity-30">
              发送
            </button>
          </div>
        </div>

        <div className="absolute bottom-2 text-center px-8">
          <p className="text-[10px] text-white/15">Mango Voice · Deepgram 已激活 · 全平台可用</p>
        </div>
      </motion.div>
    </PageTransition>
  );
}

export default function VoicePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center"><p className="text-white/50">加载中…</p></div>}>
      <VoicePageInner />
    </React.Suspense>
  );
}
