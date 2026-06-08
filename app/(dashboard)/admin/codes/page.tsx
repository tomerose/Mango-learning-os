"use client";

import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Key, Plus, Ban, CheckCircle2, Loader2, Copy, Trash2, RefreshCw,
  Ticket, AlertTriangle, X, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ═══ Constants ═══
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const gen = () => { let s = ""; for (let j = 0; j < 4; j++) s += CHARS[Math.floor(Math.random() * CHARS.length)]; return s; };
const makeCode = (plan: string) => `MANGO-${plan === "admin" ? "ADM" : plan === "pro" ? "PRO" : "STD"}-${gen()}-${gen()}-${gen()}`;

const LABELS: Record<string, string> = { standard: "Standard", pro: "Pro", admin: "Admin" };
const PLAN_COLORS: Record<string, string> = { standard: "bg-blue-50 text-blue-700", pro: "bg-amber-100 text-amber-700", admin: "bg-red-100 text-red-700" };
const STATUS_COLORS: Record<string, string> = { active: "bg-emerald-100 text-emerald-700", used: "bg-slate-100 text-slate-600", expired: "bg-gray-100 text-gray-500", disabled: "bg-red-50 text-red-500", revoked: "bg-red-100 text-red-600" };
const STATUS_LABELS: Record<string, string> = { active: "可用", used: "已使用", expired: "已过期", disabled: "已停用", revoked: "已撤销" };

export default function AdminCodesPage() {
  const [codes, setCodes] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ total: 0, active: 0, used: 0, expired: 0, disabled: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genResult, setGenResult] = React.useState<string[] | null>(null);
  const [toastMsg, setToastMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [sb, setSb] = React.useState<any>(null);

  // Generate form
  const [genPlan, setGenPlan] = React.useState("pro");
  const [genDuration, setGenDuration] = React.useState("30");
  const [genDurationType, setGenDurationType] = React.useState("days");
  const [genCount, setGenCount] = React.useState("5");
  const [genMaxUses, setGenMaxUses] = React.useState("1");
  const [genNote, setGenNote] = React.useState("");

  const toast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Init Supabase + check admin
  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setError("Supabase 未配置"); setLoading(false); return; }
    const client = createClient(url, key);
    setSb(client);
    client.auth.getSession().then(({ data }) => {
      if (!data.session) { setError("请先登录管理员账号"); setIsAdmin(false); setLoading(false); return; }
      const email = data.session.user.email || "";
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "portelamicheli636@gmail.com").split(",").map((e: string) => e.trim().toLowerCase());
      if (!adminEmails.includes(email.toLowerCase())) {
        setError("无管理员权限"); setIsAdmin(false); setLoading(false); return;
      }
      setIsAdmin(true);
      loadData(client);
    }).catch(() => { setError("认证失败"); setLoading(false); });
  }, []);

  async function loadData(client?: any) {
    const c = client || sb;
    if (!c) return;
    setLoading(true); setError("");
    const { data, error: err } = await c.from("mango_codes").select("*").order("created_at", { ascending: false }).limit(200);
    if (err) { setError(err.message); setLoading(false); return; }
    const all = data || [];
    setCodes(all);
    setStats({
      total: all.length, active: all.filter((r: any) => r.status === "active").length,
      used: all.filter((r: any) => r.status === "used").length,
      expired: all.filter((r: any) => r.status === "expired").length,
      disabled: all.filter((r: any) => r.status === "disabled" || r.status === "revoked").length,
    });
    setLoading(false);
  }

  async function handleGenerate() {
    if (!sb) return;
    setGenerating(true); setGenResult(null);
    const newCodes: string[] = [];
    for (let i = 0; i < parseInt(genCount); i++) {
      const code = makeCode(genPlan);
      const { error } = await sb.from("mango_codes").insert({
        code, plan_granted: genPlan, duration_type: genDurationType,
        duration_value: parseInt(genDuration), max_uses: parseInt(genMaxUses),
        note: genNote || null,
      });
      if (!error) newCodes.push(code);
    }
    setGenerating(false);
    if (newCodes.length > 0) {
      setGenResult(newCodes);
      toast("success", `已生成 ${newCodes.length} 个 ${LABELS[genPlan]} 码`);
      loadData();
    } else {
      toast("error", "生成失败，请检查 Supabase 连接");
    }
  }

  async function handleToggleStatus(code: string, status: string) {
    if (!sb) return;
    const ns = status === "active" ? "disabled" : "active";
    const { error } = await sb.from("mango_codes").update({ status: ns }).eq("code", code);
    if (!error) { toast("success", `${code.slice(0, 16)}... → ${STATUS_LABELS[ns]}`); loadData(); }
    else toast("error", error.message);
  }

  async function handleDelete(code: string) {
    if (!confirm(`确定删除 ${code}？`)) return;
    if (!sb) return;
    const { error } = await sb.from("mango_codes").delete().eq("code", code);
    if (!error) { toast("success", "已删除"); loadData(); }
    else toast("error", error.message);
  }

  function copyAll(arr: string[]) { navigator.clipboard.writeText(arr.join("\n")).then(() => toast("success", "已复制"), () => toast("error", "复制失败")); }
  function copyOne(s: string) { navigator.clipboard.writeText(s).then(() => toast("success", "已复制"), () => toast("error", "复制失败")); }

  // ═══ Not admin ═══
  if (isAdmin === false) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center space-y-4">
        <ShieldAlert className="size-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-semibold">{error}</h1>
        <p className="text-sm text-fg-muted/90">此页面仅限管理员访问</p>
        <a href="/hub" className="text-primary text-sm hover:underline">返回首页</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-display font-serif">Mango Code 管理</h1>
          <p className="text-sm text-fg-muted/90 mt-1">管理内测、Pro 权益与兑换码</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="rounded-xl gap-1.5">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />刷新
        </Button>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
          <div className="flex items-center gap-2"><AlertTriangle className="size-4" />{error}</div>
          <button onClick={() => setError("")}><X className="size-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[{ label: "总计", value: stats.total, icon: Ticket, color: "text-fg" },
          { label: "可用", value: stats.active, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "已使用", value: stats.used, icon: () => <span className="text-sm">👤</span>, color: "text-blue-600" },
          { label: "已过期", value: stats.expired, icon: () => <span className="text-sm">⏰</span>, color: "text-gray-500" },
          { label: "已停用", value: stats.disabled, icon: Ban, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="card-card p-3.5 flex items-center gap-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-bg-subtle ${s.color}`}>
              <s.icon className="size-4" />
            </span>
            <div><p className="text-lg font-bold">{loading ? "-" : s.value}</p><p className="text-[10px] text-fg-muted/90">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Generate */}
      <div className="card-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Plus className="size-4 text-primary" /><h2 className="text-sm font-semibold">生成新兑换码</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[{ l: "等级", v: genPlan, set: setGenPlan, opts: [{ v: "pro", t: "Pro" }, { v: "standard", t: "Standard" }, { v: "admin", t: "Admin" }] },
            { l: "时长类型", v: genDurationType, set: setGenDurationType, opts: [{ v: "days", t: "天" }, { v: "month", t: "月" }, { v: "year", t: "年" }, { v: "lifetime", t: "永久" }] },
          ].map(f => (
            <div key={f.l} className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-fg-muted/90">{f.l}</label>
              <select value={f.v} onChange={e => f.set(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium outline-none focus:border-primary/30">
                {f.opts.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          ))}
          {[{ l: "时长值", v: genDuration, set: setGenDuration, disabled: genDurationType === "lifetime" },
            { l: "数量", v: genCount, set: setGenCount },
            { l: "使用次数", v: genMaxUses, set: setGenMaxUses },
          ].map(f => (
            <div key={f.l} className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-fg-muted/90">{f.l}</label>
              <Input value={f.v} onChange={(e: any) => f.set(e.target.value)} type="number" min={1} max={f.l === "数量" ? 100 : 999} disabled={!!(f as any).disabled} className="h-[42px] rounded-xl text-sm" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-fg-muted/90">备注</label>
            <Input value={genNote} onChange={(e: any) => setGenNote(e.target.value)} placeholder="如：内测邀请" className="h-[42px] rounded-xl text-sm" />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md">
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
          生成 {genCount} 个 {LABELS[genPlan]} 码
        </Button>
        {genResult && genResult.length > 0 && (
          <div className="bg-emerald-50/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-700">✅ 已生成 {genResult.length} 个码</p>
              <Button variant="outline" size="sm" onClick={() => copyAll(genResult)} className="rounded-lg text-[11px] gap-1"><Copy className="size-3" />复制全部</Button>
            </div>
            <div className="bg-white/70 rounded-lg p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
              {genResult.map((c, i) => <p key={i} className="select-all">{c}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* List */}
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
                <thead><tr className="border-b border-border text-left">
                  {["Code", "等级", "时长", "状态", "使用", "创建时间", "操作"].map(h => <th key={h} className="py-2.5 pr-3 text-[11px] font-semibold text-fg-muted/90">{h}</th>)}
                </tr></thead>
                <tbody>
                  {codes.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-bg-subtle/50">
                      <td className="py-2.5 pr-3"><span className="font-mono text-xs font-semibold">{c.code}</span></td>
                      <td className="py-2.5 pr-3"><span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${PLAN_COLORS[c.plan_granted] || ""}`}>{LABELS[c.plan_granted] || c.plan_granted}</span></td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">{c.duration_type === "lifetime" || c.duration_value === 0 ? "永久" : `${c.duration_value}天`}</td>
                      <td className="py-2.5 pr-3"><span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${STATUS_COLORS[c.status] || ""}`}>{STATUS_LABELS[c.status] || c.status}</span></td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">{c.used_count}/{c.max_uses}</td>
                      <td className="py-2.5 pr-3 text-xs text-fg-muted/90">{new Date(c.created_at).toLocaleDateString("zh-CN")}</td>
                      <td className="py-2.5"><div className="flex items-center gap-1">
                        <button onClick={() => copyOne(c.code)} className="size-7 rounded-lg hover:bg-bg-muted flex items-center justify-center"><Copy className="size-3 text-fg-muted/90" /></button>
                        {c.status === "active" && <button onClick={() => handleToggleStatus(c.code, c.status)} className="size-7 rounded-lg hover:bg-amber-50 flex items-center justify-center"><Ban className="size-3 text-amber-500" /></button>}
                        {c.status === "disabled" && <button onClick={() => handleToggleStatus(c.code, c.status)} className="size-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="size-3 text-emerald-500" /></button>}
                        <button onClick={() => handleDelete(c.code)} className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="size-3 text-red-400" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-2">
              {codes.map((c: any) => (
                <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold truncate">{c.code}</span>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${STATUS_COLORS[c.status] || ""}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-fg-muted/90">
                    <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${PLAN_COLORS[c.plan_granted] || ""}`}>{LABELS[c.plan_granted]}</span>
                    <span>{c.duration_type === "lifetime" ? "永久" : `${c.duration_value}天`}</span>
                    <span>·</span><span>{c.used_count}/{c.max_uses}次</span>
                    <span>·</span><span>{new Date(c.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-border/30">
                    <button onClick={() => copyOne(c.code)} className="flex-1 rounded-lg bg-bg-subtle py-1.5 text-[10px] font-medium flex items-center justify-center gap-1"><Copy className="size-3" />复制</button>
                    {c.status === "active" && <button onClick={() => handleToggleStatus(c.code, c.status)} className="flex-1 rounded-lg bg-amber-50 py-1.5 text-[10px] font-medium text-amber-600 flex items-center justify-center gap-1"><Ban className="size-3" />停用</button>}
                    {c.status === "disabled" && <button onClick={() => handleToggleStatus(c.code, c.status)} className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-[10px] font-medium text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="size-3" />启用</button>}
                    <button onClick={() => handleDelete(c.code)} className="flex-1 rounded-lg bg-red-50 py-1.5 text-[10px] font-medium text-red-500 flex items-center justify-center gap-1"><Trash2 className="size-3" />删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg animate-fade-up ${toastMsg.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
