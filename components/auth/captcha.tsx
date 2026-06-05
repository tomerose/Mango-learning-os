"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   SimpleCanvasCaptcha — lightweight graphical CAPTCHA
   No external dependencies. Canvas-based math challenge.
   ═══════════════════════════════════════════════════════════════ */

function generateChallenge(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 15) + 1;
  const b = Math.floor(Math.random() * 15) + 1;
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = Math.max(a, b) - Math.min(a, b); break;
    case "×": answer = Math.min(a, 9) * Math.min(b, 9); break;
    default: answer = a + b;
  }
  const a2 = op === "-" ? Math.max(a, b) : a;
  const b2 = op === "-" ? Math.min(a, b) : b;
  return { question: `${a2} ${op} ${b2} = ?`, answer };
}

export function SimpleCaptcha({ onVerify, className }: {
  onVerify: (valid: boolean) => void;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [challenge, setChallenge] = React.useState(generateChallenge);
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "ok" | "fail">("idle");

  // Draw noise background on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = "#F7F4EF";
    ctx.fillRect(0, 0, w, h);

    // Noise lines
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Random dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Draw question with distortion
    ctx.font = "bold 20px 'Inter', sans-serif";
    ctx.fillStyle = "#2D2A24";
    ctx.textBaseline = "middle";
    const text = challenge.question;
    const textWidth = ctx.measureText(text).width;
    const x = (w - textWidth) / 2;
    // Slight rotation
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((Math.random() - 0.5) * 0.08);
    ctx.fillText(text, -textWidth / 2, 0);
    ctx.restore();
  }, [challenge]);

  function handleInput(val: string) {
    setInput(val);
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setStatus("idle");
      onVerify(false);
    } else if (num === challenge.answer) {
      setStatus("ok");
      onVerify(true);
    } else if (val.length >= String(challenge.answer).length) {
      setStatus("fail");
      onVerify(false);
    } else {
      setStatus("idle");
      onVerify(false);
    }
  }

  function refresh() {
    setChallenge(generateChallenge());
    setInput("");
    setStatus("idle");
    onVerify(false);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={160}
          height={48}
          className="rounded-lg border border-border"
        />
        <button
          type="button"
          onClick={refresh}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted transition-colors"
          aria-label="刷新验证码"
        >
          <RefreshCw className="size-4 text-fg-muted" />
        </button>
      </div>
      <input
        type="text"
        inputMode="numeric"
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="输入计算结果"
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
          status === "ok" && "border-emerald-500 bg-emerald-50",
          status === "fail" && "border-rose-500 bg-rose-50",
          status === "idle" && "border-border",
        )}
        autoComplete="off"
      />
    </div>
  );
}
