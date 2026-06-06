"use client";

import * as React from "react";
import { Shield, Trash2, AlertTriangle, Check, Loader2, Eye, EyeOff, Database } from "lucide-react";
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
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();

      if (data.success && data.clearedKeys) {
        data.clearedKeys.forEach((key: string) => {
          try { localStorage.removeItem(key); } catch {}
        });
        setDeleted(true);
      } else {
        setError(data.error ?? "删除失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Storage preference */}
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
              {storagePref === "local"
                ? "数据保存在当前浏览器，换设备无法同步"
                : "数据保存在 Supabase 云端，任何设备登录后自动同步"}
            </p>
          </div>
          <button
            onClick={() => {
              const next = storagePref === "local" ? "cloud" : "local";
              setStoragePref(next);
              localStorage.setItem("mango-storage-pref", next);
            }}
            className="text-[12px] text-primary font-medium hover:underline shrink-0"
          >
            切换到{storagePref === "local" ? "云端" : "本地"}
          </button>
        </div>
      </div>

      {/* Privacy policy */}
      <div className="card-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-fg-muted" />
          <h2 className="text-[15px] font-semibold">隐私与安全</h2>
        </div>
        <div className="space-y-3 text-[13px] text-fg-muted/70 leading-relaxed">
          <p>你的数据属于你。Mango Learning OS 遵循以下隐私原则：</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>学习内容仅你可见，不会用于训练模型</li>
            <li>心灵花园内容使用端到端加密存储</li>
            <li>游客模式数据仅存于本地浏览器</li>
            <li>可随时导出或删除你的全部数据</li>
          </ul>
        </div>
      </div>

      {/* Delete data */}
      <div className="card-card p-5 sm:p-6 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="size-4 text-red-500" />
          <h2 className="text-[15px] font-semibold text-red-600">清除学习数据</h2>
        </div>

        {deleted ? (
          <div className="flex items-start gap-2 px-3 py-3 rounded-lg bg-green-50 text-green-700 text-[13px]">
            <Check className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">数据已清除</p>
              <p className="text-[11px] mt-0.5 opacity-70">你的学习数据已从浏览器和云端清除。账号仍然保留。</p>
            </div>
          </div>
        ) : !showDelete ? (
          <div>
            <p className="text-[13px] text-fg-muted/70 mb-3">
              清除所有学习数据（学习包、Agent 任务、笔记、错题、闪卡等）。此操作不可撤销。
            </p>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
            >
              删除我的数据
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-[12px]">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">确认删除</p>
                <p className="mt-0.5 opacity-80">此操作将清除所有学习数据且不可恢复。账号本身不会被删除。</p>
              </div>
            </div>

            <div>
              <p className="text-[12px] text-fg-muted/60 mb-1.5">
                输入 <span className="font-mono font-medium text-fg">删除我的数据</span> 以确认：
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="删除我的数据"
                className="w-full h-10 rounded-lg border border-border px-3 text-[13px] bg-bg-subtle focus:outline-none focus:border-red-300 transition-colors"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={confirmText !== "删除我的数据" || deleting}
                className="h-10 px-4 rounded-lg text-[13px] bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : "确认删除"}
              </Button>
              <button
                onClick={() => { setShowDelete(false); setConfirmText(""); setError(null); }}
                className="h-10 px-4 rounded-lg text-[13px] text-fg-muted hover:text-fg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="card-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold mb-3">关于</h2>
        <div className="space-y-2 text-[13px] text-fg-muted/70">
          <p>第三自习室出品 · 和你一起成长的学习伴侣。</p>
          <p className="text-[11px]">学习路上不孤单，我们一同前行。</p>
          <p className="text-[11px] pt-2 border-t border-border">
            Version: 内测版 (V12) · Updated: 2026-06-07
          </p>
        </div>
      </div>
    </div>
  );
}
