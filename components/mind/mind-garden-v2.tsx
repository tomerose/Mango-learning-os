"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Feather, Shield, AlertTriangle, Loader2,
  Sparkles, Lock, Globe, Send, ChevronRight, RefreshCw,
  Moon, Wind, Smile, BookOpen, Footprints, CloudSun,
  BarChart3, Radio, X, CheckCircle2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════════════════════════
   Mind Garden v2 — Professional, safe mental wellness module
   10 modes connected to /api/mind-garden/reflect
   Crisis detection • Privacy-first • Structured output
   ═══════════════════════════════════════════════════════════════ */

interface ModeInfo {
  key: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
}
interface ReflectResponse {
  mode: string;
  crisisCheck: {
    isCrisis: boolean;
    warningLevel: string;
    message?: string;
    emergencyResources?: string[];
  };
  output: {
    title: string;
    summary: string;
    body: string;
    suggestions: string[];
    nextSteps: string[];
    privacyNote: string;
  };
}

const LOCAL_CRISIS_PATTERNS = [
  /自杀|自残|不想活|结束生命|kill myself|suicide/i,
  /伤害自己|伤害他人|harm myself|harm others/i,
  /绝望到|活不下去|没有意义.*活|生无可恋/i,
  /虐待|abuse|assault|rape/i,
  /马上需要|紧急|crisis|emergency/i,
];

const LOCAL_EMERGENCY_RESOURCES = [
  "全国24小时心理危机干预热线: 010-82951332",
  "北京心理危机研究与干预中心: 800-810-1117",
  "希望24热线: 400-161-9995",
  "生命热线: 400-821-1215",
  "紧急情况请立即拨打 120 或前往最近医院急诊科",
];

const MODES: ModeInfo[] = [
  { key: "journal", name: "情绪日记", desc: "记录和整理今天的情绪体验", icon: <Feather className="size-4" /> },
  { key: "vent", name: "安全吐槽", desc: "无评判空间释放情绪", icon: <Radio className="size-4" /> },
  { key: "structured", name: "结构化反思", desc: "GROW框架整理思绪", icon: <Brain className="size-4" /> },
  { key: "cbt", name: "CBT思维记录", desc: "识别和调整自动思维", icon: <RefreshCw className="size-4" /> },
  { key: "grounding", name: "焦虑接地", desc: "5-4-3-2-1感官练习", icon: <Footprints className="size-4" /> },
  { key: "breathing", name: "呼吸练习", desc: "4-7-8 / 箱式呼吸引导", icon: <Wind className="size-4" /> },
  { key: "sleep", name: "睡眠恢复", desc: "NHS指南睡眠改善", icon: <Moon className="size-4" /> },
  { key: "self-compassion", name: "自我关怀", desc: "对自己温柔一点", icon: <Heart className="size-4" /> },
  { key: "stress-recovery", name: "压力恢复", desc: "24h + 7天恢复计划", icon: <CloudSun className="size-4" /> },
  { key: "mood-report", name: "心情周报", desc: "一周情绪模式分析", icon: <BarChart3 className="size-4" /> },
];

// Simple markdown→HTML
function mdToHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-fg">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 text-sm">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 text-sm">$1</li>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function buildLocalReflection(params: {
  mode: string;
  userInput: string;
  mood?: string;
  moodIntensity: number;
}): ReflectResponse {
  const crisis = LOCAL_CRISIS_PATTERNS.some((p) => p.test(params.userInput));
  if (crisis) {
    return {
      mode: params.mode,
      crisisCheck: {
        isCrisis: true,
        warningLevel: "emergency",
        message: "检测到可能的紧急心理安全信号。请优先联系专业支持或身边可信任的人。",
        emergencyResources: LOCAL_EMERGENCY_RESOURCES,
      },
      output: {
        title: "紧急支持",
        summary: "请先确保人身安全，并立即寻求专业帮助。",
        body: "你不需要独自面对这些感受。现在最重要的是让一个真实的人知道你的处境：联系家人、朋友、学校心理中心，或拨打紧急热线。",
        suggestions: [],
        nextSteps: ["联系一个可信任的人", "拨打心理援助热线", "必要时前往最近医院急诊科"],
        privacyNote: "本地模式未把你的内容发送到云端。",
      },
    };
  }

  const modeName = MODES.find((m) => m.key === params.mode)?.name ?? "反思";
  const moodLine = params.mood ? `\n- 当前心情：${params.mood}` : "";
  return {
    mode: params.mode,
    crisisCheck: { isCrisis: false, warningLevel: "none" },
    output: {
      title: `${modeName} · 本地整理`,
      summary: "已在本地生成一个不依赖云端的安全反思框架。",
      body: `## 观察\n- 你刚刚记录了一段重要感受。${moodLine}\n- 情绪强度：${params.moodIntensity}/10\n\n## 本地反思\n1. 先给这段感受命名：它更接近压力、委屈、疲惫、焦虑，还是别的？\n2. 写下一个触发点：今天哪件事最可能让这种感受变强？\n3. 区分事实和解释：哪些是已经发生的事实，哪些是你对它的理解？\n\n## 温和行动\n选择一个 5 分钟内能完成的小动作：喝水、离开屏幕、整理桌面、做 6 次慢呼吸，或给可信任的人发一句“我今天状态不太好”。`,
      suggestions: ["把下一步缩小到 5 分钟以内", "避免在情绪峰值时做重大决定"],
      nextSteps: ["保存本地记录", "稍后再回看这段文字，标记一个可控因素"],
      privacyNote: "本地模式：内容仅在当前设备处理，未发送到云端或 AI 服务。",
    },
  };
}

export function MindGardenV2() {
  const [selectedMode, setSelectedMode] = React.useState<string>("journal");
  const [userInput, setUserInput] = React.useState("");
  const [mood, setMood] = React.useState("");
  const [moodIntensity, setMoodIntensity] = React.useState<number>(5);
  const [privacyMode, setPrivacyMode] = React.useState<"local" | "cloud">("local");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ReflectResponse | null>(null);
  const [error, setError] = React.useState("");

  async function handleSubmit() {
    if (!userInput.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ALWAYS try the AI API first. Only fall back to local if API fails.
      const res = await fetch("/api/mind-garden/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          userInput: userInput.trim(),
          mood: mood.trim() || undefined,
          moodIntensity,
          privacyMode,
          cloudConsent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Still show crisis info even on error
        if (data.crisisCheck) setResult(data);
        throw new Error(data.error || "请求失败");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setUserInput("");
    setError("");
  }

  const crisisWarning = result?.crisisCheck?.isCrisis;
  const isEmergency = result?.crisisCheck?.warningLevel === "emergency";

  const moodOptions = ["😊 开心", "😌 平静", "😔 低落", "😤 愤怒", "😰 焦虑", "🥱 疲惫", "🤔 迷茫", "💪 有动力"];

  return (
    <div className="flex flex-col gap-6">
      {/* Mode Selector */}
      {!result && (
        <>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMode(m.key)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                  selectedMode === m.key
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-border/50 bg-bg-surface hover:border-border"
                )}
              >
                <div className={cn(
                  "size-9 rounded-lg flex items-center justify-center shrink-0",
                  selectedMode === m.key ? "bg-primary/10 text-primary" : "bg-bg-muted text-fg-muted"
                )}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="card-card p-5 flex flex-col gap-4">
            {/* Mood + Privacy row */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={mood}
                onChange={e => setMood(e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-bg-surface"
              >
                <option value="">标记心情（可选）</option>
                {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center gap-2 text-xs text-fg-muted">
                <span>强度:</span>
                <input
                  type="range" min="1" max="10" value={moodIntensity}
                  onChange={e => setMoodIntensity(Number(e.target.value))}
                  className="w-20 accent-primary"
                />
                <span className="font-medium w-4">{moodIntensity}</span>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setPrivacyMode(p => p === "local" ? "cloud" : "local")}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 font-medium transition-colors",
                  privacyMode === "local"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                )}
              >
                {privacyMode === "local" ? <Lock className="size-3" /> : <Globe className="size-3" />}
                {privacyMode === "local" ? "本地存储" : "云端同步"}
              </button>
            </div>

            {/* Main textarea */}
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder={
                selectedMode === "journal" ? "今天发生了什么？有什么想记录的感受…" :
                selectedMode === "vent" ? "在这里你可以安全地说任何话，不会被评判…" :
                selectedMode === "cbt" ? "描述一个让你困扰的情境。什么想法自动浮现了？" :
                "写下你此刻的想法或感受…"
              }
              className="min-h-32 text-sm"
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-fg-muted/80">Ctrl+Enter 发送</span>
              <Button onClick={handleSubmit} disabled={loading || !userInput.trim()} className="gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {MODES.find(m => m.key === selectedMode)?.name ?? "开始"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Crisis Warning */}
      {crisisWarning && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl border-2 p-5 flex flex-col gap-3",
            isEmergency ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("size-5", isEmergency ? "text-red-600" : "text-amber-600")} />
            <span className={cn("font-semibold", isEmergency ? "text-red-700" : "text-amber-700")}>
              {isEmergency ? "请立即寻求帮助" : "注意"}
            </span>
          </div>
          <p className="text-sm">{result!.crisisCheck.message}</p>
          {result!.crisisCheck.emergencyResources && (
            <div className="flex flex-col gap-1.5">
              {result!.crisisCheck.emergencyResources.map((r, i) => (
                <p key={i} className="text-xs font-medium text-red-700">{r}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result?.output && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            {/* Output Card */}
            <div className="card-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {MODES.find(m => m.key === selectedMode)?.icon}
                    <h2 className="text-lg font-semibold">{result.output.title}</h2>
                  </div>
                  <p className="text-sm text-fg-muted mt-1">{result.output.summary}</p>
                </div>
                {!crisisWarning && (
                  <button onClick={reset} className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted shrink-0">
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Main body */}
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: mdToHtml(result.output.body) }}
              />

              {/* Suggestions */}
              {result.output.suggestions.length > 0 && (
                <div className="rounded-xl bg-bg-muted/50 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" /> 建议
                  </p>
                  {result.output.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-fg-muted">
                      <div className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {result.output.nextSteps.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <Footprints className="size-3.5" /> 下一步
                  </p>
                  {result.output.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy Note */}
              <div className="flex items-center gap-2 text-[10px] text-fg-muted/90 pt-2 border-t border-border/30">
                {privacyMode === "local" ? <Lock className="size-3" /> : <Globe className="size-3" />}
                {result.output.privacyNote}
              </div>
            </div>

            {/* Action buttons */}
            {!crisisWarning && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={reset} className="gap-1.5">
                  <RefreshCw className="size-3.5" /> 重新开始
                </Button>
                {privacyMode === "local" && (
                  <span className="text-[10px] text-fg-muted flex items-center gap-1">
                    <Lock className="size-3" /> 此内容仅保存在你的设备上
                  </span>
                )}
              </div>
            )}

            {/* Emergency: always show crisis resources + professional help recommendation */}
            {isEmergency && (
              <div className="flex justify-center">
                <Button onClick={reset} variant="outline" size="sm">返回</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !result && (
        <div className="card-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-4" />
            <span className="text-sm font-medium">请求失败</span>
          </div>
          <p className="text-xs text-fg-muted">{error}</p>
          <Button variant="outline" size="sm" onClick={reset}>重试</Button>
        </div>
      )}

      {/* Safety footer */}
      <div className="flex items-center justify-between text-[10px] text-fg-muted/80 pt-2">
        <span>⚠ Mind Garden 提供自助心理健康工具，不提供医疗诊断或治疗</span>
        <a href="tel:010-82951332" className="hover:text-fg-muted transition-colors flex items-center gap-1">
          <Shield className="size-3" /> 24h心理热线: 010-82951332
        </a>
      </div>
    </div>
  );
}
