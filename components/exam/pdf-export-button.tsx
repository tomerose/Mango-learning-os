"use client";

import * as React from "react";
import {
  FileDown,
  Printer,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// PDFExportButton — exports the review booklet as PDF via
// browser print() with @media print styling. Shows a dialog
// with a summary of what will be exported.
//
// Include print styles in your global CSS:
// @media print {
//   .no-print { display: none !important; }
//   body { font-size: 11pt; }
// }
// ─────────────────────────────────────────────────────────────

interface ExportItem {
  label: string;
  count: number;
}

interface PDFExportButtonProps {
  subject: string;
  items: ExportItem[];
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function PDFExportButton({
  subject,
  items,
  className,
  variant = "default",
  size = "default",
}: PDFExportButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleExport = () => {
    setExporting(true);

    // Brief delay so the dialog doesn't flash shut instantly
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      window.print();

      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1500);
    }, 400);
  };

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          <FileDown className="size-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Export Review Booklet
          </DialogTitle>
          <DialogDescription>
            Print your <strong>{subject}</strong> review booklet as PDF. Use
            your browser&quot;s &quot;Save as PDF&quot; option in the print
            dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {/* Summary list */}
          <p className="text-sm font-medium">Contents ({totalItems} total):</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
              >
                <span className="text-sm">{item.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>

          {/* Print tips */}
          <div className="rounded-lg bg-info/10 border border-info/20 p-3 mt-2">
            <p className="text-xs font-semibold text-info mb-1">
              Tips for best results:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Select &quot;Save as PDF&quot; as the destination</li>
              <li>Use A4 or Letter paper size</li>
              <li>Enable &quot;Background graphics&quot; for colored elements</li>
              <li>Margins: &quot;Default&quot; or &quot;Minimum&quot;</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || done}
          >
            {exporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing...
              </>
            ) : done ? (
              <>
                <CheckCircle2 className="size-4" />
                Done!
              </>
            ) : (
              <>
                <Printer className="size-4" />
                Print to PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ExportItem };
