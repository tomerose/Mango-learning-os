"use client";

import * as React from "react";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GeekDashboard } from "@/components/hub/GeekDashboard";
import { MagicCard } from "@/components/hub/magic-card";
import { WeeklyOverviewChart } from "@/components/hub/weekly-overview-chart";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    setShowOnboarding(shouldShowOnboarding());
  }, []);

  // Force dark-space background for the entire hub viewport
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prevBg = root.style.getPropertyValue("--background");
    const prevCard = root.style.getPropertyValue("--card");
    const prevBodyBg = body.style.backgroundColor;
    root.style.setProperty("--background", "#05070B");
    root.style.setProperty("--card", "#0D121F");
    root.style.setProperty("--border", "rgba(255,255,255,0.06)");
    body.style.backgroundColor = "#05070B";
    return () => {
      root.style.setProperty("--background", prevBg);
      root.style.setProperty("--card", prevCard);
      root.style.setProperty("--border", "");
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  if (showOnboarding) {
    return <MangoOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* GeekDashboard Command Center */}
      <GeekDashboard onMagicClick={() => setMagicOpen(true)} />

      {/* Magic Card Modal */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />

      {/* Weekly Chart — wrapped in matching dark glass card */}
      <ScrollReveal direction="up">
        <div className="rounded-2xl border border-white/5 bg-[#0D121F]/40 backdrop-blur-md p-5">
          <WeeklyOverviewChart embedded />
        </div>
      </ScrollReveal>
    </div>
  );
}
