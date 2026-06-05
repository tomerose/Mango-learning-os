"use client";

import * as React from "react";
import {
  Upload, Mic, FileText, MessageSquare, Loader2,
  Sparkles, Play, Pause, Brain, Heart, User,
  Volume2, CheckCircle2, ArrowRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VoiceRecorder } from "./VoiceRecorder";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Voice Soul Distillation — Mango DNA 旗舰功能
// 上传聊天/语音/文字 → AI 人格蒸馏 → 数字挚友档案
// ─────────────────────────────────────────────────────────────

interface DistillationResult {
  personalityCard: {
    name: string; traits: string[]; mbtiGuess: string;
    energyLevel: string; emotionalPattern: string;
  };
  thinkingModel: {
    logicStyle: string; decisionPattern: string; values: string[];
    catchphrases: string[]; topicPreferences: string[];
  };
  communicationStyle: {
    formality: string; responseLength: string; humorStyle: string;
    emojiUsage: string; warmth: number;
  };
  voiceProfile: {
    estimatedPace: string; estimatedEnergy: string;
    pauseStyle: string; fillerWords: string[];
  };
  interactionSnapshot: {
    greeting: string; farewell: string;
    encouragement: string; conflictResponse: string;
  };
}

type Stage = "upload" | "distilling" | "result" | "chat";

const STAGES = [
  { key: "upload" as const, label: "上传", icon: Upload },
  { key: "distilling" as const, label: "蒸馏", icon: Brain },
  { key: "result" as const, label: "档案", icon: User },
  { key: "chat" as const, label: "对话", icon: MessageSquare },
];

const DISTILLING_STEPS = [
  "正在读取上传数据…",
  "提取语言风格特征…",
  "分析性格与思维模式…",
  "识别情感倾向…",
  "推断语音特征…",
  "生成数字挚友档案…",
];

export function VoiceSoulContent() {
  const [stage, setStage] = React.useState<Stage>("upload");
  const [text, setText] = React.useState("");
  const [distillingStep, setDistillingStep] = React.useState(0);
  const [distillingText, setDistillingText] = React.useState(DISTILLING_STEPS[0]);
  const [result, setResult] = React.useState<DistillationResult | null>(null);
  const [error, setError] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<Array<{role:string;content:string}>>([]);
  const [chatInput, setChatInput] = React.useState("");
  const [chatLoading, setChatLoading] = React.useState(false);

  // ── Distillation logic ──
  async function startDistillation() {
    if (text.trim().length < 30) { setError("请至少输入 30 字的对话材料"); return; }
    setStage("distilling"); setError(""); setDistillingStep(0);

    // Animate steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < DISTILLING_STEPS.length) {
        setDistillingStep(step);
        setDistillingText(DISTILLING_STEPS[step]);
      }
    }, 800);

    try {
      const res = await fetch("/api/ai/voice-soul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), mode: "full" }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || "蒸馏失败");
      setResult(data.result);
      setDistillingStep(DISTILLING_STEPS.length);
      setTimeout(() => setStage("result"), 600);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "蒸馏失败");
      setStage("upload");
    }
  }

  // ── Chat logic ──
  async function sendMessage() {
    if (!chatInput.trim() || !result) return;
    const userMsg = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput(""); setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "general",
          messages: [
            { role: "system", content: `你正在扮演一个数字挚友。请完全按照以下人格档案来回应：

名字：${result.personalityCard.name}
性格标签：${result.personalityCard.traits.join("、")}
MBTI：${result.personalityCard.mbtiGuess}
口头禅：${result.thinkingModel.catchphrases.join("、")}
沟通风格：${result.communicationStyle.formality === "casual" ? "随意" : result.communicationStyle.formality === "balanced" ? "适中" : "正式"}、${result.communicationStyle.humorStyle}
温暖度：${result.communicationStyle.warmth}/100
典型问候：${result.interactionSnapshot.greeting}
典型鼓励：${result.interactionSnapshot.encouragement}

请完全沉浸在这个人格中。像这个人在真实聊天中一样回应。` },
            userMsg,
          ],
        }),
      });
      if (!res.ok) throw new Error("对话失败");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: reply }];
            }
            return [...prev, { role: "assistant", content: reply }];
          });
        }
      }
    } catch { /* ignore */ }
    finally { setChatLoading(false); }
  }

  // ── File upload simulation ──
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") setText((prev) => prev + "\n" + content.slice(0, 8000));
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isActive = stage === s.key;
          const isDone = STAGES.findIndex((x) => x.key === stage) > i;
          return (
            <React.Fragment key={s.key}>
              <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                isActive && "bg-primary/10 text-primary",
                isDone && "text-green-600",
                !isActive && !isDone && "text-muted-foreground"
              )}>
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && <div className="h-px flex-1 bg-border" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══ Stage 1: Upload ═══ */}
      {stage === "upload" && (
        <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/20">
          <CardContent className="py-12">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="size-8 text-violet-500" />
                </div>
                <h2 className="text-xl font-semibold">声魂蒸馏</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  上传与某人的聊天记录、文字或语音，AI 将重建ta的语言风格、性格特质与思维模式
                </p>
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="粘贴聊天记录、文字材料或描述这个人的特点…&#10;&#10;例如：&#10;- 微信/QQ 聊天记录导出&#10;- 这个人写过的文字、说过的话&#10;- 对ta性格和说话方式的描述&#10;&#10;材料越丰富，重建越精准。"
                className="min-h-40 text-sm resize-y rounded-2xl"
              />

              <div className="flex items-center gap-3 justify-center">
                <label className="cursor-pointer">
                  <input type="file" accept=".txt,.json,.csv,.md" onChange={handleFileUpload} className="hidden" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Upload className="size-3.5" /> 上传文件
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">或</span>
                <VoiceRecorder onTranscribed={(t) => setText((prev) => prev + "\n" + t)} />
              </div>

              {error && <p className="text-destructive text-xs text-center">{error}</p>}

              <div className="flex justify-center">
                <Button onClick={startDistillation} disabled={text.trim().length < 30} size="lg" className="rounded-2xl px-8">
                  <Sparkles className="size-4 mr-2" /> 开始蒸馏
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Stage 2: Distilling ═══ */}
      {stage === "distilling" && (
        <Card className="rounded-2xl">
          <CardContent className="py-16">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="relative size-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 animate-[spin_4s_linear_infinite] opacity-20" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 animate-[spin_3s_linear_infinite_reverse] opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="size-10 text-violet-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">正在蒸馏灵魂…</h3>
                <p className="text-sm text-muted-foreground mt-1 animate-pulse">{distillingText}</p>
              </div>
              <Progress value={(distillingStep / DISTILLING_STEPS.length) * 100} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Stage 3: Result — Digital Friend Profile ═══ */}
      {stage === "result" && result && (
        <div className="space-y-4">
          {/* Personality Card */}
          <Card className="rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-400" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <User className="size-8 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold">{result.personalityCard.name}</h3>
                    <Badge className="bg-violet-100 text-violet-700 text-[10px]">{result.personalityCard.mbtiGuess}</Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {result.communicationStyle.warmth >= 70 ? "温暖" : result.communicationStyle.warmth >= 40 ? "平和" : "冷静"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.personalityCard.traits.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail tabs */}
          <Tabs defaultValue="thinking">
            <TabsList>
              <TabsTrigger value="thinking"><Brain className="size-3.5" /> 思维</TabsTrigger>
              <TabsTrigger value="comm"><MessageSquare className="size-3.5" /> 沟通</TabsTrigger>
              <TabsTrigger value="voice"><Volume2 className="size-3.5" /> 语音</TabsTrigger>
              <TabsTrigger value="snapshot"><Heart className="size-3.5" /> 快照</TabsTrigger>
            </TabsList>

            <TabsContent value="thinking" className="mt-4 space-y-3">
              <Card className="rounded-2xl"><CardContent className="py-4 text-sm space-y-2">
                <p><span className="text-muted-foreground">逻辑风格：</span>{result.thinkingModel.logicStyle}</p>
                <p><span className="text-muted-foreground">决策模式：</span>{result.thinkingModel.decisionPattern}</p>
                <p><span className="text-muted-foreground">价值观：</span>{result.thinkingModel.values.join(" · ")}</p>
                <p><span className="text-muted-foreground">口头禅：</span>{result.thinkingModel.catchphrases.join("、")}</p>
                <p><span className="text-muted-foreground">话题偏好：</span>{result.thinkingModel.topicPreferences.join(" · ")}</p>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="comm" className="mt-4">
              <Card className="rounded-2xl"><CardContent className="py-4 text-sm space-y-2">
                <p><span className="text-muted-foreground">正式度：</span>{result.communicationStyle.formality === "casual" ? "随性自然" : result.communicationStyle.formality === "balanced" ? "适中得体" : "正式严谨"}</p>
                <p><span className="text-muted-foreground">回复长度：</span>{result.communicationStyle.responseLength === "short" ? "言简意赅" : result.communicationStyle.responseLength === "medium" ? "适中" : "娓娓道来"}</p>
                <p><span className="text-muted-foreground">幽默风格：</span>{result.communicationStyle.humorStyle}</p>
                <p><span className="text-muted-foreground">表情使用：</span>{result.communicationStyle.emojiUsage === "rarely" ? "很少" : result.communicationStyle.emojiUsage === "sometimes" ? "偶尔" : "频繁"}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">温暖度：</span>
                  <Progress value={result.communicationStyle.warmth} className="h-1.5 w-32" />
                  <span className="text-xs">{result.communicationStyle.warmth}/100</span>
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="voice" className="mt-4">
              <Card className="rounded-2xl"><CardContent className="py-4">
                {/* Voice waveform visualization */}
                <div className="flex items-center gap-1 h-16 mb-4">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const h = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
                    return (
                      <div key={i} className="flex-1 rounded-full bg-gradient-to-t from-violet-400 to-purple-400 opacity-30"
                        style={{ height: `${h}px`, animation: `magic-pulse ${1.5 + Math.random()}s ease-in-out infinite`, animationDelay: `${i * 0.05}s` }} />
                    );
                  })}
                </div>
                <div className="text-sm space-y-2">
                  <p><span className="text-muted-foreground">语速推测：</span>{result.voiceProfile.estimatedPace}</p>
                  <p><span className="text-muted-foreground">能量感：</span>{result.voiceProfile.estimatedEnergy}</p>
                  <p><span className="text-muted-foreground">停顿习惯：</span>{result.voiceProfile.pauseStyle}</p>
                  <p><span className="text-muted-foreground">语气词：</span>{result.voiceProfile.fillerWords.join("、") || "无明显语气词"}</p>
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="snapshot" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "问候", value: result.interactionSnapshot.greeting, icon: "👋" },
                  { label: "告别", value: result.interactionSnapshot.farewell, icon: "👋" },
                  { label: "鼓励", value: result.interactionSnapshot.encouragement, icon: "💪" },
                  { label: "冲突回应", value: result.interactionSnapshot.conflictResponse, icon: "💬" },
                ].map((item) => (
                  <Card key={item.label} className="rounded-2xl">
                    <CardContent className="py-3">
                      <p className="text-[10px] text-muted-foreground">{item.icon} {item.label}</p>
                      <p className="text-sm mt-1">"{item.value}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" onClick={() => { setStage("upload"); setResult(null); }} className="rounded-xl">
              <RefreshCw className="size-3.5 mr-1" /> 重新蒸馏
            </Button>
            <Button onClick={() => setStage("chat")} className="rounded-xl">
              <MessageSquare className="size-3.5 mr-1" /> 开始对话
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ Stage 4: Chat with Digital Friend ═══ */}
      {stage === "chat" && result && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <User className="size-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{result.personalityCard.name}</p>
                  <p className="text-[10px] text-muted-foreground">数字挚友 · 声魂蒸馏</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStage("result")}>
                返回档案
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto space-y-3 mb-4 p-2">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                  <Heart className="size-8 text-violet-300" />
                  <p className="text-sm text-muted-foreground">开始和你重建的挚友对话</p>
                  <p className="text-xs text-muted-foreground/60">ta会按照分析出的人格特质来回复</p>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {m.content || (m.role === "assistant" && chatLoading && <Loader2 className="size-4 animate-spin" />)}
                  </div>
                </div>
              ))}
              {chatLoading && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="bg-muted rounded-2xl px-4 py-2.5"><Loader2 className="size-4 animate-spin" /></div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`和 ${result.personalityCard.name} 聊天…`}
                className="flex-1 rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={chatLoading}
              />
              <Button onClick={sendMessage} disabled={!chatInput.trim() || chatLoading} size="sm" className="rounded-xl">
                发送
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
