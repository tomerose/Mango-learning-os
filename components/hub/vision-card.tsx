"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Workflow, Search, Layers, RotateCcw, Telescope } from "lucide-react";

export function VisionCard() {
  return (
    <div className="card-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Telescope className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">MangoOS 正在走向哪里</h3>
      </div>

      {/* Core vision */}
      <div className="space-y-2">
        <p className="text-[15px] font-serif font-medium text-fg">
          Mango Agent Workbench
        </p>
        <p className="text-[12px] text-fg-muted/90 leading-relaxed">
          我们希望未来的 Mango Agent 不只是回答问题，而是能长期执行一个复杂目标：查资料、拆任务、生成成果、保存过程、持续迭代。
        </p>
        <p className="text-[12px] text-fg-muted/90 leading-relaxed">
          它会更像一个面向学习、研究和个人项目的 Agent 工作台：你给它一个目标，它帮你推进到一个可以保存、复用、继续修改的成果。
        </p>
      </div>

      {/* Future capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          {
            icon: Workflow,
            title: "长任务执行",
            desc: "不只是回答一次，而是持续推进学习、研究和项目任务。",
          },
          {
            icon: Search,
            title: "资料与来源",
            desc: "自动查找资料、筛选来源、保留证据链。",
          },
          {
            icon: Layers,
            title: "成果工作台",
            desc: "把过程沉淀为讲义、报告、计划、复盘和项目文档。",
          },
          {
            icon: RotateCcw,
            title: "持续迭代",
            desc: "下次打开时，可以接着上次的上下文继续推进。",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2.5 bg-bg-subtle rounded-xl p-3"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/60">
              <item.icon className="size-3.5 text-fg-muted/90" />
            </span>
            <div>
              <p className="text-xs font-medium">{item.title}</p>
              <p className="text-[10px] text-fg-muted/90 mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">
          远期愿景 · 未上线
        </span>
        <span className="text-[10px] text-fg-subtle/90">
          当前内测版 v0.1 正在先打磨：输入任务 → 生成成果 → 保存 Library → 导出
        </span>
      </div>
    </div>
  );
}
