"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════════
   useDeepgramSTT — Production-grade real-time speech-to-text
   WebSocket streaming to Deepgram Nova-3 model.
   Falls back to browser SpeechRecognition when unavailable.
   ═══════════════════════════════════════════════════════════════ */

interface DeepgramSTTOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  language?: string;
}

export function useDeepgramSTT({ onTranscript, language = "zh-CN" }: DeepgramSTTOptions) {
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasDeepgram, setHasDeepgram] = React.useState(false);

  const wsRef = React.useRef<WebSocket | null>(null);
  const mediaRef = React.useRef<MediaStream | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);
  const browserRecogRef = React.useRef<any>(null);

  // Check Deepgram availability
  React.useEffect(() => {
    fetch("/api/voice/deepgram")
      .then(r => r.json())
      .then(d => setHasDeepgram(d.deepgramAvailable))
      .catch(() => setHasDeepgram(false));
  }, []);

  async function startDeepgram() {
    try {
      // Get mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;

      // Open Deepgram WebSocket
      const ws = new WebSocket("wss://api.deepgram.com/v1/listen", ["token", "8a29bca2aa208a2f439aaeff833d71dfcbc90ee2"]);
      wsRef.current = ws;

      ws.onopen = () => {
        // Configure Deepgram
        ws.send(JSON.stringify({
          type: "Configure",
          features: {
            model: "nova-2",
            language: language === "zh-CN" ? "zh" : "en",
            interim_results: true,
            smart_format: true,
            punctuate: true,
          },
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const transcript = data.channel?.alternatives?.[0];
        if (transcript) {
          const text = transcript.transcript;
          const isFinal = data.is_final || data.speech_final;
          if (text) onTranscript(text, isFinal);
        }
      };

      ws.onerror = () => {
        setError("Deepgram connection failed, using browser fallback");
        stopDeepgram();
        startBrowserFallback();
      };

      ws.onclose = () => setIsListening(false);

      // Stream mic audio to Deepgram
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const input = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, Math.round(input[i] * 32767)));
          }
          ws.send(int16.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err) {
      setError("Microphone access denied");
      setIsListening(false);
    }
  }

  function stopDeepgram() {
    wsRef.current?.close();
    mediaRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    setIsListening(false);
  }

  // Browser fallback
  function startBrowserFallback() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not available on this browser");
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = language;
    r.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      const isFinal = e.results[e.results.length - 1]?.isFinal ?? false;
      onTranscript(t, isFinal);
    };
    r.onerror = () => setError("Browser STT error");
    r.start();
    browserRecogRef.current = r;
    setIsListening(true);
  }

  function stopBrowserFallback() {
    browserRecogRef.current?.stop();
    setIsListening(false);
  }

  function start() {
    setError(null);
    if (hasDeepgram) {
      startDeepgram();
    } else {
      startBrowserFallback();
    }
  }

  function stop() {
    if (hasDeepgram) {
      stopDeepgram();
    } else {
      stopBrowserFallback();
    }
  }

  // Cleanup
  React.useEffect(() => {
    return () => {
      wsRef.current?.close();
      mediaRef.current?.getTracks().forEach(t => t.stop());
      browserRecogRef.current?.stop();
    };
  }, []);

  return { isListening, error, hasDeepgram, start, stop };
}
