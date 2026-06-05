"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   EmptyState — premium empty state with illustration + CTA
   Usage:
     <EmptyState icon={Target} title="还没有学习目标"
       description="创建第一个目标，开始追踪你的学习进度"
       action={{ label: "创建目标", href: "/planner" }} />
   ───────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { icon: "size-8", wrapper: "py-4 gap-2", text: "text-sm" },
  md: { icon: "size-12", wrapper: "py-8 gap-3", text: "text-sm" },
  lg: { icon: "size-16", wrapper: "py-12 gap-4", text: "text-base" },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const s = sizeClasses[size];

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.wrapper,
        className,
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Icon with soft background */}
      <motion.span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/30",
          s.icon,
        )}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Icon
          className={cn(s.icon, "p-1.5")}
          strokeWidth={1.2}
        />
      </motion.span>

      {/* Text */}
      <div className={cn("flex flex-col items-center", size === "sm" ? "gap-0.5" : "gap-1")}>
        <p className={cn("font-medium text-muted-foreground", s.text)}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground/60 max-w-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
        >
          {action.href ? (
            <Button size="sm" variant="outline" asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
