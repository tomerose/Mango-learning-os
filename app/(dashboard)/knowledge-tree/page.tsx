"use client";

import * as React from "react";
import {
  Upload,
  Brain,
  LayoutDashboard,
  FileText,
  Plus,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { SUBJECT_META } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

import {
  TreeCanvas,
  computeLayout,
  type CanvasNode,
  type CanvasEdge,
  type LayoutNode,
} from "@/components/knowledge-tree/tree-canvas";
import {
  KnowledgeNode,
  type KnowledgeNodeData,
} from "@/components/knowledge-tree/knowledge-node";
import {
  DocumentImporter,
  type ExtractedDocument,
} from "@/components/knowledge-tree/document-importer";
import {
  AIExtractionPanel,
  type ExtractedConcept,
  type ExtractedRelationship,
  type ExtractionResults,
} from "@/components/knowledge-tree/ai-extraction-panel";
import { FlashcardGenerator } from "@/components/knowledge-tree/flashcard-generator";
import { SummaryGenerator } from "@/components/knowledge-tree/summary-generator";
import {
  TopicExplorer,
  type TreeNode,
} from "@/components/knowledge-tree/topic-explorer";

// ─────────────────────────────────────────────────────────────
// Knowledge Tree — full page.
// Orchestrates document import, AI extraction, tree visualization,
// and knowledge node detail panels.
// ─────────────────────────────────────────────────────────────

// Default mock nodes for demonstration
const MOCK_LAYOUT_NODES: LayoutNode[] = [
  { id: "k1", name: "注意力机制", subject: "ai", importance: 5 },
  { id: "k2", name: "自注意力", subject: "ai", importance: 5 },
  { id: "k3", name: "多头注意力", subject: "ai", importance: 4 },
  { id: "k4", name: "位置编码", subject: "ai", importance: 3 },
  { id: "k5", name: "消费者剩余", subject: "economics", importance: 4 },
  { id: "k6", name: "生产者剩余", subject: "economics", importance: 4 },
  { id: "k7", name: "市场均衡", subject: "economics", importance: 5 },
  { id: "k8", name: "价格弹性", subject: "economics", importance: 3 },
  { id: "k9", name: "DCF 估值", subject: "finance", importance: 5 },
  { id: "k10", name: "WACC", subject: "finance", importance: 4 },
  { id: "k11", name: "CAPM 模型", subject: "finance", importance: 4 },
  { id: "k12", name: "特征值", subject: "math", importance: 5 },
  { id: "k13", name: "特征向量", subject: "math", importance: 5 },
  { id: "k14", name: "矩阵对角化", subject: "math", importance: 3 },
  { id: "k15", name: "可持续发展", subject: "english", importance: 3 },
  { id: "k16", name: "学术写作结构", subject: "english", importance: 4 },
];

const MOCK_EDGES: CanvasEdge[] = [
  { source: "k1", target: "k2", type: "contains" },
  { source: "k2", target: "k3", type: "contains" },
  { source: "k2", target: "k4", type: "related" },
  { source: "k5", target: "k6", type: "related" },
  { source: "k5", target: "k7", type: "related" },
  { source: "k6", target: "k7", type: "related" },
  { source: "k7", target: "k8", type: "related" },
  { source: "k9", target: "k10", type: "contains" },
  { source: "k9", target: "k11", type: "related" },
  { source: "k10", target: "k11", type: "related" },
  { source: "k12", target: "k13", type: "prerequisite" },
  { source: "k13", target: "k14", type: "prerequisite" },
  { source: "k15", target: "k16", type: "related" },
];

interface NodeMeta {
  description: string;
  content: string;
  importance: number;
  mastery: number;
  relatedNoteCount: number;
  relatedConcepts: Array<{ name: string; type: string }>;
}

const MOCK_NODE_META: Record<string, NodeMeta> = {
  k1: { description: "神经网络中让模型关注输入相关部分的机制", content: "注意力机制的核心是 Query/Key/Value 的计算。Query 去和所有 Key 算相似度，softmax 归一化后对 Value 加权求和。", importance: 5, mastery: 75, relatedNoteCount: 3, relatedConcepts: [{ name: "自注意力", type: "包含" }, { name: "Transformer", type: "属于" }] },
  k2: { description: "序列中每个位置与所有位置计算注意力权重", content: "自注意力允许序列中每个元素直接与其他所有元素交互，捕获全局依赖关系。", importance: 5, mastery: 60, relatedNoteCount: 2, relatedConcepts: [{ name: "注意力机制", type: "基础" }, { name: "多头注意力", type: "扩展" }] },
  k3: { description: "并行运行多个注意力头，增强表达能力", content: "多头注意力将 Q/K/V 投影到多个子空间，每个头关注不同方面，最后拼接输出。", importance: 4, mastery: 45, relatedNoteCount: 1, relatedConcepts: [{ name: "自注意力", type: "基础" }] },
  k4: { description: "为 Transformer 注入序列位置信息", content: "正弦/余弦位置编码给每个位置唯一的向量表示，使模型能感知顺序。", importance: 3, mastery: 40, relatedNoteCount: 1, relatedConcepts: [{ name: "自注意力", type: "补充" }] },
  k5: { description: "需求曲线下方、价格上方的面积", content: "消费者剩余 = 消费者愿意支付的价格 - 实际支付的价格。衡量消费者从交易中获得的额外收益。", importance: 4, mastery: 70, relatedNoteCount: 2, relatedConcepts: [{ name: "生产者剩余", type: "对称" }, { name: "市场均衡", type: "相关" }] },
  k6: { description: "价格下方、供给曲线上方的面积", content: "生产者剩余 = 实际售价 - 生产者最低接受价格。衡量生产者从交易中获得的额外收益。", importance: 4, mastery: 65, relatedNoteCount: 1, relatedConcepts: [{ name: "消费者剩余", type: "对称" }] },
  k7: { description: "供给与需求相等时的价格和数量", content: "市场均衡时，消费者和生产者剩余之和（总剩余）最大化。", importance: 5, mastery: 80, relatedNoteCount: 3, relatedConcepts: [{ name: "消费者剩余", type: "相关" }, { name: "生产者剩余", type: "相关" }] },
  k8: { description: "需求量对价格变化的敏感度", content: "价格弹性 = %ΔQ / %ΔP。|E|>1 富有弹性，<1 缺乏弹性。", importance: 3, mastery: 55, relatedNoteCount: 1, relatedConcepts: [{ name: "市场均衡", type: "应用" }] },
  k9: { description: "企业价值 = 未来自由现金流折现之和", content: "DCF 估值涉及自由现金流预测、WACC 折现率、永续增长率和终值计算。", importance: 5, mastery: 50, relatedNoteCount: 2, relatedConcepts: [{ name: "WACC", type: "依赖" }, { name: "CAPM 模型", type: "相关" }] },
  k10: { description: "加权平均资本成本，DCF 的折现率", content: "WACC = (E/V)*Re + (D/V)*Rd*(1-T)。反映企业整体融资成本。", importance: 4, mastery: 35, relatedNoteCount: 1, relatedConcepts: [{ name: "DCF 估值", type: "被依赖" }, { name: "CAPM 模型", type: "相关" }] },
  k11: { description: "资本资产定价模型：E(Ri) = Rf + β(Rm-Rf)", content: "CAPM 用于计算权益资本成本 Re，是 WACC 的关键输入。", importance: 4, mastery: 30, relatedNoteCount: 1, relatedConcepts: [{ name: "WACC", type: "依赖" }] },
  k12: { description: "线性变换下保持方向不变的向量", content: "若 Av = λv（v≠0），则 λ 是特征值、v 是特征向量。", importance: 5, mastery: 85, relatedNoteCount: 3, relatedConcepts: [{ name: "特征向量", type: "配对" }, { name: "矩阵对角化", type: "应用" }] },
  k13: { description: "特征值对应的非零向量", content: "特征向量在变换下方向不变，仅被拉伸 λ 倍。", importance: 5, mastery: 80, relatedNoteCount: 2, relatedConcepts: [{ name: "特征值", type: "配对" }] },
  k14: { description: "将矩阵化为对角矩阵 P⁻¹AP = Λ", content: "矩阵对角化简化矩阵幂运算和差分方程求解。前提是存在 n 个线性独立的特征向量。", importance: 3, mastery: 25, relatedNoteCount: 1, relatedConcepts: [{ name: "特征值", type: "依赖" }, { name: "特征向量", type: "依赖" }] },
  k15: { description: "满足当代需求而不损害后代", content: "Sustainable development meets present needs without compromising future generations.", importance: 3, mastery: 60, relatedNoteCount: 1, relatedConcepts: [{ name: "学术写作结构", type: "话题" }] },
  k16: { description: "Introduction-Body-Conclusion 结构", content: "Academic writing follows a clear structure: thesis statement, topic sentences, evidence, and conclusion.", importance: 4, mastery: 55, relatedNoteCount: 2, relatedConcepts: [] },
};

type ActiveView = "canvas" | "import";
type DialogType = "flashcard" | "summary" | null;

export default function KnowledgeTreePage() {
  const { addNote } = useStore();
  const { subjects } = useSubjects();

  // Knowledge tree state
  const [canvasNodes, setCanvasNodes] = React.useState<CanvasNode[]>(() => {
    const layout = computeLayout(MOCK_LAYOUT_NODES);
    return MOCK_LAYOUT_NODES.map((ln) => ({
      ...ln,
      description: MOCK_NODE_META[ln.id]?.description ?? "",
      mastery: MOCK_NODE_META[ln.id]?.mastery ?? 50,
      relatedNoteCount: MOCK_NODE_META[ln.id]?.relatedNoteCount ?? 0,
      relatedConceptIds: MOCK_NODE_META[ln.id]?.relatedConcepts.map((rc) => rc.name) ?? [],
      x: layout.find((l) => l.id === ln.id)?.x ?? 0,
      y: layout.find((l) => l.id === ln.id)?.y ?? 0,
    }));
  });
  const [edges, setEdges] = React.useState<CanvasEdge[]>(MOCK_EDGES);

  // UI state
  const [activeView, setActiveView] = React.useState<ActiveView>("canvas");
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [filterSubject, setFilterSubject] = React.useState<string | null>(null);

  // Document import state
  const [extractedDoc, setExtractedDoc] = React.useState<ExtractedDocument | null>(null);

  // AI extraction state
  const [extractionResults, setExtractionResults] = React.useState<ExtractionResults | null>(null);
  const [extractionLoading, setExtractionLoading] = React.useState(false);
  const [extractionError, setExtractionError] = React.useState<string | null>(null);
  const [extractionVisible, setExtractionVisible] = React.useState(false);

  // Dialog state
  const [dialogType, setDialogType] = React.useState<DialogType>(null);
  const [dialogNode, setDialogNode] = React.useState<CanvasNode | null>(null);

  // ─── Derived data ─────────────────────────────────────────

  const selectedNode = React.useMemo(() => {
    if (!selectedNodeId) return null;
    const cn = canvasNodes.find((n) => n.id === selectedNodeId);
    if (!cn) return null;
    const meta = MOCK_NODE_META[cn.id];
    return {
      ...cn,
      description: meta?.description ?? cn.description,
      importance: meta?.importance ?? cn.importance,
      mastery: meta?.mastery ?? cn.mastery,
      relatedNoteCount: meta?.relatedNoteCount ?? cn.relatedNoteCount,
      relatedConcepts: meta?.relatedConcepts ?? [],
      content: meta?.content ?? "",
    } as KnowledgeNodeData;
  }, [selectedNodeId, canvasNodes]);

  const treeNodes: TreeNode[] = React.useMemo(() => {
    return canvasNodes.map((n) => ({
      id: n.id,
      name: n.name,
      subject: n.subject,
      mastery: n.mastery,
    }));
  }, [canvasNodes]);

  // ─── Handlers ─────────────────────────────────────────────

  function handleDocumentExtracted(doc: ExtractedDocument) {
    setExtractedDoc(doc);
  }

  async function handleProcessAI(doc: ExtractedDocument) {
    setExtractionLoading(true);
    setExtractionError(null);
    setExtractionResults(null);
    setExtractionVisible(true);
    setActiveView("canvas");

    try {
      const res = await fetch("/api/ai/knowledge-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text, subject: filterSubject }),
      });
      const data = await res.json();

      const concepts: ExtractedConcept[] = (data.concepts ?? []).map((c: { name: string; description: string; importance: number }) => ({
        ...c,
        selected: true,
      }));
      const relationships: ExtractedRelationship[] = (data.relationships ?? []).map((r: ExtractedRelationship) => ({
        ...r,
        selected: true,
      }));

      setExtractionResults({ concepts, relationships });
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "AI 提取失败");
    } finally {
      setExtractionLoading(false);
    }
  }

  function handleToggleConcept(index: number) {
    if (!extractionResults) return;
    const updated = [...extractionResults.concepts];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setExtractionResults({ ...extractionResults, concepts: updated });
  }

  function handleToggleRelationship(index: number) {
    if (!extractionResults) return;
    const updated = [...extractionResults.relationships];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setExtractionResults({ ...extractionResults, relationships: updated });
  }

  function handleEditConceptName(index: number, name: string) {
    if (!extractionResults) return;
    const updated = [...extractionResults.concepts];
    updated[index] = { ...updated[index], name, editing: false };
    setExtractionResults({ ...extractionResults, concepts: updated });
  }

  function handleAddAll() {
    if (!extractionResults) return;
    addExtractedToTree(extractionResults.concepts, extractionResults.relationships);
    setExtractionResults(null);
    setExtractionVisible(false);
  }

  function handleAddSelected() {
    if (!extractionResults) return;
    const selectedConcepts = extractionResults.concepts.filter((c) => c.selected);
    const selectedRelationships = extractionResults.relationships.filter((r) => r.selected);
    addExtractedToTree(selectedConcepts, selectedRelationships);
    setExtractionResults(null);
    setExtractionVisible(false);
  }

  function addExtractedToTree(
    concepts: ExtractedConcept[],
    relationships: ExtractedRelationship[]
  ) {
    // Add concepts as new nodes
    const existingNames = new Set(canvasNodes.map((n) => n.name));
    const newLayoutNodes: LayoutNode[] = [];
    const newNodeMetas: Record<string, NodeMeta> = {};
    let nextId = canvasNodes.length;

    for (const c of concepts) {
      if (existingNames.has(c.name)) continue;
      const id = `ext-${nextId++}`;
      newLayoutNodes.push({
        id,
        name: c.name,
        subject: filterSubject ?? "general",
        importance: c.importance,
      });
      newNodeMetas[id] = {
        description: c.description,
        content: c.description,
        importance: c.importance,
        mastery: 0, // new concepts start at 0 mastery
        relatedNoteCount: 0,
        relatedConcepts: [],
      };
    }

    if (newLayoutNodes.length === 0) return;

    // Compute layout for new nodes only, positioning them after existing ones
    const allLayoutNodes = canvasNodes.map((n) => ({
      id: n.id,
      name: n.name,
      subject: n.subject,
      importance: n.importance,
    }));
    const layout = computeLayout([...allLayoutNodes, ...newLayoutNodes]);
    const newLayoutMap = new Map(layout.map((l) => [l.id, { x: l.x, y: l.y }]));

    // Update positions for existing nodes too
    const updatedExisting = canvasNodes.map((n) => {
      const pos = newLayoutMap.get(n.id);
      return { ...n, x: pos?.x ?? n.x, y: pos?.y ?? n.y };
    });

    const newNodes: CanvasNode[] = newLayoutNodes.map((ln) => ({
      ...ln,
      description: newNodeMetas[ln.id]?.description ?? "",
      mastery: 0,
      relatedNoteCount: 0,
      relatedConceptIds: [],
      x: newLayoutMap.get(ln.id)?.x ?? 0,
      y: newLayoutMap.get(ln.id)?.y ?? 0,
    }));

    // Add new edges
    const newEdges: CanvasEdge[] = [];
    const nameToId = new Map<string, string>();
    for (const n of [...updatedExisting, ...newNodes]) {
      nameToId.set(n.name, n.id);
    }
    for (const r of relationships) {
      const sourceId = nameToId.get(r.source);
      const targetId = nameToId.get(r.target);
      if (sourceId && targetId) {
        newEdges.push({ source: sourceId, target: targetId, type: r.type });
      }
    }

    // Update mock meta
    Object.assign(MOCK_NODE_META, newNodeMetas);

    setCanvasNodes([...updatedExisting, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);

    // Save each concept as a note
    for (const c of concepts) {
      addNote({
        title: c.name,
        subject: filterSubject ?? "general",
        body: c.description || `概念：${c.name}`,
        tags: ["AI提取", "知识树"],
      });
    }
  }

  function handleGenerateFlashcards(node: KnowledgeNodeData) {
    const cn = canvasNodes.find((n) => n.id === node.id);
    setDialogNode(cn ?? null);
    setDialogType("flashcard");
  }

  function handleGenerateSummary(node: KnowledgeNodeData) {
    const cn = canvasNodes.find((n) => n.id === node.id);
    setDialogNode(cn ?? null);
    setDialogType("summary");
  }

  function handleSelectConcept(name: string) {
    // Find and select a concept node by name
    const found = canvasNodes.find((n) => n.name === name);
    if (found) {
      setSelectedNodeId(found.id);
    }
  }

  // ─── Render ───────────────────────────────────────────────

  const rightPanel = (
    <KnowledgeNode
      node={selectedNode}
      onClose={() => setSelectedNodeId(null)}
      onGenerateFlashcards={handleGenerateFlashcards}
      onGenerateSummary={handleGenerateSummary}
      onSelectConcept={handleSelectConcept}
    />
  );

  const actions = (
    <div className="flex items-center gap-2">
      <Tabs
        value={activeView}
        onValueChange={(v) => {
          setActiveView(v as ActiveView);
          if (v === "import") setExtractionVisible(false);
        }}
        className="flex flex-col gap-0"
      >
        <TabsList className="h-8">
          <TabsTrigger value="canvas" className="text-xs h-6">
            <LayoutDashboard className="size-3" />
            知识树
          </TabsTrigger>
          <TabsTrigger value="import" className="text-xs h-6">
            <Upload className="size-3" />
            导入
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={() => {
          setActiveView("import");
          setExtractionVisible(true);
        }}
      >
        <Plus className="size-3.5" />
        新建
      </Button>
    </div>
  );

  return (
    <PageShell
      title="Dynamic Knowledge Tree"
      description="导入文档，AI 自动提取知识并构建可视化知识图谱"
      actions={actions}
      rightPanel={rightPanel}
      maxWidth="full"
    >
      <div className="flex gap-0 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Left sidebar — Topic Explorer */}
        <div className="w-56 shrink-0 border-r bg-card rounded-l-2xl overflow-hidden hidden lg:block">
          <TopicExplorer
            nodes={treeNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            filterSubject={filterSubject}
            onFilterSubject={setFilterSubject}
          />
        </div>

        {/* Center — Canvas or Import */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeView === "canvas" ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* AI Extraction panel — slides in at top */}
              {extractionVisible && (
                <div className="shrink-0 border-b bg-card overflow-y-auto max-h-[45%]">
                  <AIExtractionPanel
                    results={extractionResults}
                    loading={extractionLoading}
                    error={extractionError}
                    onToggleConcept={handleToggleConcept}
                    onToggleRelationship={handleToggleRelationship}
                    onEditConceptName={handleEditConceptName}
                    onAddAll={handleAddAll}
                    onAddSelected={handleAddSelected}
                    onClose={() => setExtractionVisible(false)}
                  />
                </div>
              )}

              {/* Tree Canvas */}
              <div className={cn("flex-1", extractionVisible ? "min-h-[300px]" : "h-full")}>
                <TreeCanvas
                  nodes={canvasNodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onImportClick={() => setActiveView("import")}
                  className="h-full rounded-none border-0"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <DocumentImporter
                  onExtracted={handleDocumentExtracted}
                  onProcessAI={handleProcessAI}
                />

                {/* Quick extraction trigger if doc is loaded */}
                {extractedDoc && !extractionVisible && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleProcessAI(extractedDoc)}
                  >
                    <Brain className="size-4" />
                    用 AI 分析已提取的文本 ({extractedDoc.fileName})
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialogType === "flashcard"}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {dialogNode && (
            <FlashcardGenerator
              topic={dialogNode.name}
              content={MOCK_NODE_META[dialogNode.id]?.content ?? dialogNode.description}
              subject={dialogNode.subject}
              existingNodeId={dialogNode.id}
              onClose={() => setDialogType(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogType === "summary"}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {dialogNode && (
            <SummaryGenerator
              topic={dialogNode.name}
              content={MOCK_NODE_META[dialogNode.id]?.content ?? dialogNode.description}
              subject={dialogNode.subject}
              onClose={() => setDialogType(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

