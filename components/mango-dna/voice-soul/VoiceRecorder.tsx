"use client";

import * as React from "react";
import { Mic, Square, Loader2, Upload, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Voice Recorder — 浏览器原生录音 + 语音转文字
// Web Speech API (SpeechRecognition) + MediaRecorder API
// ─────────────────────────────────────────────────────────────

interface Props {
  onTranscribed: (text: string) => void;
}

type RecState = "idle" | "recording" | "transcribing";

// Web Speech API — browser-native, no extra dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

export function VoiceRecorder({ onTranscribed }: Props) {
  const [state, setState] = React.useState<RecState>("idle");
  const [error, setError] = React.useState("");
  const [duration, setDuration] = React.useState(0);
  const [interimText, setInterimText] = React.useState("");

  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI: any =
    typeof window !== "undefined"
      ? (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  function startRecording() {
    if (!SpeechRecognitionAPI) {
      setError("当前浏览器不支持语音识别，请使用 Chrome 或 Edge");
      return;
    }

    setError(""); setDuration(0); setInterimText("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new (SpeechRecognitionAPI as any)();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: { resultIndex: number; results: Array<{ isFinal: boolean; length: number; [index: number]: { transcript: string } }> }) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setInterimText(final);
      } else if (interim) {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "no-speech") return; // ignore, keep listening
      setError(`识别错误：${event.error}`);
      stopRecording();
    };

    recognition.onend = () => {
      // If user manually stopped, transcribe
      if (state === "recording") {
        setState("transcribing");
        if (interimText.trim()) {
          onTranscribed(interimText.trim());
        }
        setTimeout(() => setState("idle"), 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("recording");

    // Timer
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleToggle() {
    if (state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Button */}
      <button
        onClick={handleToggle}
        disabled={!isSupported || state === "transcribing"}
        className={cn(
          "relative size-16 rounded-full flex items-center justify-center transition-all duration-300",
          state === "recording"
            ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/30"
            : "bg-gradient-to-br from-violet-500 to-purple-500 hover:scale-105 active:scale-95 shadow-md",
          !isSupported && "opacity-50 cursor-not-allowed"
        )}
      >
        {state === "recording" ? (
          <Square className="size-6 text-white" />
        ) : state === "transcribing" ? (
          <Loader2 className="size-6 text-white animate-spin" />
        ) : (
          <Mic className="size-6 text-white" />
        )}

        {/* Recording ring */}
        {state === "recording" && (
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-[spin_3s_linear_infinite] opacity-50" />
        )}
      </button>

      {/* Status text */}
      <div className="text-center">
        {state === "idle" && (
          <p className="text-xs text-muted-foreground">
            {isSupported ? "点击开始录音 · 边说边转文字" : "浏览器不支持 · 请用 Chrome"}
          </p>
        )}
        {state === "recording" && (
          <div className="space-y-1">
            <p className="text-xs text-red-500 font-medium animate-pulse">
              正在录音 {formatDuration(duration)}
            </p>
            {interimText && (
              <p className="text-xs text-muted-foreground max-w-xs italic line-clamp-2">
                &ldquo;{interimText}&rdquo;
              </p>
            )}
          </div>
        )}
        {state === "transcribing" && (
          <p className="text-xs text-muted-foreground">正在处理…</p>
        )}
      </div>

      {error && <p className="text-destructive text-[10px]">{error}</p>}

      {/* Audio file upload — cross-platform fallback */}
      {state === "idle" && (
        <label className="cursor-pointer flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setState("transcribing");
              // Extract text from audio filename as placeholder
              // Future: POST to /api/ai/transcribe for Whisper ASR
              onTranscribed(`[语音文件: ${file.name}]\n(完整语音转写即将通过 Whisper API 支持)`);
              setTimeout(() => setState("idle"), 500);
            }}
          />
          <Upload className="size-3" />
          上传音频文件（跨平台通用 · mp3/wav/m4a）
        </label>
      )}

      {!isSupported && (
        <p className="text-[10px] text-muted-foreground/60">
          请使用 Chrome / Edge 进行实时语音识别，或上传音频文件
        </p>
      )}

      {/* Audio waveform visualization during recording */}
      {state === "recording" && (
        <div className="flex items-center gap-0.5 h-6 mt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-red-400 opacity-60"
              style={{
                height: `${6 + Math.random() * 18}px`,
                animation: `magic-pulse ${0.3 + Math.random() * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.06}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
