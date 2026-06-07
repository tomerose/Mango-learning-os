"use client";

import * as React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrowserVoice, useDeepgramVoice } from "@/lib/deepgram/use-deepgram-voice";

/* ═══════════════════════════════════════════════════════════════
   Voice Input — Real-time speech → Agent task text
   Deepgram WebSocket primary, browser SpeechRecognition fallback
   ═══════════════════════════════════════════════════════════════ */

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [transcript, setTranscript] = React.useState("");
  const [finalText, setFinalText] = React.useState("");

  const handleTranscript = React.useCallback((text: string, isFinal: boolean) => {
    setTranscript(text);
    if (isFinal) {
      setFinalText(prev => prev + " " + text);
      onTranscript(text);
    }
  }, [onTranscript]);

  // Try Deepgram first, fall back to browser API
  const deepgram = useDeepgramVoice({ onTranscript: handleTranscript });
  const browser = useBrowserVoice({ onTranscript: handleTranscript });

  const voice = deepgram.isSupported ? deepgram : browser;

  React.useEffect(() => {
    if (finalText && !voice.isListening) {
      setTranscript("");
      setFinalText("");
    }
  }, [finalText, voice.isListening]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => voice.isListening ? voice.stopListening() : voice.startListening()}
        className={cn(
          "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
          voice.isListening
            ? "bg-red-100 text-red-600 animate-pulse"
            : "bg-bg-muted text-fg-muted hover:bg-primary-subtle hover:text-primary",
        )}
        title={voice.isListening ? "停止录音" : "语音输入"}
        disabled={!voice.isSupported}
      >
        {voice.isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
      </button>
      {voice.isListening && (
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1 bg-primary rounded-full animate-pulse"
                style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span className="text-xs text-fg-muted truncate max-w-[200px]">
            {transcript || "正在聆听…"}
          </span>
        </div>
      )}
      {voice.error && <span className="text-[10px] text-red-500">{voice.error}</span>}
    </div>
  );
}
