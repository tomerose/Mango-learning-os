"use client";

import * as React from "react";
import { Key, Plus, Ban, CheckCircle2, X, Loader2, Copy, Trash2, RefreshCw } from "lucide-react";

interface MangoCodeEntry {
  id: string; code: string; planGranted: string; durationDays: number;
  maxRedemptions: number; usedCount: number; status: string;
  createdBy: string; notes?: string; createdAt: string; updatedAt: string;
}

export default function AdminCodesPage() {
  const [codes, setCodes] = React.useState<MangoCodeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genResult, setGenResult] = React.useState<string[] | null>(null);

  // Generate form
  const [genPlan, setGenPlan] = React.useState("pro");
  const [genDuration, setGenDuration] = React.useState("30");
  const [genCount, setGenCount] = React.useState("5");
  const [genNotes, setGenNotes] = React.useState("");

  const durationLabels: Record<string, string> = {
    "1": "日卡", "7": "周卡", "30": "月卡", "90": "季卡", "365": "年卡", "0": "永久",
  };

  async function loadCodes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes");
      if (!res.ok) throw new Error((await res.json()).error || "加载失败");
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  React.useEffect(() => { loadCodes(); }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planGranted: genPlan,
          durationDays: parseInt(genDuration),
          count: parseInt(genCount),
          notes: genNotes || `${durationLabels[genDuration] || genDuration + "天"}·${genCount}张`,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "生成失败");
      const data = await res.json();
      setGenResult(data.codes || []);
      loadCodes();
    } catch (e: any) {
      setError(e.message);
    }
    setGenerating(false);
  }

  async function handleToggleStatus(code: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, status: newStatus }),
      });
      if (!res.ok) throw new Error("操作失败");
      loadCodes();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleRevoke(code: string) {
    if (!confirm(`确定撤销码 ${code}？撤销后不可恢复。`)) return;
    try {
      const res = await fetch("/api/admin/codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, status: "revoked" }),
      });
      if (!res.ok) throw new Error("操作失败");
      loadCodes();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function copyAll(newCodes: string[]) {
    navigator.clipboard.writeText(newCodes.join("\n"));
  }

  const activeCount = codes.filter(c => c.status === "active").length;
  const usedCount = codes.filter(c => c.status === "used").length;

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      <header>
        <h1 className="text-display font-serif">Mango Code 管理</h1>
        <p className="text-sm text-fg-muted/90 mt-1">
          {activeCount} 可用 · {usedCount} 已用 · {codes.length} 总计
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
          <X className="size-4 shrink-0" onClick={() => setError("")} />
          {error}
        </div>
      )}

      {/* ═══ Generate ═══ */}
      <div className="card-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">生成新兑换码</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">等级</label>
            <select value={genPlan} onChange={e => setGenPlan(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm">
              <option value="standard">Standard</option>
              <option value="pro">Pro</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">时长</label>
            <select value={genDuration} onChange={e => setGenDuration(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm">
              <option value="1">日卡 (1天)</option>
              <option value="7">周卡 (7天)</option>
              <option value="30">月卡 (30天)</option>
              <option value="90">季卡 (90天)</option>
              <option value="365">年卡 (365天)</option>
              <option value="0">永久</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">数量</label>
            <input type="number" min={1} max={100} value={genCount}
              onChange={e => setGenCount(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">备注</label>
            <input value={genNotes} onChange={e => setGenNotes(e.target.value)}
              placeholder="可选" className="rounded-xl border border-border bg-bg px-3 py-2 text-sm" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-primary text-primary-on px-5 py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors">
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
          生成 {genCount} 个 {genPlan === "pro" ? "Pro" : genPlan === "admin" ? "Admin" : "Standard"} {durationLabels[genDuration] || genDuration + "天"}
        </button>

        {genResult && genResult.length > 0 && (
          <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-700">✅ 已生成 {genResult.length} 个码</p>
              <button onClick={() => copyAll(genResult)}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline">
                <Copy className="size-3" /> 复制全部
              </button>
            </div>
            <div className="bg-white/60 rounded-lg p-3 font-mono text-xs space-y-1">
              {genResult.map((c, i) => <p key={i}>{c}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Code List ═══ */}
      <div className="card-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">所有兑换码</h2>
          <button onClick={loadCodes} className="flex items-center gap-1 text-[11px] text-fg-muted/90 hover:text-fg">
            <RefreshCw className="size-3" /> 刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-fg-muted/90 text-sm">加载中…</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-fg-muted/90 text-sm">还没有兑换码</div>
        ) : (
          <div className="space-y-1.5">
            {codes.map(c => (
              <div key={c.id} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                c.status === "active" ? "bg-bg-subtle" :
                c.status === "used" ? "bg-bg-subtle opacity-60" : "bg-red-50/30"
              }`}>
                <span className={`shrink-0 size-2 rounded-full ${
                  c.status === "active" ? "bg-emerald-500" :
                  c.status === "used" ? "bg-slate-400" : "bg-red-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-semibold truncate">{c.code}</p>
                    <span className={`shrink-0 text-[9px] rounded-full px-1.5 py-0.5 font-semibold ${
                      c.planGranted === "admin" ? "bg-red-100 text-red-700" :
                      c.planGranted === "pro" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>{c.planGranted}</span>
                  </div>
                  <p className="text-[10px] text-fg-muted/90 mt-0.5">
                    {c.durationDays === 0 ? "永久" : `${c.durationDays}天`}
                    {c.notes ? ` · ${c.notes}` : ""}
                    {c.status === "used" ? ` · 已被兑换` : ""}
                    {" · "}{new Date(c.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                {c.status === "active" && (
                  <>
                    <button onClick={() => handleToggleStatus(c.code, c.status)}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-50 text-amber-600 px-2.5 py-1.5 text-[10px] font-medium hover:bg-amber-100 transition-colors"
                      title="停用">
                      <Ban className="size-3" /> 停用
                    </button>
                    <button onClick={() => handleRevoke(c.code)}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-red-50 text-red-500 px-2.5 py-1.5 text-[10px] font-medium hover:bg-red-100 transition-colors"
                      title="撤销">
                      <Trash2 className="size-3" /> 撤销
                    </button>
                  </>
                )}
                {c.status === "disabled" && (
                  <button onClick={() => handleToggleStatus(c.code, c.status)}
                    className="shrink-0 flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-600 px-2.5 py-1.5 text-[10px] font-medium hover:bg-emerald-100 transition-colors"
                    title="启用">
                    <CheckCircle2 className="size-3" /> 启用
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
