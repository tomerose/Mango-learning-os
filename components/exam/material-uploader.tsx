"use client";

import * as React from "react";
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// MaterialUploader — drag-and-drop multi-file upload for exam
// preparation materials. Accepts PDF, DOCX, PPTX, TXT.
// ─────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading" | "extracting" | "done" | "error";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number;
  textPreview?: string;
  error?: string;
}

interface MaterialUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onComplete?: (files: UploadedFile[]) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];
const ACCEPTED_EXTENSIONS = ".pdf,.docx,.pptx,.txt";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractTextPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string).slice(0, 500);
        resolve(text);
      };
      reader.onerror = () => resolve(`[Could not read ${file.name}]`);
      reader.readAsText(file);
    } else {
      // For binary formats (PDF, DOCX, PPTX), return placeholder
      resolve(
        `[${file.type.split("/")[1].toUpperCase()} file: ${file.name}]\nText extraction will be processed server-side.`
      );
    }
  });
}

export function MaterialUploader({
  files,
  onFilesChange,
  onComplete,
}: MaterialUploaderProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [localFiles, setLocalFiles] = React.useState<UploadedFile[]>(files);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync local state when parent files change (initial load)
  const filesRef = React.useRef(files);
  React.useEffect(() => {
    if (files !== filesRef.current) {
      setLocalFiles(files);
      filesRef.current = files;
    }
  }, [files]);

  // Emit changes to parent whenever local files update
  const updateFiles = React.useCallback(
    (updater: (prev: UploadedFile[]) => UploadedFile[]) => {
      setLocalFiles((prev) => {
        const next = updater(prev);
        onFilesChange(next);
        return next;
      });
    },
    [onFilesChange]
  );

  const handleFiles = React.useCallback(
    async (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter((f) => {
        if (
          !ACCEPTED_TYPES.includes(f.type) &&
          !f.name.match(/\.(pdf|docx|pptx|txt)$/i)
        ) {
          return false;
        }
        if (f.size > MAX_FILE_SIZE) return false;
        return true;
      });

      if (incoming.length === 0) return;

      const newFiles: UploadedFile[] = incoming.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || "unknown",
        status: "uploading" as UploadStatus,
        progress: 0,
      }));

      updateFiles((prev) => [...prev, ...newFiles]);

      // Process each file with simulated progress
      for (let i = 0; i < incoming.length; i++) {
        const f = incoming[i];
        // We need to calculate the index after all adds
        const baseIdx = localFiles.length + i;

        // Simulate upload progress
        for (let p = 20; p <= 100; p += 20) {
          await new Promise((r) => setTimeout(r, 80));

          setLocalFiles((prev) => {
            const next = prev.map((uf, j) =>
              j === baseIdx ? { ...uf, progress: Math.min(p, 100) } : uf
            );
            return next;
          });
        }

        // Switch to extracting
        setLocalFiles((prev) => {
          const next = prev.map((uf, j) =>
            j === baseIdx
              ? { ...uf, status: "extracting" as UploadStatus, progress: 100 }
              : uf
          );
          onFilesChange(next);
          return next;
        });

        const text = await extractTextPreview(f);

        setLocalFiles((prev) => {
          const next = prev.map((uf, j) =>
            j === baseIdx
              ? {
                  ...uf,
                  status: "done" as UploadStatus,
                  textPreview: text,
                  progress: 100,
                }
              : uf
          );
          onFilesChange(next);
          return next;
        });
      }
    },
    [localFiles.length, updateFiles, onFilesChange]
  );

  const removeFile = React.useCallback(
    (index: number) => {
      updateFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [updateFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const allDone = localFiles.length > 0 && localFiles.every((f) => f.status === "done");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Study Materials</CardTitle>
          <CardDescription>
            Drag and drop your lecture notes, slides, or textbooks. Supports
            PDF, DOCX, PPTX, and TXT (max 20MB each).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <Upload
              className={cn(
                "size-10 transition-colors",
                dragOver ? "text-primary" : "text-muted-foreground/60"
              )}
            />
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragOver
                  ? "Drop files here"
                  : "Drag & drop files, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ACCEPTED_EXTENSIONS.replace(/\./g, "").toUpperCase()} files up
                to 20MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* File list */}
          {localFiles.length > 0 && (
            <div className="flex flex-col gap-2">
              {localFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <FileText className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <Badge
                        variant={
                          file.status === "done"
                            ? "success"
                            : file.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                        className="shrink-0"
                      >
                        {file.status === "uploading"
                          ? "Uploading"
                          : file.status === "extracting"
                            ? "Extracting"
                            : file.status === "done"
                              ? "Ready"
                              : "Error"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                    {(file.status === "uploading" ||
                      file.status === "extracting") && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress
                          value={file.progress}
                          className="h-1.5 flex-1"
                        />
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {file.status === "done" && file.textPreview && (
                      <div className="mt-2 rounded-md bg-background p-2 max-h-20 overflow-y-auto">
                        <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap line-clamp-3">
                          {file.textPreview}
                        </p>
                      </div>
                    )}
                    {file.status === "error" && file.error && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="size-3" />
                        {file.error}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Done state */}
          {allDone && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-3">
              <CheckCircle2 className="size-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-success">
                  All files ready
                </p>
                <p className="text-xs text-muted-foreground">
                  {localFiles.length} file{localFiles.length > 1 ? "s" : ""}{" "}
                  uploaded and text extracted. Continue to configuration.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Re-export types for parent components
export type { UploadedFile, UploadStatus };
