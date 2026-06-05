"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Plus, Pencil, X, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// AI extraction results panel.
// Shows concepts + relationships extracted from a document.
// Allows selecting, editing, and adding to the knowledge tree.
// ─────────────────────────────────────────────────────────────

export interface ExtractedConcept {
  name: string;
  description: string;
  importance: number; // 1-5
  selected: boolean;
  editing?: boolean;
}

export interface ExtractedRelationship {
  source: string;
  target: string;
  type: string;
  selected: boolean;
}

export interface ExtractionResults {
  concepts: ExtractedConcept[];
  relationships: ExtractedRelationship[];
}

interface Props {
  results: ExtractionResults | null;
  loading: boolean;
  error: string | null;
  onToggleConcept: (index: number) => void;
  onToggleRelationship: (index: number) => void;
  onEditConceptName: (index: number, name: string) => void;
  onAddAll: () => void;
  onAddSelected: () => void;
  onClose: () => void;
}

export function AIExtractionPanel({
  results,
  loading,
  error,
  onToggleConcept,
  onToggleRelationship,
  onEditConceptName,
  onAddAll,
  onAddSelected,
  onClose,
}: Props) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="size-10 text-primary animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">AI 正在提取知识...</p>
            <p className="text-xs text-muted-foreground">分析文档内容，识别核心概念和关系</p>
          </div>
          <Progress value={60} className="w-48 h-1.5" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <AlertCircle className="size-8 text-destructive opacity-60" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={onClose}>
            关闭
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  const selectedConcepts = results.concepts.filter((c) => c.selected).length;
  const totalConcepts = results.concepts.length;
  const selectedRelationships = results.relationships.filter((r) => r.selected).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4 text-green-500" />
          AI 提取结果
        </CardTitle>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Concepts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              概念 ({selectedConcepts}/{totalConcepts})
            </span>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => {
                const allSelected = results.concepts.every((c) => c.selected);
                results.concepts.forEach((_, i) => {
                  if (allSelected) {
                    // Deselect all
                    if (results.concepts[i].selected) onToggleConcept(i);
                  } else {
                    // Select all
                    if (!results.concepts[i].selected) onToggleConcept(i);
                  }
                });
              }}
            >
              {results.concepts.every((c) => c.selected) ? "取消全选" : "全选"}
            </button>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {results.concepts.map((concept, i) => (
              <div
                key={`${concept.name}-${i}`}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2.5 transition-colors cursor-pointer",
                  concept.selected ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"
                )}
                onClick={() => onToggleConcept(i)}
              >
                <div
                  className={cn(
                    "size-4 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center",
                    concept.selected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {concept.selected && (
                    <CheckCircle2 className="size-3 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {concept.editing ? (
                      <Input
                        className="h-6 text-xs w-full"
                        value={concept.name}
                        onChange={(e) => onEditConceptName(i, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => onEditConceptName(i, concept.name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onEditConceptName(i, concept.name);
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium truncate">{concept.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {importanceLabel(concept.importance)}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {concept.description}
                  </p>
                </div>
                <button
                  className="shrink-0 text-muted-foreground hover:text-foreground p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle edit mode for this concept
                    const updated = [...results.concepts];
                    updated[i] = { ...updated[i], editing: !updated[i].editing };
                    onEditConceptName(i, updated[i].name);
                  }}
                  title="编辑名称"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Relationships */}
        {results.relationships.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                关系 ({selectedRelationships}/{results.relationships.length})
              </span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              {results.relationships.map((rel, i) => (
                <div
                  key={`${rel.source}-${rel.target}-${i}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-colors",
                    rel.selected ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => onToggleRelationship(i)}
                >
                  <div
                    className={cn(
                      "size-3.5 rounded border shrink-0 flex items-center justify-center",
                      rel.selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}
                  >
                    {rel.selected && (
                      <CheckCircle2 className="size-2.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-medium truncate">{rel.source}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                    {rel.type}
                  </Badge>
                  <span className="text-xs font-medium truncate">{rel.target}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" className="gap-1.5 flex-1" onClick={onAddAll}>
            <Plus className="size-3.5" />
            全部添加
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 flex-1"
            onClick={onAddSelected}
            disabled={selectedConcepts === 0}
          >
            <Plus className="size-3.5" />
            添加已选 ({selectedConcepts})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function importanceLabel(v: number): string {
  if (v >= 5) return "核心";
  if (v >= 4) return "重要";
  if (v >= 3) return "一般";
  if (v >= 2) return "辅助";
  return "边缘";
}
