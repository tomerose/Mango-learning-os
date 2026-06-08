"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReviewPage() {
  const router = useRouter();
  const [docs, setDocs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const c = createClient();
    c.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      if (data.session.user.email !== "1211000567@qq.com") { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      loadDocs(c);
    }).catch(() => router.push("/hub"));
  }, []);

  async function loadDocs(c?: any) {
    setLoading(true);
    const client = c || createClient();
    const { data: all } = await client.from("outcome_documents").select("*").order("created_at", { ascending: false }).limit(100);
    setDocs((all || []).filter((d: any) => d.status === "needs_review" || d.status === "failed"));
    setLoading(false);
  }

  async function markReviewed(id: string) {
    const c = createClient();
    await c.from("outcome_documents").update({ status: "completed" }).eq("id", id);
    loadDocs(c);
  }

  if (!isAdmin) return <div className="max-w-lg mx-auto pt-20 text-center space-y-4"><ShieldAlert className="size-12 text-red-400 mx-auto" /><h1 className="text-xl font-semibold">无管理员权限</h1><a href="/hub" className="text-primary text-sm hover:underline">返回首页</a></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <header className="flex items-center justify-between">
        <div><h1 className="text-display font-serif">Agent Review</h1><p className="text-sm text-fg-muted/90 mt-1">审查需关注的 Agent 输出</p></div>
        <Button variant="outline" size="sm" onClick={() => loadDocs()} disabled={loading} className="rounded-xl gap-1.5"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />刷新</Button>
      </header>

      {loading ? <div className="text-center py-12"><Loader2 className="size-6 animate-spin mx-auto text-fg-muted/90" /></div> :
       docs.length === 0 ? <div className="card-card p-8 text-center"><CheckCircle2 className="size-10 text-emerald-400 mx-auto mb-3" /><p className="text-sm font-medium">没有待审查文档</p><p className="text-xs text-fg-muted/90 mt-1">所有输出均通过质量检查</p></div> :
       <div className="space-y-2">
        {docs.map((d: any) => (
          <div key={d.id} className="card-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{d.title || "未命名"}</p>
                <p className="text-xs text-fg-muted/90 mt-0.5">{d.tier} · {d.quality_score}分 · {new Date(d.created_at).toLocaleDateString("zh-CN")}</p>
              </div>
              <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${d.status === "needs_review" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                {d.status === "needs_review" ? "需审查" : "失败"}
              </span>
            </div>
            {d.summary && <p className="text-xs text-fg-muted/90 line-clamp-2">{d.summary}</p>}
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => markReviewed(d.id)} className="rounded-lg text-[11px] gap-1"><CheckCircle2 className="size-3" />标记已审查</Button>
              <Button size="sm" variant="outline" onClick={() => window.open(`/library?open=${d.id}`, "_blank")} className="rounded-lg text-[11px] gap-1"><ExternalLink className="size-3" />查看</Button>
            </div>
          </div>
        ))}
       </div>}
    </div>
  );
}
