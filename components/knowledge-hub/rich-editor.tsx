"use client";

import * as React from "react";
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Image, Link, Eye, Edit3, Type, Minus, Undo, Redo,
  Table, CheckSquare, X, Plus, Sparkles, Loader2,
  ChevronDown, Tag, Clock, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════════════════════════
   RichEditor — Notion-style markdown editor with toolbar

   Features:
   - Formatting toolbar (bold, italic, headings, lists, code, quote)
   - Edit / Preview toggle
   - Cover image with unsplash search
   - Properties panel (status, tags, date)
   - Keyboard shortcuts
   - Markdown-based (works with existing note.body storage)
   ═══════════════════════════════════════════════════════════════ */

interface RichEditorProps {
  title: string;
  onTitleChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  tags: string;
  onTagsChange: (v: string) => void;
  coverUrl?: string;
  onCoverChange?: (v: string) => void;
  onEnrich?: () => void;
  enriching?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, title, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "size-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors",
        active && "bg-primary/10 text-primary"
      )}
    >
      {icon}
    </button>
  );
}

export function RichEditor({
  title, onTitleChange, body, onBodyChange,
  tags, onTagsChange, coverUrl, onCoverChange,
  onEnrich, enriching, className,
}: RichEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = React.useState<"edit" | "preview">("edit");
  const [showCoverInput, setShowCoverInput] = React.useState(false);
  const [coverInput, setCoverInput] = React.useState(coverUrl ?? "");
  const [showProperties, setShowProperties] = React.useState(true);

  // ── Insert formatting ───────────────────────────────────
  function insertFormatting(prefix: string, suffix = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.substring(start, end);
    const newText = body.substring(0, start) + prefix + selected + suffix + body.substring(end);
    onBodyChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }

  function insertLinePrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    // Find line start
    const beforeCursor = body.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const line = body.substring(lineStart, start);
    // If line already has prefix, toggle it off
    if (line.startsWith(prefix)) {
      const newText = body.substring(0, lineStart) + line.slice(prefix.length) + body.substring(start);
      onBodyChange(newText);
      return;
    }
    const newText = body.substring(0, lineStart) + prefix + line + body.substring(start);
    onBodyChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  function insertBlock(blockSyntax: string, placeholder = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.substring(start, end);
    const prefix = start === 0 || body[start - 1] === "\n" ? "" : "\n";
    const content = selected || placeholder;
    const newText = body.substring(0, start) + prefix + blockSyntax + content + body.substring(end);
    onBodyChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + blockSyntax.length + content.length;
      el.setSelectionRange(pos, pos);
    });
  }

  // ── Toolbar actions ──────────────────────────────────────
  const tools = {
    bold: () => insertFormatting("**", "**"),
    italic: () => insertFormatting("*", "*"),
    underline: () => insertFormatting("<u>", "</u>"),
    strikethrough: () => insertFormatting("~~", "~~"),
    code: () => insertFormatting("`", "`"),
    codeBlock: () => insertBlock("```\n", "code\n"),
    quote: () => insertLinePrefix("> "),
    h1: () => insertLinePrefix("# "),
    h2: () => insertLinePrefix("## "),
    h3: () => insertLinePrefix("### "),
    ul: () => insertLinePrefix("- "),
    ol: () => insertLinePrefix("1. "),
    link: () => insertFormatting("[", "](url)"),
    hr: () => insertBlock("---\n"),
    checkbox: () => insertLinePrefix("- [ ] "),
  };

  // ── Keyboard shortcuts ───────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b": e.preventDefault(); tools.bold(); break;
        case "i": e.preventDefault(); tools.italic(); break;
        case "k": e.preventDefault(); tools.link(); break;
        case "`": e.preventDefault(); tools.code(); break;
      }
    }
    // Tab → indent in list
    if (e.key === "Tab") {
      e.preventDefault();
      insertFormatting("  ");
    }
  }

  // ── Cover image ──────────────────────────────────────────
  function saveCover() {
    if (onCoverChange && coverInput.trim()) {
      onCoverChange(coverInput.trim());
    }
    setShowCoverInput(false);
  }

  // ── Simple markdown → HTML preview ────────────────────────
  function renderPreview(text: string): string {
    return text
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
      // Bold / Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-bg-muted rounded-lg p-3 text-xs my-2 overflow-x-auto"><code>$2</code></pre>')
      .replace(/`(.+?)`/g, '<code class="bg-bg-muted rounded px-1 py-0.5 text-xs text-red-500">$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
      // Lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
      // Checkbox
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-3.5" /> $1</div>')
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-3.5" checked /> <span class="line-through text-fg-muted">$1</span></div>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/30 pl-3 my-2 text-fg-muted italic">$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-4 border-border/50" />')
      // Paragraphs
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  // ── Tag parsing ───────────────────────────────────────────
  const parsedTags = tags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);

  function removeTag(tag: string) {
    const updated = parsedTags.filter(t => t !== tag);
    onTagsChange(updated.join(", "));
  }

  function addTag(tag: string) {
    if (!tag.trim() || parsedTags.includes(tag.trim())) return;
    onTagsChange([...parsedTags, tag.trim()].join(", "));
  }

  const [newTag, setNewTag] = React.useState("");

  return (
    <div className={cn("flex flex-col", className)}>
      {/* ── Cover Image ── */}
      {coverUrl && (
        <div className="relative w-full h-40 rounded-t-xl overflow-hidden bg-bg-muted group">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => { setCoverInput(""); onCoverChange?.(""); }}
            className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/30 bg-bg-muted/20 overflow-x-auto">
        <div className="flex items-center gap-0.5 border-r border-border/30 pr-2 mr-1">
          <ToolbarButton icon={<Bold className="size-3.5" />} title="粗体 (Ctrl+B)" onClick={tools.bold} />
          <ToolbarButton icon={<Italic className="size-3.5" />} title="斜体 (Ctrl+I)" onClick={tools.italic} />
          <ToolbarButton icon={<Underline className="size-3.5" />} title="下划线" onClick={tools.underline} />
          <ToolbarButton icon={<Strikethrough className="size-3.5" />} title="删除线" onClick={tools.strikethrough} />
          <ToolbarButton icon={<Code className="size-3.5" />} title="行内代码" onClick={tools.code} />
          <ToolbarButton icon={<Link className="size-3.5" />} title="链接 (Ctrl+K)" onClick={tools.link} />
        </div>
        <div className="flex items-center gap-0.5 border-r border-border/30 pr-2 mr-1">
          <ToolbarButton icon={<Heading1 className="size-3.5" />} title="一级标题" onClick={tools.h1} />
          <ToolbarButton icon={<Heading2 className="size-3.5" />} title="二级标题" onClick={tools.h2} />
          <ToolbarButton icon={<Heading3 className="size-3.5" />} title="三级标题" onClick={tools.h3} />
        </div>
        <div className="flex items-center gap-0.5 border-r border-border/30 pr-2 mr-1">
          <ToolbarButton icon={<List className="size-3.5" />} title="无序列表" onClick={tools.ul} />
          <ToolbarButton icon={<ListOrdered className="size-3.5" />} title="有序列表" onClick={tools.ol} />
          <ToolbarButton icon={<CheckSquare className="size-3.5" />} title="待办" onClick={tools.checkbox} />
          <ToolbarButton icon={<Quote className="size-3.5" />} title="引用" onClick={tools.quote} />
          <ToolbarButton icon={<Minus className="size-3.5" />} title="分割线" onClick={tools.hr} />
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Code className="size-3.5" />} title="代码块" onClick={tools.codeBlock} />
          {!coverUrl && (
            <ToolbarButton
              icon={<Image className="size-3.5" />}
              title="封面图"
              onClick={() => setShowCoverInput(!showCoverInput)}
            />
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setShowProperties(!showProperties)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
              showProperties ? "bg-primary/5 text-primary" : "text-fg-muted hover:bg-bg-muted"
            )}
          >
            <ChevronDown className={cn("size-3 transition-transform", !showProperties && "-rotate-90")} />
            属性
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
              mode === "preview" ? "bg-primary/5 text-primary" : "text-fg-muted hover:bg-bg-muted"
            )}
          >
            {mode === "edit" ? <Eye className="size-3" /> : <Edit3 className="size-3" />}
            {mode === "edit" ? "预览" : "编辑"}
          </button>
        </div>
      </div>

      {/* Cover URL input */}
      {showCoverInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-muted/10 border-b border-border/30">
          <Image className="size-3.5 text-fg-muted shrink-0" />
          <Input
            value={coverInput}
            onChange={e => setCoverInput(e.target.value)}
            placeholder="输入封面图 URL…"
            className="text-xs h-7 flex-1"
            onKeyDown={e => e.key === "Enter" && saveCover()}
          />
          <Button size="sm" variant="ghost" onClick={saveCover} className="text-xs h-7">保存</Button>
          <button onClick={() => setShowCoverInput(false)} className="text-fg-muted hover:text-fg">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Properties Panel ── */}
      {showProperties && (
        <div className="flex flex-col gap-2 px-4 py-3 border-b border-border/30 bg-bg-muted/5">
          {/* Tags */}
          <div className="flex items-start gap-3">
            <span className="text-[11px] text-fg-muted w-14 shrink-0 pt-1 flex items-center gap-1">
              <Tag className="size-3" /> 标签
            </span>
            <div className="flex-1 flex flex-wrap gap-1.5 items-center min-w-0">
              {parsedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1 group pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(newTag);
                      setNewTag("");
                    }
                  }}
                  placeholder="添加标签…"
                  className="text-[10px] bg-transparent border-none outline-none w-20 text-fg-muted placeholder:text-fg-subtle/90"
                />
                {newTag.trim() && (
                  <button onClick={() => { addTag(newTag); setNewTag(""); }}
                    className="text-[10px] text-primary hover:underline">
                    添加
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Created / Updated */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-fg-muted w-14 shrink-0 flex items-center gap-1">
              <Clock className="size-3" /> 日期
            </span>
            <span className="text-[11px] text-fg-muted/90">
              {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
      )}

      {/* ── Editor / Preview ── */}
      <div className="flex-1 min-h-0">
        {mode === "edit" ? (
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => onBodyChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="开始写笔记… 支持 Markdown 格式

使用工具栏或快捷键格式化文本：
**粗体** *斜体* `代码` [链接](url)
# 一级标题 ## 二级标题 ### 三级标题
- 无序列表 1. 有序列表
> 引用 --- 分割线
- [ ] 待办事项"
            className="w-full min-h-[300px] resize-y border-0 bg-transparent px-4 py-4 text-sm leading-relaxed focus:outline-none focus:ring-0 font-mono"
            spellCheck={false}
          />
        ) : (
          <div
            className="px-4 py-4 text-sm leading-relaxed prose prose-sm max-w-none min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: renderPreview(body) || '<p class="text-fg-subtle/90 italic">暂无内容</p>' }}
          />
        )}
      </div>

      {/* ── Bottom bar: AI enrich + word count ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-bg-muted/10">
        <div className="flex items-center gap-2">
          {onEnrich && (
            <button
              type="button"
              onClick={onEnrich}
              disabled={enriching || !title.trim()}
              className="inline-flex items-center gap-1.5 text-[11px] rounded-lg bg-amber-100 text-amber-700 px-2.5 py-1 hover:bg-amber-200 transition-colors disabled:opacity-50 font-medium"
            >
              {enriching ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
              AI 充实内容
            </button>
          )}
          <span className="text-[10px] text-fg-muted/80">
            支持 Markdown · 快捷键: Ctrl+B 粗体, Ctrl+I 斜体, Ctrl+K 链接
          </span>
        </div>
        <span className="text-[10px] text-fg-muted/80">
          {body.length} 字符
        </span>
      </div>
    </div>
  );
}
