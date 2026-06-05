"use client";

import * as React from "react";
import { Search, ChevronRight, ChevronDown, Hash, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/mock-data";
import { useSubjects } from "@/lib/subjects";

// ─────────────────────────────────────────────────────────────
// Topic Explorer — left sidebar with searchable, filterable
// tree of all knowledge nodes. Click selects a node on the canvas.
// ─────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string;
  name: string;
  subject: string;
  mastery: number; // 0-100
  children?: TreeNode[];
}

interface Props {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  filterSubject: string | null;
  onFilterSubject: (subject: string | null) => void;
  className?: string;
}

export function TopicExplorer({
  nodes,
  selectedNodeId,
  onSelectNode,
  filterSubject,
  onFilterSubject,
  className,
}: Props) {
  const { subjects } = useSubjects();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedSubjects, setExpandedSubjects] = React.useState<Set<string>>(new Set());

  // Auto-expand subjects when filter changes
  React.useEffect(() => {
    if (filterSubject) {
      setExpandedSubjects((prev) => new Set([...prev, filterSubject]));
    }
  }, [filterSubject]);

  // Group nodes by subject
  const grouped = React.useMemo(() => {
    const map = new Map<string, TreeNode[]>();
    for (const node of nodes) {
      const list = map.get(node.subject) ?? [];
      list.push(node);
      map.set(node.subject, list);
    }

    // Filter by subject
    let entries = [...map.entries()];
    if (filterSubject) {
      entries = entries.filter(([subj]) => subj === filterSubject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries
        .map(([subj, ns]): [string, TreeNode[]] => [
          subj,
          ns.filter((n) => n.name.toLowerCase().includes(q)),
        ])
        .filter(([, ns]) => ns.length > 0);
    }

    return entries;
  }, [nodes, filterSubject, searchQuery]);

  function toggleExpand(subject: string) {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  }

  const totalConcepts = nodes.length;
  const weakCount = nodes.filter((n) => n.mastery < 30).length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索概念..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Subject filter chips */}
      <div className="px-3 py-2 border-b">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onFilterSubject(null)}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs border transition-colors",
              !filterSubject
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-border"
            )}
          >
            全部 ({totalConcepts})
          </button>
          {subjects.map((s) => {
            const count = nodes.filter((n) => n.subject === s.id).length;
            if (count === 0) return null;
            return (
              <button
                key={s.id}
                onClick={() => onFilterSubject(s.id)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs border transition-colors flex items-center gap-1",
                  filterSubject === s.id
                    ? "border-current"
                    : "hover:bg-muted border-border"
                )}
                style={
                  filterSubject === s.id
                    ? { backgroundColor: s.color + "20", color: s.color, borderColor: s.color }
                    : undefined
                }
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.short} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2 border-b flex items-center gap-3 text-xs text-muted-foreground">
        <span>{totalConcepts} 个概念</span>
        {weakCount > 0 && (
          <span className="text-red-500">⚠ {weakCount} 薄弱</span>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Hash className="size-6 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">
              {nodes.length === 0
                ? "导入文档以构建知识树"
                : searchQuery
                  ? "无匹配概念"
                  : "请选择学科筛选"}
            </p>
          </div>
        ) : (
          grouped.map(([subject, subjectNodes]) => {
            const meta = SUBJECT_META[subject] ?? {
              id: subject,
              label: subject,
              short: subject.slice(0, 4),
              color: "var(--chart-1)",
            };
            const isExpanded = expandedSubjects.has(subject);
            const masteredCount = subjectNodes.filter((n) => n.mastery >= 80).length;

            return (
              <div key={subject} className="mb-1">
                {/* Subject header */}
                <button
                  onClick={() => toggleExpand(subject)}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-medium truncate flex-1">{meta.label}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {masteredCount}/{subjectNodes.length}
                  </span>
                </button>

                {/* Nodes */}
                {isExpanded && (
                  <div className="ml-6 space-y-0.5">
                    {subjectNodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isWeak = node.mastery < 30;

                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelectNode(node.id)}
                          className={cn(
                            "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full shrink-0",
                              isWeak ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"
                            )}
                          />
                          <span className="text-xs truncate flex-1">{node.name}</span>
                          <span
                            className={cn(
                              "text-[10px] shrink-0",
                              node.mastery >= 80
                                ? "text-green-500"
                                : node.mastery >= 50
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            )}
                          >
                            {node.mastery}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
