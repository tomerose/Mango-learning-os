"use client";

import * as React from "react";
import { MessageSquare, ArrowRight } from "lucide-react";

export function FeedbackEntry() {
  return (
    <div className="card-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">帮助 MangoOS 变得更好</h3>
      </div>
      <p className="text-[12px] text-fg-muted/90 leading-relaxed">
        你遇到的卡点，可能就是下周 MangoOS 的更新方向。
      </p>
      <div className="flex gap-2">
        <a
          href="mailto:1211000567@qq.com?subject=MangoOS 反馈"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3.5 py-2 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          反馈一个问题
          <ArrowRight className="size-3" />
        </a>
        <a
          href="mailto:1211000567@qq.com?subject=MangoOS 建议"
          className="inline-flex items-center gap-1.5 rounded-full bg-bg-muted px-3.5 py-2 text-[11px] font-medium text-fg-muted/90 hover:bg-bg-subtle transition-colors"
        >
          提交建议
        </a>
      </div>
    </div>
  );
}
