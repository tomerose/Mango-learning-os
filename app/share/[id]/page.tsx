"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, FileText, Download, ExternalLink, Clock, Target, Sparkles, Globe } from "lucide-react";
import { getPackById, type StudyPackSession } from "@/lib/study-pack-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = React.useState<StudyPackSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getPackById(id).then(p => { setPack(p); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-fg-muted">加载中…</p>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-16 rounded-2xl bg-bg-muted flex items-center justify-center">
            <FileText className="size-8 text-fg-muted/30" />
          </div>
          <h1 className="text-title font-serif">学习包不存在</h1>
          <p className="text-sm text-fg-muted">该链接可能已过期或已被删除。</p>
          <Link href="/"><Button variant="outline" className="rounded-xl">返回 MangoOS</Button></Link>
        </div>
      </div>
    );
  }

  const sectionCount = Object.keys(pack.generatedHandout?.sections ?? {}).length;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary-subtle flex items-center justify-center">
              <GraduationCap className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-fg-muted uppercase tracking-wider">MangoOS · 学习包分享</p>
              <h1 className="text-display font-serif">{pack.courseName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
            {pack.school && <span className="flex items-center gap-1"><Target className="size-3" /> {pack.school}</span>}
            <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(pack.createdAt).toLocaleDateString("zh-CN")}</span>
            <span className="flex items-center gap-1"><FileText className="size-3" /> {sectionCount} 个章节</span>
            <Badge className="text-[9px] bg-primary-subtle text-primary">{pack.qualityScore}分</Badge>
          </div>
        </motion.div>

        {/* Content preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-card p-6 overflow-hidden">
          <div className="prose prose-sm max-w-none">
            <h2 className="font-serif">课程概述</h2>
            <p className="text-sm text-fg-muted leading-relaxed">
              这是一个由 Mango AI 生成的完整期末复习讲义，包含 {sectionCount} 个章节——覆盖考纲分析、知识图谱、公式速查、模拟试卷等。
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.keys(pack.generatedHandout?.sections ?? {}).slice(0, 8).map(key => (
                <Badge key={key} variant="secondary" className="text-[10px]">{key}</Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sources */}
        {pack.sources && pack.sources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card-card p-5 flex flex-col gap-3">
            <h3 className="text-sm font-medium font-serif flex items-center gap-2">
              <Globe className="size-4 text-primary" /> 研究来源 ({pack.sources.length})
            </h3>
            <div className="flex flex-col gap-1.5">
              {pack.sources.slice(0, 5).map(s => (
                <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-fg-muted hover:text-primary transition-colors">
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-fg-muted">由 Mango AI 生成</p>
          <div className="flex gap-2">
            <Link href="/login">
              <Button className="gap-2 rounded-xl">
                <Sparkles className="size-4" /> 创建你的学习包
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
