import { GraduationCap } from "lucide-react";

export function BrandCard() {
  return (
    <div className="md:hidden mt-1 mb-2">
      <div className="rounded-2xl bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-background px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm">
            <GraduationCap className="text-primary size-5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight">
              第三自习室
              <span className="text-primary font-normal mx-1.5 opacity-50">·</span>
              <span className="font-semibold text-muted-foreground text-[13px]">Mango</span>
            </p>
            <p className="text-muted-foreground text-[11px] leading-snug mt-0.5 font-medium">
              AI 驱动的学习操作系统 — 把焦虑变成准备
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {["UIBE", "金融AI", "学术英语", "量化思维", "认知科学"].map(tag => (
            <span key={tag} className="bg-secondary/60 rounded-full px-2.5 py-1 text-[10px] text-muted-foreground font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
