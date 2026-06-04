"use client";

import * as React from "react";
import {
  Dna,
  Upload,
  Brain,
  Sparkles,
  MemoryStick,
  ArrowRight,
  Star,
  FileText,
  MessageSquare,
  Rocket,
  ChevronRight,
  Play,
  User,
  Bot,
  GraduationCap,
  LineChart,
  Zap,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Upload,
    title: "文档上传",
    desc: "上传笔记、论文、聊天记录等任意文本，构建你的知识记忆库。支持 PDF / Markdown / 纯文本。",
    color: "var(--chart-1)",
  },
  {
    icon: Brain,
    title: "思维风格提取",
    desc: "AI 分析你的写作风格、思维偏好、决策模式与认知倾向，生成思维风格画像。",
    color: "var(--chart-2)",
  },
  {
    icon: Sparkles,
    title: "AI 人格生成",
    desc: "基于你的知识库与思维模式，创建专属 AI 人格代理——像你一样思考、学习和决策。",
    color: "var(--chart-4)",
  },
  {
    icon: MemoryStick,
    title: "长期记忆",
    desc: "AI 代理持久化保存你的知识、偏好与互动历史，每次对话都更懂你。",
    color: "var(--chart-3)",
  },
];

const CREATION_STEPS = [
  { num: 1, title: "描述自己", desc: "用文字描述你的学习目标、思维习惯、偏好领域与期待的人格特质。" },
  { num: 2, title: "上传素材", desc: "上传你的笔记、文章、聊天记录等——越多越好，AI 会从中学习。" },
  { num: 3, title: "DNA 分析", desc: "Mango DNA 引擎分析你的文本，提取思维指纹与认知模式。" },
  { num: 4, title: "生成人格", desc: "AI 生成你的专属人格模型，可随时调整和迭代。" },
];

const MOCK_PERSONA = {
  name: "林深 #1",
  tagline: "「理性而好奇的金融 AI 学习者」",
  traits: [
    { label: "系统性思维", pct: 88 },
    { label: "数学直觉", pct: 76 },
    { label: "跨学科连接", pct: 82 },
    { label: "批判性阅读", pct: 71 },
    { label: "英语表达", pct: 65 },
    { label: "创造力", pct: 73 },
  ],
  knowledge: ["深度学习", "NLP", "DCF 估值", "微观经济", "线性代数", "学术写作"],
  thinkingStyle: "先把握整体框架再深入细节。偏好用数学和直觉双通道理解概念，善于在不同学科间建立类比。做决策前倾向于收集足够信息。",
  model: "DeepSeek-V3 · 32K context · Temperature 0.7",
  trainedOn: "193 篇笔记 · 82 篇论文摘要 · 56 段 AI 导师对话",
  lastUpdated: "2026-06-04",
};

const AGENTS = [
  {
    icon: GraduationCap,
    name: "学习教练",
    desc: "根据你的知识短板制定个性化学习路径，实时调整难度与节奏。",
    status: "可用",
    color: "var(--chart-1)",
  },
  {
    icon: User,
    name: "未来自己",
    desc: "扮演「最理想的你」——复盘今天的决策，为明天给出建议。",
    status: "即将上线",
    color: "var(--chart-2)",
  },
  {
    icon: Rocket,
    name: "创业顾问",
    desc: "结合你的技术背景与金融知识，评估商业想法并提供行动建议。",
    status: "即将上线",
    color: "var(--chart-3)",
  },
  {
    icon: LineChart,
    name: "经济导师",
    desc: "用你的思维风格讲解经济概念，把复杂模型翻译成你理解的语言。",
    status: "可用",
    color: "var(--chart-4)",
  },
];

// ── Sub-components ─────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc, color }: typeof FEATURES[number]) {
  return (
    <div className="bg-card group flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-md">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
      >
        <Icon className="size-5" style={{ color }} />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepIndicator({ step, active, last }: { step: typeof CREATION_STEPS[number]; active: boolean; last: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {step.num}
        </span>
        {!last && <div className={cn("mt-1 w-px flex-1", active ? "bg-primary/30" : "bg-border")} />}
      </div>
      <div className={cn("flex flex-col gap-0.5 pb-6 transition-opacity", !active && "opacity-50")}>
        <p className="text-sm font-medium">{step.title}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

function PersonaCard() {
  return (
    <Card className="overflow-hidden border-primary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 py-5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <Bot className="text-primary size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{MOCK_PERSONA.name}</h3>
                <Badge variant="info">v1.0</Badge>
              </div>
              <p className="text-muted-foreground text-xs">{MOCK_PERSONA.tagline}</p>
            </div>
          </div>
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="size-3" /> Active
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-col gap-5 pt-5">
        {/* Thinking style */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">思维风格</p>
          <p className="text-sm leading-relaxed">{MOCK_PERSONA.thinkingStyle}</p>
        </div>

        {/* Traits */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">认知特征</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {MOCK_PERSONA.traits.map((t) => (
              <div key={t.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span>{t.label}</span>
                  <span className="text-muted-foreground tabular-nums">{t.pct}%</span>
                </div>
                <Progress value={t.pct} />
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge domains */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">知识领域</p>
          <div className="flex flex-wrap gap-1.5">
            {MOCK_PERSONA.knowledge.map((k) => (
              <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="bg-muted/50 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg p-3 text-xs">
          <div><span className="text-muted-foreground">模型</span><p className="font-medium">{MOCK_PERSONA.model}</p></div>
          <div><span className="text-muted-foreground">数据来源</span><p className="font-medium">{MOCK_PERSONA.trainedOn}</p></div>
          <div>
            <span className="text-muted-foreground">最后更新</span>
            <p className="font-medium flex items-center gap-1">
              <Clock className="size-3" />{MOCK_PERSONA.lastUpdated}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ agent }: { agent: typeof AGENTS[number] }) {
  const Icon = agent.icon;
  const available = agent.status === "可用";
  return (
    <div className={cn(
      "group flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-md",
      !available && "opacity-70"
    )}>
      <div className="flex items-center justify-between">
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklch, ${agent.color} 15%, transparent)` }}
        >
          <Icon className="size-4" style={{ color: agent.color }} />
        </span>
        <Badge variant={available ? "success" : "secondary"} className="text-[10px]">
          {agent.status}
        </Badge>
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold">{agent.name}</h4>
        <p className="text-muted-foreground text-xs leading-relaxed">{agent.desc}</p>
      </div>
      <Button
        size="sm"
        variant={available ? "default" : "outline"}
        className="mt-auto w-full"
        disabled={!available}
      >
        {available ? (
          <><Play className="size-3.5" /> 启动</>
        ) : (
          <><Clock className="size-3.5" /> 敬请期待</>
        )}
      </Button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────

export function MangoDNAContent() {
  const [currentStep, setCurrentStep] = React.useState(2);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero ─────────────────────────────────────────────── */}
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
          <Button>
            <Rocket className="size-4" /> 创建我的 DNA
          </Button>
          <Button variant="outline">
            <Play className="size-4" /> 观看演示
          </Button>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <h2 className="text-sm font-semibold">核心能力</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Creation flow ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary size-4" />
          <h2 className="text-sm font-semibold">创建流程</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col pt-0">
            {CREATION_STEPS.map((s, i) => (
              <StepIndicator
                key={s.num}
                step={s}
                active={s.num <= currentStep}
                last={i === CREATION_STEPS.length - 1}
              />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ── Persona Card + Gallery ─────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonaCard />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Agent 画廊</h2>
            <Button variant="ghost" size="sm" className="text-xs">
              全部 <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {AGENTS.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <span className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <Dna className="text-primary size-6" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Mango DNA 将在 v2.0 正式上线</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              当前为 UI 预览。正式版支持真实文档上传、AI 人格生成与长期记忆持久化。
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Star className="size-4" /> 加入等待列表
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Shield className="size-3.5" /> 隐私优先
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
