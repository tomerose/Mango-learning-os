"use client";

import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const VERSION = "V12 内测版";
const STORAGE_KEY = "mango-update-seen-v5";

const UPDATES = [
  { tag: "New", label: "全新计划系统", desc: "Guest / Standard / Pro / Admin 四级计划，后端配额控制" },
  { tag: "New", label: "Mango Code 兑换", desc: "一次性兑换码升级计划，防双重兑换保护" },
  { tag: "New", label: "Profile 控制中心", desc: "移动端 OS 风格的个人中心，计划、配额、资产一目了然" },
  { tag: "Improved", label: "登录/注册焕新", desc: "Calm Academic OS 美学，两步验证流程" },
  { tag: "Improved", label: "功能门控系统", desc: "后端强制 + 前端引导，清晰的锁定态和升级提示" },
  { tag: "Fixed", label: "Agent 模板执行", desc: "修复 Agent 模板点击后白屏的问题" },
];

export function WeeklyUpdateSection() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="card-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <h2 className="text-[15px] font-semibold">本周更新</h2>
        </div>
        <span className="text-[10px] font-medium text-fg-muted/50 bg-bg-muted px-2 py-0.5 rounded-full">
          {VERSION}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {UPDATES.slice(0, expanded ? UPDATES.length : 3).map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-subtle transition-colors">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 shrink-0 ${
              item.tag === "New"
                ? "bg-green-100 text-green-700"
                : item.tag === "Improved"
                ? "bg-blue-100 text-blue-700"
                : "bg-bg-muted text-fg-muted"
            }`}>
              {item.tag}
            </span>
            <div>
              <p className="text-[13px] font-medium">{item.label}</p>
              <p className="text-[11px] text-fg-muted/60 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {UPDATES.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-[12px] text-fg-muted/60 hover:text-fg-muted transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? "收起" : `查看全部 ${UPDATES.length} 项更新`}
          <ArrowRight className={`size-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      )}
    </div>
  );
}
