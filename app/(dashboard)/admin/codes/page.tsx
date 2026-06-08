"use client";

import * as React from "react";
import {
  Key, Plus, Ban, CheckCircle2, Loader2, Copy, Trash2, RefreshCw,
  Ticket, Users, Clock, AlertTriangle, ShieldCheck, ChevronRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MangoCodeEntry {
  id: string; code: string; planGranted: string; durationDays: number;
  maxRedemptions: number; usedCount: number; status: string;
  createdBy: string; notes?: string; createdAt: string; updatedAt: string;
  redeemedBy?: string; redeemedAt?: string; expiresAt?: string;
}

interface CodeStats {
  total: number; active: number; used: number; expired: number; disabled: number;
}

const PLAN_LABELS: Record<string, string> = { standard: "Standard", pro: "Pro", admin: "Admin" };
const PLAN_COLORS: Record<string, string> = {
  standard: "bg-blue-50 text-blue-700", pro: "bg-amber-100 text-amber-700", admin: "bg-red-100 text-red-700",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700", used: "bg-slate-100 text-slate-600",
  expired: "bg-gray-100 text-gray-500", disabled: "bg-red-50 text-red-500", revoked: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  active: "可用", used: "已使用", expired: "已过期", disabled: "已停用", revoked: "已撤销",
};

export default function AdminCodesPage() {
  const [codes, setCodes] = React.useState<MangoCodeEntry[]>([]);
  const [stats, setStats] = React.useState<CodeStats>({ total: 0, active: 0, used: 0, expired: 0, disabled: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genResult, setGenResult] = React.useState<string[] | null>(null);
  const [toastMsg, setToastMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null);

  // Generate form
  const [genPlan, setGenPlan] = React.useState("pro");
  const [genDuration, setGenDuration] = React.useState("30");
  const [genCount, setGenCount] = React.useState("5");
  const [genMaxUses, setGenMaxUses] = React.useState("1");
  const [genNote, setGenNote] = React.useState("");
  const [genDurationType, setGenDurationType] = React.useState("days");

  const toast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/codes");
      if (res.status === 401) { setError("请先登录管理员账号"); setLoading(false); return; }
      if (res.status === 403) { setError("无管理员权限"); setLoading(false); return; }
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error((errJson as any)?.error?.message || `服务器错误 (${res.status})`);
      }
      const json = await res.json();
      if (json.success) {
        setCodes(json.data.codes || []);
        setStats(json.data.stats || { total: 0, active: 0, used: 0, expired: 0, disabled: 0 });
      }
    } catch (e: any) {
      setError(e.message || "加载失败");
    }
    setLoading(false);
  }

  React.useEffect(() => { loadData(); }, []);

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
          durationType: genDurationType,
          count: parseInt(genCount),
          maxUses: parseInt(genMaxUses),
          notes: genNote || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGenResult(json.data.codes);
        toast("success", `已生成 ${json.data.codes.length} 个 ${PLAN_LABELS[genPlan]} 码`);
        loadData();
      } else {
        toast("error", json.error?.message || "生成失败");
      }
    } catch {
      toast("error", "网络错误");
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
      const json = await res.json();
      if (json.success) {
        toast("success", `${code.slice(0, 16)}... → ${STATUS_LABELS[newStatus]}`);
        loadData();
      } else {
        toast("error", json.error?.message || "操作失败");
      }
    } catch { toast("error", "网络错误"); }
  }

  async function handleDelete(code: string) {
    if (!confirm(`确定删除 ${code}？此操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/admin/codes?code=${encodeURIComponent(code)}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast("success", "已删除"); loadData(); }
      else toast("error", json.error?.message || "删除失败");
    } catch { toast("error", "网络错误"); }
  }

  function copyAll(newCodes: string[]) {
    navigator.clipboard.writeText(newCodes.join("\n")).then(
      () => toast("success", "已复制全部码"),
      () => toast("error", "复制失败"),
    );
  }

  function copyOne(code: string) {
    navigator.clipboard.writeText(code).then(
      () => toast("success", "已复制"),
      () => toast("error", "复制失败"),
    );
  }

  // ═══════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-display font-serif">Mango Code 管理</h1>
          <p className="text-sm text-fg-muted/90 mt-1">管理内测、Pro 权益与兑换码</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}
          className="rounded-xl gap-1.5">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />刷新
        </Button>
      </header>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />{error}
          </div>
          <button onClick={() => setError("")}><X className="size-4" /></button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: "总计", value: stats.total, icon: Ticket, color: "text-fg" },
          { label: "可用", value: stats.active, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "已使用", value: stats.used, icon: Users, color: "text-blue-600" },
          { label: "已过期", value: stats.expired, icon: Clock, color: "text-gray-500" },
          { label: "已停用", value: stats.disabled, icon: Ban, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="card-card p-3.5 flex items-center gap-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-bg-subtle ${s.color}`}>
              <s.icon className="size-4" />
            </span>
            <div>
              <p className="text-lg font-bold">{loading ? "-" : s.value}</p>
              <p className="text-[10px] text-fg-muted/90">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Generate panel */}
      <div className="card-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">生成新兑换码</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">等级</label>
            <select value={genPlan} onChange={e => setGenPlan(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium outline-none focus:border-primary/30">
              <option value="pro">Pro</option>
              <option value="standard">Standard</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">时长类型</label>
            <select value={genDurationType} onChange={e => setGenDurationType(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium outline-none focus:border-primary/30">
              <option value="days">天</option>
              <option value="month">月</option>
              <option value="year">年</option>
              <option value="lifetime">永久</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">时长值</label>
            <Input value={genDuration} onChange={e => setGenDuration(e.target.value)}
              type="number" min={0} max={3650} disabled={genDurationType === "lifetime"}
              className="h-[42px] rounded-xl text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">数量</label>
            <Input value={genCount} onChange={e => setGenCount(e.target.value)}
              type="number" min={1} max={100} className="h-[42px] rounded-xl text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">使用次数</label>
            <Input value={genMaxUses} onChange={e => setGenMaxUses(e.target.value)}
              type="number" min={1} max={999} className="h-[42px] rounded-xl text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">备注</label>
            <Input value={genNote} onChange={e => setGenNote(e.target.value)}
              placeholder="如：内测邀请" className="h-[42px] rounded-xl text-sm" />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={generating}
          className="rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md">
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
          生成 {genCount} 个 {PLAN_LABELS[genPlan]} 码
        </Button>

        {genResult && genResult.length > 0 && (
          <div className="bg-emerald-50/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-700">✅ 已生成 {genResult.length} 个码</p>
              <Button variant="outline" size="sm" onClick={() => copyAll(genResult)} className="rounded-lg text-[11px] gap-1">
                <Copy className="size-3" />复制全部
              </Button>
            </div>
            <div className="bg-white/70 rounded-lg p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
              {genResult.map((c, i) => <p key={i} className="select-all">{c}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* Code list */}
      <div className="card-card p-5 space-y-3">
        <h2 className="text-sm font-semibold">所有兑换码</h2>

        {loading ? (
          <div className="text-center py-12 text-fg-muted/90 text-sm">加载中…</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Ticket className="size-10 text-fg-subtle/90 mx-auto" />
            <p className="text-sm font-medium text-fg-muted/90">还没有 Mango Code</p>
            <p className="text-xs text-fg-muted/90">使用上方面板生成第一批兑换码</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">Code</th>
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">等级</th>
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">时长</th>
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">状态</th>
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">使用</th>
                    <th className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">创建时间</th>
                    <th className="py-2.5 text-[11px] font-semibold text-fg-muted/90">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-2.5 pr-3">
                        <span className="font-mono text-xs font-semibold">{c.code}</span>
                        {c.notes && <p className="text-[10px] text-fg-muted/90 mt-0.5">{c.notes}</p>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge className={`text-[10px] ${PLAN_COLORS[c.planGranted] || ""}`}>{PLAN_LABELS[c.planGranted] || c.planGranted}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">
                        {c.durationDays === 0 ? "永久" : `${c.durationDays}天`}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge className={`text-[10px] ${STATUS_COLORS[c.status] || ""}`}>{STATUS_LABELS[c.status] || c.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">{c.usedCount}/{c.maxRedemptions}</td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">
                        {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyOne(c.code)}
                            className="size-7 rounded-lg hover:bg-bg-muted flex items-center justify-center"
                            title="复制"><Copy className="size-3 text-fg-muted/90" /></button>
                          {c.status === "active" && (
                            <button onClick={() => handleToggleStatus(c.code, c.status)}
                              className="size-7 rounded-lg hover:bg-amber-50 flex items-center justify-center"
                              title="停用"><Ban className="size-3 text-amber-500" /></button>
                          )}
                          {c.status === "disabled" && (
                            <button onClick={() => handleToggleStatus(c.code, c.status)}
                              className="size-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center"
                              title="启用"><CheckCircle2 className="size-3 text-emerald-500" /></button>
                          )}
                          <button onClick={() => handleDelete(c.code)}
                            className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center"
                            title="删除"><Trash2 className="size-3 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {codes.map(c => (
                <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold truncate">{c.code}</span>
                    <Badge className={`text-[10px] ${STATUS_COLORS[c.status] || ""}`}>{STATUS_LABELS[c.status] || c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-fg-muted/90">
                    <Badge className={`text-[10px] ${PLAN_COLORS[c.planGranted] || ""}`}>{PLAN_LABELS[c.planGranted] || c.planGranted}</Badge>
                    <span>{c.durationDays === 0 ? "永久" : `${c.durationDays}天`}</span>
                    <span>·</span>
                    <span>{c.usedCount}/{c.maxRedemptions}次</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-border/30">
                    <button onClick={() => copyOne(c.code)}
                      className="flex-1 rounded-lg bg-bg-subtle py-1.5 text-[10px] font-medium text-fg-muted/90 flex items-center justify-center gap-1">
                      <Copy className="size-3" />复制
                    </button>
                    {c.status === "active" && (
                      <button onClick={() => handleToggleStatus(c.code, c.status)}
                        className="flex-1 rounded-lg bg-amber-50 py-1.5 text-[10px] font-medium text-amber-600 flex items-center justify-center gap-1">
                        <Ban className="size-3" />停用
                      </button>
                    )}
                    {c.status === "disabled" && (
                      <button onClick={() => handleToggleStatus(c.code, c.status)}
                        className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-[10px] font-medium text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="size-3" />启用
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.code)}
                      className="flex-1 rounded-lg bg-red-50 py-1.5 text-[10px] font-medium text-red-500 flex items-center justify-center gap-1">
                      <Trash2 className="size-3" />删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg animate-fade-up ${
          toastMsg.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
