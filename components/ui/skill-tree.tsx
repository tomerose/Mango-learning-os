"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   SkillTree — Elegant mastery progression visualization
   Organic skill branches with progress rings. No raw charts.
   ═══════════════════════════════════════════════════════════════ */

interface Skill {
  label: string; pct: number; color?: string; children?: Skill[];
}

interface SkillTreeProps { skills: Skill[]; className?: string; }

function SkillBranch({ skill, depth = 0 }: { skill: Skill; depth?: number }) {
  const hasChildren = skill.children && skill.children.length > 0;
  const color = skill.color ?? "var(--color-primary)";

  return (
    <div className="flex flex-col gap-2">
      {/* Node */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: depth * 0.1, duration: 0.5 }}
      >
        {/* Progress ring */}
        <div className="relative size-10 shrink-0">
          <svg viewBox="0 0 40 40" className="size-full -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
            <motion.circle
              cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${skill.pct * 1.005} 100`}
              initial={{ strokeDasharray: "0 100" }}
              whileInView={{ strokeDasharray: `${skill.pct * 1.005} 100` }}
              viewport={{ once: true }}
              transition={{ delay: depth * 0.1 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">
            {skill.pct}%
          </span>
        </div>
        <div>
          <p className="text-small font-medium">{skill.label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.pct}%` }}
                viewport={{ once: true }}
                transition={{ delay: depth * 0.1 + 0.4, duration: 0.6 }} />
            </div>
            <span className="text-caption">{skill.pct < 30 ? "初学" : skill.pct < 60 ? "进阶" : skill.pct < 85 ? "熟练" : "精通"}</span>
          </div>
        </div>
      </motion.div>

      {/* Children */}
      {hasChildren && (
        <div className="ml-5 pl-4 border-l border-border/50 flex flex-col gap-2">
          {skill.children!.map((child) => (
            <SkillBranch key={child.label} skill={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SkillTree({ skills, className }: SkillTreeProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {skills.map((skill) => (
        <SkillBranch key={skill.label} skill={skill} />
      ))}
    </div>
  );
}
