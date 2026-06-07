"use client";

import * as React from "react";
import { Copy, Download, Save, FileText, RotateCcw, Check } from "lucide-react";

interface Props {
  onCopy?: () => void;
  onExportMD?: () => void;
  onExportHTML?: () => void;
  onSave?: () => void;
  onContinue?: () => void;
  saved?: boolean;
  copied?: boolean;
  className?: string;
}

export function OutcomeActionsBar({ onCopy, onExportMD, onExportHTML, onSave, onContinue, saved, copied, className }: Props) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {onSave && (
          <button onClick={onSave} disabled={saved}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold transition-colors ${
              saved ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200 hover:bg-amber-400/20"
            }`}>
            {saved ? <Check className="size-3" /> : <Save className="size-3" />}
            {saved ? "已保存" : "保存到 Library"}
          </button>
        )}

        {onCopy && (
          <button onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors">
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "已复制" : "复制"}
          </button>
        )}

        {onExportMD && (
          <button onClick={onExportMD}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors">
            <Download className="size-3" />导出 MD
          </button>
        )}

        {onExportHTML && (
          <button onClick={onExportHTML}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors">
            <FileText className="size-3" />导出 HTML
          </button>
        )}

        {onContinue && (
          <button onClick={onContinue}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors">
            <RotateCcw className="size-3" />继续深化
          </button>
        )}
      </div>
    </div>
  );
}
