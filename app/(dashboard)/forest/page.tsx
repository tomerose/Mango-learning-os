"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trees } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { PageShell } from "@/components/layout/page-shell";
import { KnowledgeForest } from "@/components/knowledge-hub/knowledge-forest";
import { ForestBackground } from "@/components/ui/module-backgrounds";

export default function ForestPage() {
  return (
    <PageTransition>
      <div className="relative">
        <ForestBackground />
        <PageShell title="知识森林" description="IELTS · CFA · AI 工程师 · 托福 — 结构化知识体系，自由探索与生长"
          maxWidth="xl">
          <div className="relative z-10">
            <KnowledgeForest />
          </div>
        </PageShell>
      </div>
    </PageTransition>
  );
}
