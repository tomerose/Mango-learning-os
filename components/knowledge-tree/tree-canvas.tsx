"use client";

import * as React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  NetworkIcon,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/mock-data";

// ─────────────────────────────────────────────────────────────
// Tree Canvas — visual knowledge tree.
// Renders nodes as positioned circles with connecting lines,
// using absolute positioning (no D3 dependency).
// Supports pan, zoom, click-to-select, and filter modes.
// ─────────────────────────────────────────────────────────────

export interface CanvasNode {
  id: string;
  name: string;
  subject: string;
  importance: number; // 1-5 → node size
  mastery: number; // 0-100 → color intensity
  description: string;
  relatedNoteCount: number;
  relatedConceptIds: string[];
  x: number;
  y: number;
}

export interface CanvasEdge {
  source: string;
  target: string;
  type: string;
}

type FilterMode = "all" | "weak" | "mastered";

interface Props {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onImportClick: () => void;
  className?: string;
}

const NODE_BASE_SIZE = 36;
const NODE_SIZE_PER_IMPORTANCE = 12;

function nodeRadius(importance: number): number {
  return NODE_BASE_SIZE + (importance - 1) * NODE_SIZE_PER_IMPORTANCE;
}

export function TreeCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onImportClick,
  className,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [filterMode, setFilterMode] = React.useState<FilterMode>("all");
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [showEdges, setShowEdges] = React.useState(true);

  // Filter nodes
  const filteredNodes = React.useMemo(() => {
    if (filterMode === "all") return nodes;
    if (filterMode === "weak") return nodes.filter((n) => n.mastery < 30);
    if (filterMode === "mastered") return nodes.filter((n) => n.mastery >= 80);
    return nodes;
  }, [nodes, filterMode]);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = React.useMemo(() => {
    if (!showEdges) return [];
    return edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [edges, filteredNodeIds, showEdges]);

  // Compute canvas bounds
  const contentBounds = React.useMemo(() => {
    if (filteredNodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 500 };
    const pad = 80;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of filteredNodes) {
      const r = nodeRadius(n.importance);
      minX = Math.min(minX, n.x - r - pad);
      minY = Math.min(minY, n.y - r - pad);
      maxX = Math.max(maxX, n.x + r + pad);
      maxY = Math.max(maxY, n.y + r + pad);
    }
    return { minX, minY, maxX: Math.max(maxX, 800), maxY: Math.max(maxY, 500) };
  }, [filteredNodes]);

  // Zoom
  function zoomIn() {
    setScale((s) => Math.min(s * 1.2, 3));
  }
  function zoomOut() {
    setScale((s) => Math.max(s / 1.2, 0.3));
  }
  function fitToScreen() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const bw = contentBounds.maxX - contentBounds.minX;
    const bh = contentBounds.maxY - contentBounds.minY;
    if (bw === 0 || bh === 0) return;
    const fitScale = Math.min(cw / bw, ch / bh, 2);
    setScale(Math.max(0.3, fitScale * 0.85));
    setOffset({
      x: (cw - bw * fitScale) / 2 - contentBounds.minX * fitScale,
      y: (ch - bh * fitScale) / 2 - contentBounds.minY * fitScale,
    });
  }

  // Pan via mouse drag
  function handleMouseDown(e: React.MouseEvent) {
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.pannable === "true") {
      setDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleMouseUp() {
    setDragging(false);
  }

  // Wheel zoom
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(3, Math.max(0.3, scale * factor));
    // Zoom towards cursor
    setOffset({
      x: mx - (mx - offset.x) * (newScale / scale),
      y: my - (my - offset.y) * (newScale / scale),
    });
    setScale(newScale);
  }

  // Layout engine: simple force-like grid grouped by subject
  React.useEffect(() => {
    // Auto-fit on first render or node count change
    if (nodes.length > 0 && containerRef.current) {
      const timer = setTimeout(() => fitToScreen(), 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  // Empty state
  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border bg-card min-h-[500px] flex items-center justify-center",
          className
        )}
      >
        <div className="text-center space-y-3">
          <div className="size-16 rounded-2xl bg-muted mx-auto flex items-center justify-center">
            <NetworkIcon className="size-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-muted-foreground text-sm">上传文档以构建你的知识树</p>
          <Button variant="outline" size="sm" onClick={onImportClick}>
            导入文档
          </Button>
        </div>
      </div>
    );
  }

  const weakCount = nodes.filter((n) => n.mastery < 30).length;

  return (
    <div className={cn("flex flex-col rounded-2xl border bg-card overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30">
        {/* Filter toggles */}
        <div className="flex items-center gap-0.5 bg-background rounded-lg border p-0.5">
          {([
            { id: "all", label: "全部" },
            { id: "weak", label: `薄弱 (${weakCount})` },
            { id: "mastered", label: "已掌握" },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterMode(id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs transition-colors",
                filterMode === id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Edge toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setShowEdges((s) => !s)}
          title={showEdges ? "隐藏连线" : "显示连线"}
        >
          {showEdges ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        </Button>

        {/* Zoom controls */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={zoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="size-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={zoomOut}
          disabled={scale <= 0.3}
        >
          <ZoomOut className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={fitToScreen}
          title="适应屏幕"
        >
          <Maximize2 className="size-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing select-none min-h-[400px]"
        data-pannable="true"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ background: "radial-gradient(circle at center, transparent 0%, transparent 100%)" }}
      >
        {/* Grid pattern background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Transformed layer */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Edges (SVG lines) */}
          {showEdges && filteredEdges.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                width: contentBounds.maxX - contentBounds.minX + 200,
                height: contentBounds.maxY - contentBounds.minY + 200,
                left: contentBounds.minX - 100,
                top: contentBounds.minY - 100,
              }}
            >
              {filteredEdges.map((edge, i) => {
                const sNode = nodes.find((n) => n.id === edge.source);
                const tNode = nodes.find((n) => n.id === edge.target);
                if (!sNode || !tNode) return null;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke="var(--border)"
                    strokeWidth={1}
                    strokeDasharray={edge.type === "prerequisite" ? "4,2" : undefined}
                    opacity={0.6}
                  />
                );
              })}
            </svg>
          )}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isWeak = node.mastery < 30;
            const r = nodeRadius(node.importance);
            const subjectMeta = SUBJECT_META[node.subject] ?? {
              color: "var(--chart-1)",
              short: node.subject.slice(0, 4),
            };

            // Color based on mastery
            const fillColor =
              node.mastery >= 80
                ? "var(--success, #22c55e)"
                : node.mastery >= 50
                  ? subjectMeta.color
                  : "var(--destructive, #ef4444)";

            const fillOpacity =
              node.mastery >= 80 ? 0.3 : node.mastery >= 50 ? 0.25 : 0.2;

            return (
              <div
                key={node.id}
                className={cn(
                  "absolute flex flex-col items-center justify-center cursor-pointer transition-transform z-10",
                  isSelected && "z-20"
                )}
                style={{
                  left: node.x - r,
                  top: node.y - r,
                  width: r * 2,
                  height: r * 2,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
              >
                {/* Glow ring for weak areas */}
                {isWeak && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      boxShadow: "0 0 16px 3px rgba(239,68,68,0.5)",
                    }}
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 0 3px ${subjectMeta.color}, 0 0 12px 2px ${subjectMeta.color}40`,
                    }}
                  />
                )}

                {/* Node circle */}
                <div
                  className="absolute inset-0 rounded-full border-2 transition-colors"
                  style={{
                    backgroundColor: fillColor + "40",
                    borderColor: fillColor,
                    opacity: fillOpacity * 4,
                  }}
                />

                {/* Label */}
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <span
                    className="text-xs font-medium leading-tight px-1 text-center line-clamp-2"
                    style={{
                      fontSize: Math.max(10, r * 0.28),
                      color: fillColor,
                    }}
                  >
                    {node.name}
                  </span>
                  {/* Subject badge */}
                  <span
                    className="text-[9px] opacity-60 leading-none mt-0.5"
                    style={{ color: subjectMeta.color }}
                  >
                    {subjectMeta.short}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weak area indicator */}
        {weakCount > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm border text-xs text-red-500">
            <AlertTriangle className="size-3" />
            {weakCount} 薄弱区域
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Layout engine: computes node positions with a simple
// subject-grouped grid layout. No D3 needed.
// ─────────────────────────────────────────────────────────────

export interface LayoutNode {
  id: string;
  name: string;
  subject: string;
  importance: number;
}

export function computeLayout(nodes: LayoutNode[]): Array<{ id: string; x: number; y: number }> {
  if (nodes.length === 0) return [];

  // Group by subject
  const groups = new Map<string, LayoutNode[]>();
  for (const n of nodes) {
    const list = groups.get(n.subject) ?? [];
    list.push(n);
    groups.set(n.subject, list);
  }

  // Sort groups by size
  const entries = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  const groupCount = entries.length;

  // Calculate layout dimensions
  const maxNodesInGroup = Math.max(...entries.map(([, ns]) => ns.length));
  const cols = Math.ceil(Math.sqrt(maxNodesInGroup));
  const cellW = 180;
  const cellH = 140;
  const groupPadding = 80;

  // Arrange groups in columns of 2-3
  const groupCols = Math.min(groupCount, 3);
  const groupWidth = cols * cellW + groupPadding;
  const groupHeight = Math.ceil(maxNodesInGroup / cols) * cellH + 120;

  const positions: Array<{ id: string; x: number; y: number }> = [];

  entries.forEach(([, subjectNodes], gi) => {
    const gCol = gi % groupCols;
    const gRow = Math.floor(gi / groupCols);
    const gx = gCol * groupWidth + groupPadding / 2;
    const gy = gRow * groupHeight + 40;

    // Sort nodes by importance (highest first, center-biased)
    const sorted = [...subjectNodes].sort((a, b) => b.importance - a.importance);

    sorted.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gx + col * cellW + cellW / 2;
      const y = gy + row * cellH + cellH / 2;

      // Add slight jitter for visual interest
      const jitterX = (Math.sin(i * 2.7) * 15);
      const jitterY = (Math.cos(i * 3.1) * 15);

      positions.push({ id: node.id, x: x + jitterX, y: y + jitterY });
    });
  });

  return positions;
}
