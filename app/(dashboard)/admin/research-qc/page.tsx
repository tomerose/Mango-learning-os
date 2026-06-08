"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Loader2, ShieldAlert, TrendingUp, Search, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminResearchQCPage() {
  const router = useRouter();
  const [runs, setRuns] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ total: 0, completed: 0, needs_review: 0, failed: 0, avgScore: 0, avgSources: 0 });
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const c = createClient();
    c.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      if (data.session.user.email !== "1211000567@qq.com") { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      const { data: all } = await c.from("agent_runs").select("*").order("created_at", { ascending: false }).limit(200);
      const list = all || [];
      setRuns(list);
      setStats({
        total: list.length,
        completed: list.filter((r: any) => r.status === "completed").length,
        needs_review: list.filter((r: any) => r.status === "needs_review").length,
        failed: list.filter((r: any) => r.status === "failed").length,
        avgScore: list.length > 0 ? Math.round(list.reduce((s: number, r: any) => s + (r.quality_score || 0), 0) / list.length) : 0,
        avgSources: list.length > 0 ? Math.round(list.reduce((s: number, r: any) => s + (r.source_count || 0), 0) / list.length) : 0,
      });
      setLoading(false);
    }).catch(() => router.push("/hub"));
  }, []);

  if (!isAdmin) return <div className="max-w-lg mx-auto pt-20 text-center space-y-4"><ShieldAlert className="size-12 text-red-400 mx-auto" /><h1 className="text-xl font-semibold">无管理员权限</h1><a href="/hub" className="text-primary text-sm hover:underline">返回首页</a></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <header className="flex items-center justify-between">
        <div><h1 className="text-display font-serif">Research QC</h1><p className="text-sm text-fg-muted/90 mt-1">Agent 运行质量监控</p></div>
      </header>
      {loading ? <div className="text-center py-12"><Loader2 className="size-6 animate-spin mx-auto text-fg-muted/90" /></div> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[{ l: "总运行数", v: stats.total, c: "text-fg" }, { l: "已完成", v: stats.completed, c: "text-emerald-600" }, { l: "需审查", v: stats.needs_review, c: "text-amber-600" }, { l: "失败", v: stats.failed, c: "text-red-500" }, { l: "平均分", v: stats.avgScore, c: "text-blue-600" }, { l: "平均来源", v: stats.avgSources, c: "text-primary" }].map(s => (
              <div key={s.l} className="card-card p-3.5"><p className={`text-lg font-bold ${s.c}`}>{loading ? "-" : s.v}</p><p className="text-[10px] text-fg-muted/90">{s.l}</p></div>
            ))}
          </div>
          <div className="card-card p-5">
            <h2 className="text-sm font-semibold mb-3">最近运行</h2>
            {runs.length === 0 ? <p className="text-sm text-fg-muted/90 text-center py-8">暂无运行记录</p> :
             <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left">{["Prompt","层级","状态","分数","来源","时间"].map(h=><th key={h} className="py-2 pr-3 text-[11px] font-semibold text-fg-muted/90">{h}</th>)}</tr></thead><tbody>{runs.slice(0, 50).map((r:any)=><tr key={r.id} className="border-b border-border/50"><td className="py-2 pr-3 text-xs truncate max-w-[200px]">{r.prompt?.slice(0,60)||"-"}</td><td className="py-2 pr-3 text-xs">{r.tier}</td><td className="py-2 pr-3"><span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${r.status==="completed"?"bg-emerald-100 text-emerald-700":r.status==="needs_review"?"bg-amber-100 text-amber-700":"bg-red-100 text-red-600"}`}>{r.status}</span></td><td className="py-2 pr-3 text-xs">{r.quality_score}</td><td className="py-2 pr-3 text-xs">{r.source_count||0}</td><td className="py-2 text-xs text-fg-muted/90">{new Date(r.created_at).toLocaleDateString("zh-CN")}</td></tr>)}</tbody></table></div>}
          </div>
        </>
      )}
    </div>
  );
}
