"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Dot,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// KnowledgeMapView — interactive topic hierarchy displayed as
// an expandable nested tree. Supports drill-down, color coding
// by importance, and zoom controls for dense maps.
// ─────────────────────────────────────────────────────────────

interface KnowledgeNode {
  id: string;
  label: string;
  importance: "high" | "medium" | "low";
  children?: KnowledgeNode[];
}

interface KnowledgeMapViewProps {
  data: KnowledgeNode[];
  onNodeClick?: (node: KnowledgeNode) => void;
}

function NodeRow({
  node,
  depth,
  expandedIds,
  onToggle,
  onClick,
}: {
  node: KnowledgeNode;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onClick?: (node: KnowledgeNode) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const expanded = expandedIds.has(node.id);

  const importanceStyles = {
    high: "text-red-500 border-l-red-500 bg-red-500/5",
    medium: "text-yellow-500 border-l-yellow-500 bg-yellow-500/5",
    low: "text-green-500 border-l-green-500 bg-green-500/5",
  };

  const dotStyles = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };

  return (
    <React.Fragment>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md border-l-2 transition-colors hover:bg-accent/50 cursor-pointer",
          importanceStyles[node.importance]
        )}
        style={{ marginLeft: depth * 20 }}
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          onClick?.(node);
        }}
        role="treeitem"
        aria-expanded={expanded}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <Dot className={cn("size-4 shrink-0", dotStyles[node.importance])} />
        )}
        <span className="text-sm font-medium flex-1 truncate">
          {node.label}
        </span>
        <Badge
          variant={
            node.importance === "high"
              ? "destructive"
              : node.importance === "medium"
                ? "warning"
                : "success"
          }
          className="text-[10px] px-1.5 py-0 h-4"
        >
          {node.importance}
        </Badge>
      </div>
      {hasChildren && expanded && (
        <div role="group">
          {node.children!.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

export function KnowledgeMapView({
  data,
  onNodeClick,
}: KnowledgeMapViewProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    // Auto-expand depth 0 nodes
    return new Set(data.map((n) => n.id));
  });
  const [scale, setScale] = React.useState(1);

  const toggleNode = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: KnowledgeNode[]) => {
      for (const n of nodes) {
        allIds.add(n.id);
        if (n.children) collect(n.children);
      }
    };
    collect(data);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set(data.map((n) => n.id)));
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 1.5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.6));
  const resetZoom = () => setScale(1);

  const totalNodes = React.useMemo(() => {
    let count = 0;
    const walk = (nodes: KnowledgeNode[]) => {
      count += nodes.length;
      for (const n of nodes) {
        if (n.children) walk(n.children);
      }
    };
    walk(data);
    return count;
  }, [data]);

  const highCount = data.filter((n) => n.importance === "high").length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Knowledge Map</CardTitle>
              <CardDescription>
                {totalNodes} topics · {highCount} high-priority · Click to
                explore
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={expandAll}
                title="Expand all"
              >
                <ChevronDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={collapseAll}
                title="Collapse to roots"
              >
                <ChevronRight className="size-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={zoomOut}
                disabled={scale <= 0.6}
                title="Zoom out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={resetZoom}
                title="Reset zoom"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={zoomIn}
                disabled={scale >= 1.5}
                title="Zoom in"
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Circle className="size-3 fill-red-500 text-red-500" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className="size-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className="size-3 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>

          {/* Tree */}
          <div
            className="rounded-lg border bg-muted/20 p-4 overflow-auto"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: "transform 150ms ease",
            }}
            role="tree"
          >
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No knowledge map data yet. Generate an exam package to see your
                topic hierarchy.
              </p>
            ) : (
              data.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expandedIds={expandedIds}
                  onToggle={toggleNode}
                  onClick={onNodeClick}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { KnowledgeNode };
