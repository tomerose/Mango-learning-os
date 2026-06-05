"use client";

import * as React from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Brain } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Knowledge Tree — document importer (drag-drop upload zone).
// Accepts PDF, DOCX, PPTX, TXT, MD. Extracts text via API,
// then optionally calls AI knowledge extraction.
// ─────────────────────────────────────────────────────────────

export interface ExtractedDocument {
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
}

interface Props {
  onExtracted: (doc: ExtractedDocument) => void;
  onProcessAI?: (doc: ExtractedDocument) => void;
  className?: string;
}

type UploadState = "idle" | "uploading" | "extracting" | "done" | "error";

export function DocumentImporter({ onExtracted, onProcessAI, className }: Props) {
  const [dragOver, setDragOver] = React.useState(false);
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [extractedDoc, setExtractedDoc] = React.useState<ExtractedDocument | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [previewLines, setPreviewLines] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allowedExtensions = [".pdf", ".docx", ".pptx", ".txt", ".md"];
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/markdown",
  ];

  function validateFile(file: File): string | null {
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : "";
    if (!allowedExtensions.includes(ext) && !allowedMimes.includes(file.type)) {
      return `不支持的文件格式。支持：${allowedExtensions.join(", ")}`;
    }
    if (file.size > 50 * 1024 * 1024) {
      return "文件大小不能超过 50MB";
    }
    return null;
  }

  async function processFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploadState("error");
      return;
    }

    setError(null);
    setUploadState("uploading");
    setProgress(20);

    try {
      // Simulate upload progress
      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/knowledge-tree/import", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "上传失败" }));
        throw new Error(errBody.error ?? "上传失败");
      }

      setProgress(100);
      setUploadState("extracting");

      const data = await res.json();

      const doc: ExtractedDocument = {
        text: data.text,
        fileName: data.fileName ?? file.name,
        fileType: data.fileType ?? file.type,
        pageCount: data.pageCount,
      };

      setExtractedDoc(doc);
      setPreviewLines(doc.text.slice(0, 600).split("\n").filter(Boolean).slice(0, 8));
      setUploadState("done");
      onExtracted(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
      setUploadState("error");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function reset() {
    setUploadState("idle");
    setProgress(0);
    setExtractedDoc(null);
    setError(null);
    setPreviewLines([]);
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="size-4" />
          导入文档
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Drop zone */}
        {uploadState === "idle" || uploadState === "error" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : error
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedExtensions.join(",")}
              className="hidden"
              onChange={handleFileSelect}
            />
            {error ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="size-8 text-destructive opacity-60" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
                  重试
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                  <Upload className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
                <p className="text-xs text-muted-foreground">
                  支持 PDF, DOCX, PPTX, TXT, MD (最大 50MB)
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Uploading / Extracting */}
        {(uploadState === "uploading" || uploadState === "extracting") && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="size-8 text-primary animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {uploadState === "uploading" ? "正在上传..." : "正在提取文本..."}
              </p>
            </div>
            <Progress value={progress} className="w-full h-1.5" />
          </div>
        )}

        {/* Done — preview */}
        {uploadState === "done" && extractedDoc && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="text-sm font-medium">{extractedDoc.fileName}</span>
              {extractedDoc.pageCount && (
                <Badge variant="secondary" className="text-xs">
                  {extractedDoc.pageCount} 页
                </Badge>
              )}
            </div>

            {/* Text preview */}
            {previewLines.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">文本预览</p>
                <div className="space-y-1">
                  {previewLines.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {line}
                    </p>
                  ))}
                </div>
                {extractedDoc.text.length > 600 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ... 共 {extractedDoc.text.length.toLocaleString()} 字符
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
              >
                重新上传
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => onProcessAI?.(extractedDoc)}
              >
                <Brain className="size-3.5" />
                AI 提取知识
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
