"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Brain, ListOrdered, Beaker, AlertTriangle, ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "concept", icon: Lightbulb, label: "核心概念", hint: "一句话点明本质" },
  { id: "intuition", icon: Brain, label: "直觉理解", hint: "类比与设计原因" },
  { id: "derivation", icon: ListOrdered, label: "推导步骤", hint: "关键步骤拆解" },
  { id: "example", icon: Beaker, label: "具体例子", hint: "可验证的实例" },
  { id: "mistakes", icon: AlertTriangle, label: "易错点", hint: "常见陷阱" },
  { id: "next", icon: ArrowRight, label: "下一步", hint: "延伸学习建议" },
];

interface StepContent { id: string; content: string; }

interface LearningCardsProps { steps: StepContent[]; className?: string; }

export function LearningCards({ steps, className }: LearningCardsProps) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {STEPS.map((step, i) => {
        const data = steps.find((s) => s.id === step.id);
        const isOpen = expanded === step.id;
        const Icon = step.icon;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn("card-card overflow-hidden transition-all duration-300", isOpen && "card-floating border-primary/30")}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : step.id)}
              className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
            >
              <span className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300", isOpen ? "bg-primary-subtle" : "bg-bg-muted")}>
                <Icon className={cn("size-5 transition-colors duration-300", isOpen ? "text-primary" : "text-fg-muted")} strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-small font-medium transition-colors duration-300", isOpen && "text-primary")}>
                  {i + 1}. {step.label}
                </p>
                {!isOpen && <p className="text-caption">{data ? "点击展开" : step.hint}</p>}
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="size-4 text-fg-subtle" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && data && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 border-t border-border/50 mx-4">
                    <div className="pt-4 text-body leading-relaxed whitespace-pre-wrap text-fg">
                      {data.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
