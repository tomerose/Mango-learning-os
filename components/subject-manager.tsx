"use client";

import * as React from "react";
import { Settings2, Plus, Trash2 } from "lucide-react";

import { useSubjects } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function SubjectManager() {
  const { subjects, addSubject, removeSubject } = useSubjects();
  const [open, setOpen] = React.useState(false);
  const [newId, setNewId] = React.useState("");
  const [newLabel, setNewLabel] = React.useState("");
  const [newShort, setNewShort] = React.useState("");
  const [error, setError] = React.useState("");

  function handleAdd() {
    const id = newId.trim().toLowerCase().replace(/\s+/g, "-");
    if (!id || !newLabel.trim()) { setError("ID 和名称不能为空"); return; }
    if (subjects.find(s => s.id === id)) { setError("该学科 ID 已存在"); return; }
    addSubject({ id, label: newLabel.trim(), short: newShort.trim() || newLabel.trim().slice(0, 4) });
    setNewId(""); setNewLabel(""); setNewShort(""); setError("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings2 className="size-3.5" /> 管理学科
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>管理学科</DialogTitle>
          <DialogDescription>添加或删除自定义学科，所有功能页面将自动同步。</DialogDescription>
        </DialogHeader>

        {/* Current subjects */}
        <div className="flex flex-wrap gap-2">
          {subjects.map(s => (
            <Badge key={s.id} variant="secondary" className="gap-1.5 pl-2 pr-1 py-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
              {subjects.length > 1 && (
                <button onClick={() => removeSubject(s.id)} className="hover:text-destructive ml-0.5">
                  <Trash2 className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {/* Add new */}
        <div className="flex flex-col gap-2 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">添加新学科</p>
          <div className="flex gap-2">
            <Input value={newId} onChange={e => setNewId(e.target.value)}
              placeholder="ID（如 physics）" className="flex-1" />
            <Input value={newShort} onChange={e => setNewShort(e.target.value)}
              placeholder="缩写" className="w-20" />
          </div>
          <Input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            placeholder="显示名称（如 物理学）" />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>完成</Button>
          <Button onClick={handleAdd} disabled={!newId.trim() || !newLabel.trim()}>
            <Plus className="size-4" /> 添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
