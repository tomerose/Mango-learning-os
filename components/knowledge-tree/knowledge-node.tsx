"use client";

import * as React from "react";
import { X, BookOpen, Zap, Link2, Sparkles, FileText } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/mock-data";

// ─────────────────────────────────────────────────────────────
// Knowledge Tree — node detail panel.
// Shown in the right sidebar when a node is clicked on the canvas.
// Displays concept info, mastery score, and action buttons.
// ─────────────────────────────────────────────────────────────

export interface KnowledgeNodeData {
  id: string;
  name: string;
  subject: string;
  description: string;
  importance: number; // 1-5
  mastery: number; // 0-100
  relatedNoteCount: number;
  relatedConcepts: Array<{ name: string; type: string }>;
  content?: string;
}

interface Props {
  node: KnowledgeNodeData | null;
  onClose: () => void;
  onGenerateFlashcards?: (node: KnowledgeNodeData) => void;
  onGenerateSummary?: (node: KnowledgeNodeData) => void;
  onSelectConcept?: (name: string) => void;
}

export function KnowledgeNode({
  node,
  onClose,
  onGenerateFlashcards,
  onGenerateSummary,
  onSelectConcept,
}: Props) {
  if (!node) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center">
          <div className="text-center space-y-2">
            <BookOpen className="size-8 text-muted-foreground mx-auto opacity-40" />
            <p className="text-muted-foreground text-sm">点击知识节点查看详情</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subjectMeta = SUBJECT_META[node.subject] ?? {
    id: node.subject,
    label: node.subject,
    short: node.subject.slice(0, 4),
    color: "var(--chart-1)",
  };

  const masteryColor =
    node.mastery >= 80
      ? "text-green-500"
      : node.mastery >= 50
        ? "text-yellow-500"
        : "text-red-500";

  const masteryLabel =
    node.mastery >= 80 ? "已掌握" : node.mastery >= 50 ? "学习中" : "薄弱";

  const importanceDots = Array.from({ length: 5 }, (_, i) => i < node.importance);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs shrink-0"
              style={{ borderColor: subjectMeta.color, color: subjectMeta.color }}
            >
              {subjectMeta.short}
            </Badge>
            <div className="flex items-center gap-0.5">
              {importanceDots.map((filled, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full",
                    filled ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
          <h3 className="font-semibold text-base leading-tight">{node.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 -mr-1 -mt-1"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {node.description || "暂无描述"}
        </p>

        {/* Mastery progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">掌握度</span>
            <span className={cn("font-medium", masteryColor)}>
              {node.mastery}% · {masteryLabel}
            </span>
          </div>
          <Progress value={node.mastery} className="h-1.5" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {node.relatedNoteCount} 篇笔记
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="size-3" />
            {node.relatedConcepts.length} 个关联
          </span>
        </div>

        {/* Related concepts */}
        {node.relatedConcepts.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">关联概念</span>
            <div className="flex flex-wrap gap-1">
              {node.relatedConcepts.map((rc) => (
                <button
                  key={rc.name}
                  onClick={() => onSelectConcept?.(rc.name)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  {rc.name}
                  <span className="text-muted-foreground text-[10px]">({rc.type})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => onGenerateFlashcards?.(node)}
          >
            <Zap className="size-3.5" />
            生成闪卡
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => onGenerateSummary?.(node)}
          >
            <Sparkles className="size-3.5" />
            生成摘要
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
