"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GeekDashboard } from "@/components/hub/GeekDashboard";
import { MagicCard } from "@/components/hub/magic-card";
import { WeeklyOverviewChart } from "@/components/hub/weekly-overview-chart";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";

/* ─────────────────────────────────────────────────────────────
   Hub v5 — GeekDashboard Command Center + Magic Card + Chart
   ───────────────────────────────────────────────────────────── */

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    setShowOnboarding(shouldShowOnboarding());
  }, []);

  if (showOnboarding) {
    return <MangoOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ═══ GeekDashboard — NASA Space Command Center ═══ */}
      <GeekDashboard onMagicClick={() => setMagicOpen(true)} />

      {/* ═══ Mango Magic Card (full-screen dialog) ═══ */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />

      {/* ═══ Weekly Chart ═══ */}
      <ScrollReveal direction="up">
        <WeeklyOverviewChart />
      </ScrollReveal>
    </div>
  );
}
