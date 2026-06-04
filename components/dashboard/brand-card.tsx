import { GraduationCap } from "lucide-react";

export function BrandCard() {
  return (
    <div className="md:hidden mt-2 mb-2">
      <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/4 to-background border border-primary/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary/15 flex size-10 shrink-0 items-center justify-center rounded-xl">
            <GraduationCap className="text-primary size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight">
              第三自习室 <span className="text-primary">·</span> Mango Learning OS
            </p>
            <p className="text-muted-foreground text-[11px] leading-snug mt-0.5">
              AI 驱动的学习操作系统 — 把焦虑变成准备
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["UIBE", "金融AI", "学术英语", "量化思维", "认知科学"].map(tag => (
            <span key={tag} className="bg-background/60 rounded-full border px-2.5 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
