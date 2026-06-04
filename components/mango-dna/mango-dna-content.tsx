"use client";

import * as React from "react";
import {
  Dna, Upload, Brain, Sparkles, MemoryStick,
  Rocket, Play, Bot, GraduationCap, LineChart, Zap,
  CheckCircle2, Clock, Star, Shield, User,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Mock data ──────────────────────────────────────────────────

const FEATURES = [
  { icon: Upload,      title: "文档上传", desc: "上传笔记、论文、聊天记录——支持 PDF / Markdown / 纯文本", color: "var(--chart-1)" },
  { icon: Brain,       title: "思维提取", desc: "AI 分析写作风格、思维偏好与认知倾向，生成思维画像",       color: "var(--chart-2)" },
  { icon: Sparkles,    title: "AI 人格",   desc: "创建专属 AI 代理——像你一样思考、学习和决策",              color: "var(--chart-4)" },
  { icon: MemoryStick, title: "长期记忆", desc: "持久化保存知识、偏好与互动历史，每次对话都更懂你",         color: "var(--chart-3)" },
];

const STEPS = [
  { num: 1, title: "描述自己", desc: "写下学习目标、思维习惯与期待的人格特质" },
  { num: 2, title: "上传素材", desc: "上传笔记、文章、聊天记录——越多越好" },
  { num: 3, title: "DNA 分析", desc: "Mango DNA 引擎提取思维指纹与认知模式" },
  { num: 4, title: "生成人格", desc: "AI 生成专属人格模型，可随时调整迭代" },
];

const PERSONA = {
  name: "林深 #1",
  tagline: "理性而好奇的金融 AI 学习者",
  traits: [
    { label: "系统性思维", pct: 88 }, { label: "数学直觉", pct: 76 },
    { label: "跨学科连接", pct: 82 }, { label: "批判性阅读", pct: 71 },
    { label: "英语表达", pct: 65 }, { label: "创造力", pct: 73 },
  ],
  knowledge: ["深度学习","NLP","DCF估值","微观经济","线性代数","学术写作"],
  thinkingStyle: "先把握整体框架再深入细节。偏好用数学和直觉双通道理解概念，善于跨学科建立类比。",
  model: "DeepSeek-V3 · 32K · Temp 0.7",
  trainedOn: "193 笔记 · 82 论文 · 56 对话",
  updated: "2026-06-04",
};

const AGENTS = [
  { icon: GraduationCap, name: "学习教练", desc: "根据知识短板制定个性化学习路径", status: "可用",    color: "var(--chart-1)" },
  { icon: User,          name: "未来自己", desc: "扮演最理想的你——复盘今天，建议明天",   status: "即将上线", color: "var(--chart-2)" },
  { icon: Rocket,        name: "创业顾问", desc: "结合技术背景与金融知识，评估商业想法",   status: "即将上线", color: "var(--chart-3)" },
  { icon: LineChart,     name: "经济导师", desc: "用你的思维风格讲解经济概念",             status: "可用",    color: "var(--chart-4)" },
];

// ═══════════════════════════════════════════════════════════════
// MOBILE — Native App UI
// ═══════════════════════════════════════════════════════════════

function MobileDNA() {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background rounded-2xl px-4 pt-10 pb-6 text-center">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 50% 30%, var(--primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <span className="relative bg-primary/15 flex size-16 mx-auto items-center justify-center rounded-2xl mb-4">
          <Dna className="text-primary size-8" />
        </span>
        <h1 className="relative text-2xl font-extrabold tracking-tight">
          Mango <span className="text-primary">DNA</span>
        </h1>
        <p className="relative text-muted-foreground text-[13px] leading-relaxed mt-2 max-w-xs mx-auto">
          构建专属 AI 人格——像你一样思考的第二大脑
        </p>
        <Button size="lg" className="relative mt-5 w-full rounded-xl font-semibold shadow-lg shadow-primary/20">
          <Rocket className="size-4" /> 创建我的 DNA
        </Button>
      </section>

      {/* ── Core Features — 2×2 Icon Grid ────────────────── */}
      <section className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-primary size-4" />
          <span className="text-sm font-bold">核心能力</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className="flex flex-col gap-2 rounded-2xl border bg-card p-4 active:scale-[0.98] transition-transform">
                <span className="flex size-9 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${f.color} 20%, transparent), color-mix(in oklch, ${f.color} 8%, transparent))` }}>
                  <Icon className="size-4" style={{ color: f.color }} />
                </span>
                <p className="text-[13px] font-semibold leading-tight">{f.title}</p>
                <p className="text-muted-foreground text-[11px] leading-snug">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Flow Steps — Timeline ────────────────────────── */}
      <section className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="text-primary size-4" />
          <span className="text-sm font-bold">创建流程</span>
        </div>
        <div className="rounded-2xl border bg-card px-4 py-3">
          {STEPS.map((s, i) => {
            const active = s.num <= 2;
            return (
              <div key={s.num} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                  }`}>{s.num}</span>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className={`pb-4 ${!active ? "opacity-45" : ""}`}>
                  <p className="text-[13px] font-semibold">{s.title}</p>
                  <p className="text-muted-foreground text-[12px] leading-snug mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Persona Card ─────────────────────────────────── */}
      <section className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="text-primary size-4" />
          <span className="text-sm font-bold">你的人格画像</span>
        </div>

        <div className="rounded-2xl border-2 border-primary/15 bg-card overflow-hidden">
          {/* Header bar */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-3.5 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/15 flex size-9 items-center justify-center rounded-full">
                <Bot className="text-primary size-4" />
              </span>
              <div>
                <p className="text-sm font-bold">{PERSONA.name}</p>
                <p className="text-muted-foreground text-[11px]">{PERSONA.tagline}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px] gap-1 px-2"><CheckCircle2 className="size-3" />Active</Badge>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex flex-col gap-4">
            {/* Quote */}
            <div className="bg-muted/50 rounded-xl px-3 py-2.5 border-l-2 border-primary/30">
              <p className="text-[13px] leading-relaxed italic text-muted-foreground">「{PERSONA.thinkingStyle}」</p>
            </div>

            {/* Trait bars */}
            <div className="grid gap-2.5">
              {PERSONA.traits.map(t => (
                <div key={t.label} className="flex items-center gap-2.5">
                  <span className="text-[12px] w-[72px] shrink-0 font-medium">{t.label}</span>
                  <Progress value={t.pct} className="flex-1 h-2 rounded-full" />
                  <span className="text-[11px] text-muted-foreground w-8 text-right tabular-nums font-mono">{t.pct}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {PERSONA.knowledge.map(k => (
                <Badge key={k} variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full">{k}</Badge>
              ))}
            </div>

            {/* Meta strip */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-muted-foreground">模型</p>
                <p className="font-semibold mt-0.5">{PERSONA.model}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-muted-foreground">更新</p>
                <p className="font-semibold mt-0.5">{PERSONA.updated}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Agent Gallery ────────────────────────────────── */}
      <section className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="text-primary size-4" />
          <span className="text-sm font-bold">Agent 画廊</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {AGENTS.map(a => {
            const Icon = a.icon;
            const avail = a.status === "可用";
            return (
              <div key={a.name}
                className={`rounded-2xl border bg-card p-4 flex flex-col gap-2.5 active:scale-[0.98] transition-transform ${!avail ? "opacity-55" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg"
                    style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${a.color} 20%, transparent), color-mix(in oklch, ${a.color} 8%, transparent))` }}>
                    <Icon className="size-3.5" style={{ color: a.color }} />
                  </span>
                  <Badge variant={avail ? "success" : "secondary"} className="text-[10px] px-1.5">{a.status}</Badge>
                </div>
                <p className="text-[13px] font-semibold leading-tight">{a.name}</p>
                <p className="text-muted-foreground text-[11px] leading-snug">{a.desc}</p>
                <Button size="sm" variant={avail ? "default" : "outline"}
                  className="mt-auto w-full rounded-xl text-xs h-8" disabled={!avail}>
                  {avail ? "启动" : "敬请期待"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <section className="px-4 pt-6 pb-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 px-5 py-6 text-center flex flex-col items-center gap-3">
          <Dna className="text-primary size-9" />
          <p className="text-sm font-bold">Mango DNA v2.0 即将上线</p>
          <p className="text-muted-foreground text-[12px] leading-relaxed">当前为 UI 预览。加入等待列表第一时间体验正式版。</p>
          <Button size="lg" className="w-full rounded-xl font-semibold shadow-md">
            <Star className="size-4" /> 加入等待列表
          </Button>
          <span className="text-muted-foreground text-[10px] flex items-center gap-1">
            <Shield className="size-3" /> 隐私优先 · 数据完全由你控制
          </span>
        </div>
      </section>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP — Wide two-column
// ═══════════════════════════════════════════════════════════════

function DesktopDNA() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
          <Dna className="text-primary size-7" />
        </span>
        <div className="flex flex-col gap-2 max-w-lg">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Mango DNA</h1>
            <Badge variant="info" className="text-[10px]">Preview</Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            构建你的专属 AI 人格代理——它会学习你的思维方式、记住你的知识体系，
            成为真正懂你的第二大脑。下一代 Mango Learning OS 核心功能。
          </p>
        </div>
        <div className="flex gap-3">
          <Button><Rocket className="size-4" /> 创建我的 DNA</Button>
          <Button variant="outline"><Play className="size-4" /> 观看演示</Button>
        </div>
      </section>

      {/* Features 4-col */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-primary size-4" />
          <span className="text-sm font-semibold">核心能力</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-card flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-md">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in oklch, ${f.color} 15%, transparent)` }}>
                  <Icon className="size-5" style={{ color: f.color }} />
                </span>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="text-primary size-4" />
          <span className="text-sm font-semibold">创建流程</span>
        </div>
        <Card>
          <CardContent className="py-4">
            {STEPS.map((s, i) => {
              const active = s.num <= 2;
              return (
                <div key={s.num} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s.num}</span>
                    {i < STEPS.length - 1 && <div className={`w-px flex-1 mt-1 ${active ? "bg-primary/30" : "bg-border"}`} />}
                  </div>
                  <div className={`pb-6 ${!active ? "opacity-50" : ""}`}>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Persona + Gallery */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-primary/20">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 py-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 flex size-10 items-center justify-center rounded-full"><Bot className="text-primary size-5" /></span>
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-semibold">{PERSONA.name}</h3><Badge variant="info">v1.0</Badge></div>
                    <p className="text-muted-foreground text-xs">{PERSONA.tagline}</p>
                  </div>
                </div>
                <Badge variant="success" className="gap-1"><CheckCircle2 className="size-3" /> Active</Badge>
              </div>
            </div>
            <CardContent className="flex flex-col gap-5 pt-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">思维风格</p>
                <p className="text-sm leading-relaxed">{PERSONA.thinkingStyle}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">认知特征</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PERSONA.traits.map(t => (
                    <div key={t.label} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs"><span>{t.label}</span><span className="text-muted-foreground tabular-nums">{t.pct}%</span></div>
                      <Progress value={t.pct} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">知识领域</p>
                <div className="flex flex-wrap gap-1.5">{PERSONA.knowledge.map(k => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}</div>
              </div>
              <div className="bg-muted/50 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg p-3 text-xs">
                <div><span className="text-muted-foreground">模型</span><p className="font-medium">{PERSONA.model}</p></div>
                <div><span className="text-muted-foreground">数据来源</span><p className="font-medium">{PERSONA.trainedOn}</p></div>
                <div><span className="text-muted-foreground">最后更新</span><p className="font-medium flex items-center gap-1"><Clock className="size-3" />{PERSONA.updated}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Agent 画廊</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {AGENTS.map(a => {
              const Icon = a.icon;
              const avail = a.status === "可用";
              return (
                <div key={a.name} className={`group flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-md ${!avail ? "opacity-70" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `color-mix(in oklch, ${a.color} 15%, transparent)` }}>
                      <Icon className="size-4" style={{ color: a.color }} />
                    </span>
                    <Badge variant={avail ? "success" : "secondary"} className="text-[10px]">{a.status}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold">{a.name}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{a.desc}</p>
                  <Button size="sm" variant={avail ? "default" : "outline"} className="mt-auto w-full" disabled={!avail}>
                    {avail ? <><Play className="size-3.5" /> 启动</> : <><Clock className="size-3.5" /> 敬请期待</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <span className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-2xl"><Dna className="text-primary size-6" /></span>
          <div className="flex-1">
            <p className="font-semibold">Mango DNA 将在 v2.0 正式上线</p>
            <p className="text-muted-foreground mt-0.5 text-sm">当前为 UI 预览。正式版支持真实文档上传、AI 人格生成与长期记忆持久化。</p>
          </div>
          <div className="flex gap-2">
            <Button><Star className="size-4" /> 加入等待列表</Button>
            <Button variant="outline" size="sm" className="gap-1"><Shield className="size-3.5" /> 隐私优先</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Entry
// ═══════════════════════════════════════════════════════════════

export function MangoDNAContent() {
  return (
    <>
      <div className="md:hidden"><MobileDNA /></div>
      <div className="hidden md:block"><DesktopDNA /></div>
    </>
  );
}
