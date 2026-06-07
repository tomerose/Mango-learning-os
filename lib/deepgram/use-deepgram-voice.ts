"use client";

import * as React from "react";

// ═══════════════════════════════════════════════════════════════
// Deepgram Real-Time Voice Hook
// WebSocket STT → text → Agent task creation
// Reference: deepgram-starters/node-live-transcription pattern
// ═══════════════════════════════════════════════════════════════

interface UseDeepgramVoiceOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseDeepgramVoiceReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useDeepgramVoice(opts: UseDeepgramVoiceOptions): UseDeepgramVoiceReturn {
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const isSupported = typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    "WebSocket" in window;

  async function startListening() {
    if (!isSupported) {
      setError("浏览器不支持语音输入");
      opts.onError?.("浏览器不支持语音输入");
      return;
    }

    setError(null);

    try {
      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // Open Deepgram WebSocket
      const key = (process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY as string) || "";
      const ws = new WebSocket("wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&language=" + (opts.language || "zh-CN"), ["token", key]);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsListening(true);

        // Start recording
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };
        recorder.start(250); // Send chunks every 250ms
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transcript = data.channel?.alternatives?.[0]?.transcript;
          if (transcript) {
            const isFinal = data.is_final ?? false;
            opts.onTranscript(transcript, isFinal);
          }
        } catch { /* parse error */ }
      };

      ws.onerror = () => {
        setError("语音连接失败");
        opts.onError?.("语音连接失败");
        stopListening();
      };

      ws.onclose = () => {
        setIsListening(false);
      };
    } catch (err) {
      setError("麦克风权限被拒绝");
      opts.onError?.("麦克风权限被拒绝");
    }
  }

  function stopListening() {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    wsRef.current?.close();
    setIsListening(false);
  }

  React.useEffect(() => {
    return () => { stopListening(); };
  }, []);

  return { isListening, isSupported, startListening, stopListening, error };
}

// ── Browser SpeechRecognition fallback ─────────────────────────

export function useBrowserVoice(opts: UseDeepgramVoiceOptions): UseDeepgramVoiceReturn {
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null);

  const isSupported = typeof window !== "undefined" && !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

  function startListening() {
    if (!isSupported) { setError("浏览器不支持语音"); return; }
    setError(null);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("语音不可用"); return; }

    const rec = new SR();
    rec.lang = opts.language || "zh-CN";
    rec.interimResults = true;
    rec.continuous = true;
    recognitionRef.current = rec;

    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result?.[0]) opts.onTranscript(result[0].transcript, result.isFinal);
      }
    };
    rec.onerror = () => { setError("识别错误"); setIsListening(false); };
    rec.onend = () => setIsListening(false);
    rec.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  return { isListening, isSupported, startListening, stopListening, error };
}
