import { Sparkles } from "lucide-react";

export function BrandCard() {
  return (
    <div className="md:hidden mt-4 mb-2">
      <div className="glass-card rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-md">
            <Sparkles className="size-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight">
              第三自习室
              <span className="text-muted-foreground/30 mx-2 font-light">|</span>
              <span className="font-semibold text-muted-foreground/60 text-xs">Mango</span>
            </p>
            <p className="text-muted-foreground/50 text-[11px] leading-snug mt-0.5">
              AI 驱动的学习操作系统
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-foreground/[0.04]">
          {["UIBE", "金融AI", "学术英语", "量化思维", "认知科学"].map(tag => (
            <span key={tag}
              className="bg-foreground/[0.03] rounded-full px-2.5 py-1 text-[10px] text-muted-foreground/60 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
