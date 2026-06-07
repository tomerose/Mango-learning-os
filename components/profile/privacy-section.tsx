"use client";

import * as React from "react";
import {
  Shield, Trash2, AlertTriangle, Check, Loader2, Eye, EyeOff,
  Database, Heart, Mail, MessageCircle, Globe, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacySection() {
  const [showDelete, setShowDelete] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [storagePref, setStoragePref] = React.useState<"local" | "cloud">(() => {
    try { return (localStorage.getItem("mango-storage-pref") as "local" | "cloud") || "local"; }
    catch { return "local"; }
  });

  async function handleDelete() {
    if (confirmText !== "删除我的数据" || deleting) return;
    setDeleting(true); setError(null);
    try {
      const res = await fetch("/api/user/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (data.success && data.clearedKeys) {
        data.clearedKeys.forEach((key: string) => { try { localStorage.removeItem(key); } catch {} });
        setDeleted(true);
      } else setError(data.error ?? "删除失败");
    } catch { setError("网络错误，请重试"); }
    finally { setDeleting(false); }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── About Us ── */}
      <div className="card-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="size-4 text-rose-400" />
          <h2 className="text-[15px] font-semibold">关于我们</h2>
        </div>
        <div className="space-y-4">
          <div className="prose prose-sm text-[13px] text-fg-muted/80 leading-relaxed space-y-2">
            <p>
              <strong className="text-fg font-serif text-[15px]">Mango Learning OS</strong> 是由
              <span className="text-primary font-medium">第三自习室</span>出品的 AI 原生学习操作系统。
            </p>
            <p>我们相信学习不应该是孤独的、焦虑的。通过 AI Agent、结构化学习包、知识森林和心灵花园，我们致力于让每一位学习者都能「把焦虑变成准备」。</p>
            <p className="text-[11px] text-fg-muted/50">内测版（V0.1）· 2026年6月</p>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-bg-subtle rounded-xl p-4">
            <ContactItem icon={Mail} label="邮箱" value="1211000567@qq.com" />
            <ContactItem icon={MessageCircle} label="微信" value="sillyfind2025 / tokentome222" />
            <ContactItem icon={Globe} label="网站" value="mangoleaningos.top" />
            <ContactItem icon={Info} label="出品" value="第三自习室 · 把焦虑变成准备" />
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="card-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          常见问题
        </h2>
        <div className="space-y-1">
          {[
            { q: "Mango Learning OS 是什么？", a: "一个 AI 原生的学习操作系统，集成了 AI Agent、学习包生成、知识森林、心灵花园等功能。目前处于内测阶段（V0.1）。" },
            { q: "如何注册使用？", a: "访问 mangoleaningos.top/login，使用邀请码 sillyfind2025（游客）或 tokentome222（注册）即可。" },
            { q: "游客和注册用户有什么区别？", a: "游客可以浏览演示内容和体验基本功能。注册登录后可使用 AI Agent、学习包生成、云端同步等完整功能。" },
            { q: "如何升级到 Pro？", a: "在「我的 → 计划」中使用 Mango Code 兑换码即可升级。兑换码由管理员生成并分发。" },
            { q: "数据安全吗？", a: "绝对安全。游客数据仅存于本地浏览器；注册用户可选择本地或云端存储。心灵花园内容额外加密。我们不会将你的学习数据用于任何商业用途。" },
            { q: "心灵花园是什么？", a: "心灵花园是一个 AI 驱动的心理健康支持模块，包含日记、情绪追踪、认知重构和 AI 陪伴对话。它不是医疗建议，而是学习过程中的情感支持工具。" },
            { q: "支持哪些设备？", a: "Mango Learning OS 是一个 PWA 应用，支持所有现代浏览器。在手机上可通过浏览器添加到主屏幕，获得接近原生 App 的体验。" },
            { q: "如何联系团队？", a: "发送邮件至 1211000567@qq.com，或添加微信 sillyfind2025 / tokentome222。我们会在 24 小时内回复。" },
          ].map((faq, i) => (
            <details key={i} className="group border-b border-border/30 last:border-0">
              <summary className="py-3 text-[13px] font-medium cursor-pointer hover:text-primary transition-colors select-none">
                {faq.q}
              </summary>
              <p className="pb-3 text-[12px] text-fg-muted/70 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* ── Storage ── */}
      <div className="card-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="size-4 text-fg-muted" />
          <h2 className="text-[15px] font-semibold">数据存储</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium flex items-center gap-1.5">
              {storagePref === "local" ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              {storagePref === "local" ? "本地存储" : "云端存储"}
            </p>
            <p className="text-[11px] text-fg-muted/60 mt-0.5">
              {storagePref === "local" ? "数据保存在当前浏览器，换设备无法同步" : "数据保存在 Supabase 云端，任意设备登录后自动同步"}
            </p>
          </div>
          <button onClick={() => {
            const n = storagePref === "local" ? "cloud" : "local";
            setStoragePref(n);
            localStorage.setItem("mango-storage-pref", n);
          }} className="text-[12px] text-primary font-medium hover:underline shrink-0">
            切换到{storagePref === "local" ? "云端" : "本地"}
          </button>
        </div>
      </div>

      {/* ── Privacy Policy ── */}
      <div className="card-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-fg-muted" />
          <h2 className="text-[15px] font-semibold">隐私政策</h2>
        </div>
        <div className="space-y-3 text-[13px] text-fg-muted/70 leading-relaxed">
          <p>你的数据，你做主。第三自习室承诺：</p>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>数据所有权</strong>：所有学习数据（笔记、学习包、错题、闪卡、日记）完全属于你，我们不会查看、分析或用于任何商业目的。</li>
            <li><strong>存储选择</strong>：你可以选择本地存储（数据仅存于浏览器）或云端存储（通过 Supabase 加密传输和存储）。</li>
            <li><strong>心灵花园隐私</strong>：心灵花园的日记、情绪记录和陪伴对话使用额外加密，即使是系统管理员也无法查看。</li>
            <li><strong>AI 调用</strong>：AI 生成请求通过 DeepSeek API 处理，内容仅用于当次生成，不会被存储或用于模型训练。</li>
            <li><strong>可删除性</strong>：你可以在任何时候一键删除所有学习数据（见下方「清除数据」），删除操作不可撤销。</li>
            <li><strong>无追踪</strong>：我们不使用任何第三方追踪、广告 SDK 或用户行为分析工具。</li>
          </ul>
        </div>
      </div>

      {/* ── Delete Data ── */}
      <div className="card-card p-5 sm:p-6 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="size-4 text-red-500" />
          <h2 className="text-[15px] font-semibold text-red-600">清除学习数据</h2>
        </div>
        {deleted ? (
          <div className="flex items-start gap-2 px-3 py-3 rounded-lg bg-green-50 text-green-700 text-[13px]">
            <Check className="size-4 shrink-0 mt-0.5" />
            <div><p className="font-medium">数据已清除</p><p className="text-[11px] mt-0.5 opacity-70">你的学习数据已从浏览器和云端清除。账号仍然保留。</p></div>
          </div>
        ) : !showDelete ? (
          <div>
            <p className="text-[13px] text-fg-muted/70 mb-3">清除所有学习数据（学习包、Agent 任务、笔记、错题、闪卡等）。此操作不可撤销。</p>
            <button onClick={() => setShowDelete(true)} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors">删除我的数据</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-[12px]">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div><p className="font-medium">确认删除</p><p className="mt-0.5 opacity-80">此操作将清除所有学习数据且不可恢复。账号本身不会被删除。</p></div>
            </div>
            <p className="text-[12px] text-fg-muted/60">输入 <span className="font-mono font-medium text-fg">删除我的数据</span> 以确认：</p>
            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="删除我的数据" className="w-full h-10 rounded-lg border border-border px-3 text-[13px] bg-bg-subtle focus:outline-none focus:border-red-300" />
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleDelete} disabled={confirmText !== "删除我的数据" || deleting} className="h-10 px-4 rounded-lg text-[13px] bg-red-500 hover:bg-red-600 text-white">{deleting ? <Loader2 className="size-4 animate-spin" /> : "确认删除"}</Button>
              <button onClick={() => { setShowDelete(false); setConfirmText(""); setError(null); }} className="h-10 px-4 rounded-lg text-[13px] text-fg-muted hover:text-fg">取消</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Version ── */}
      <div className="card-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold mb-3">版本信息</h2>
        <div className="space-y-2 text-[13px] text-fg-muted/70">
          <p><strong className="text-fg">内测版（V0.1）</strong></p>
          <p className="text-[11px]">2026年6月更新 · 第三自习室出品</p>
          <p className="text-[11px]">学习路上不孤单，我们一同前行。</p>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon className="size-3.5 text-fg-muted/40 shrink-0" />
      <span className="text-fg-muted/50">{label}:</span>
      <span className="font-medium text-fg truncate">{value}</span>
    </div>
  );
}
