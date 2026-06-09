"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { getClientPlan, setClientPlan } from "@/lib/auth/session";
import { getPlanInfo, PLAN_FEATURES } from "@/lib/plan/types";
import type { PlanTier } from "@/lib/plan/types";
import { ProfileHeader } from "./profile-header";
import { PlanCard } from "./plan-card";
import { QuotaDisplay } from "./quota-display";
import { MangoCodeRedeem } from "./mango-code-redeem";
import { LearningAssets } from "./learning-assets";
import { PrivacySection } from "./privacy-section";
import { WeeklyUpdateSection } from "./weekly-update-section";
import { BillingSection } from "./billing-section";
import { MobileShell, ProfileIdentityCard, LearningStatCard } from "@/components/mobile/premium-mobile";
import { PlanCompare } from "@/components/plan/plan-compare";
import { ThemePicker } from "@/components/profile/theme-picker";
import { CareerPrep } from "@/components/profile/career-prep";
import { Flame, Zap, Target, CheckCircle2, User } from "lucide-react";

type Tab = "overview" | "billing" | "privacy" | "career";

export function ProfileContent() {
  const { stats, tasks, mode, notes } = useStore();

  // Initialize plan from localStorage immediately (not "guest" as hard default)
  const [plan, setPlan] = React.useState<PlanTier>(() => getClientPlan());
  const [planExpiresAt, setPlanExpiresAt] = React.useState<string | null>(() => {
    try { return localStorage.getItem("mango-plan-expires"); } catch { return null; }
  });
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");
  const [quota, setQuota] = React.useState({ agentTasks: { current: 0, max: 0 }, studyPacks: { current: 0, max: 0 } });

  // Fetch latest from API to refine plan (e.g. admin/pro detection)
  React.useEffect(() => {
    // If store mode is cloud, we're definitely authenticated (minimum "standard")
    if (mode === "cloud" && plan === "guest") {
      setPlan("standard");
      setClientPlan("standard");
    }

    fetch("/api/auth/plan")
      .then(r => r.json())
      .then(data => {
        if (data.plan) {
          setPlan(data.plan.tier);
          setClientPlan(data.plan.tier, data.plan.expiresAt);
          if (data.plan.expiresAt) setPlanExpiresAt(data.plan.expiresAt);
          if (data.quota) setQuota(data.quota);
        }
      })
      .catch(() => {});
  }, []);

  // Refresh plan after redemption
  const handlePlanUpgrade = (newPlan: PlanTier, expiresAt?: string) => {
    setPlan(newPlan);
    if (expiresAt) setPlanExpiresAt(expiresAt);
    setClientPlan(newPlan, expiresAt);
  };

  const planInfo = getPlanInfo(plan, planExpiresAt ?? undefined);
  const features = PLAN_FEATURES[plan];
  const totalTasksDone = tasks.filter(t => t.done).length;
  const totalNotes = notes.length;
  const xpInLevel = stats.totalXp - stats.xpForCurrentLevel;
  const xpNeeded = stats.xpToNextLevel - stats.xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100;

  // Learning asset counts
  const assetCounts = React.useMemo(() => {
    try {
      const packs = JSON.parse(localStorage.getItem("mango-study-packs-meta") ?? "[]");
      const agentTasks = JSON.parse(localStorage.getItem("mango-agent-tasks-v1") ?? "[]");
      const mistakes = JSON.parse(localStorage.getItem("mango-mistakes-v1") ?? "[]");
      return {
        studyPacks: Array.isArray(packs) ? packs.length : 0,
        agentTasks: Array.isArray(agentTasks) ? agentTasks.length : 0,
        notes: totalNotes,
        mistakes: Array.isArray(mistakes) ? mistakes.length : 0,
        flashcards: 0,
        reviews: 0,
      };
    } catch { return { studyPacks: 0, agentTasks: 0, notes: totalNotes, mistakes: 0, flashcards: 0, reviews: 0 }; }
  }, [totalNotes]);

  return (
    <>
      {/* ──────────── Mobile: Cinematic UI ──────────── */}
      <div className="md:hidden">
        <MobileShell stage="dark">
          <ProfileIdentityCard
            avatar={
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-primary ring-2 ring-white/20">
                <User className="size-6 text-white" />
              </div>
            }
            title="Mango 学习者"
            subtitle={planInfo.name}
            level={`Lv.${stats.level}`}
            progress={xpProgress}
          />

          {/* Stat Grid — 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            <LearningStatCard
              icon={Flame}
              label="连续学习"
              value={`${stats.streakDays}天`}
              sub="保持下去"
            />
            <LearningStatCard
              icon={Zap}
              label="总经验"
              value={stats.totalXp.toLocaleString()}
              sub={`Lv.${stats.level}`}
            />
            <LearningStatCard
              icon={Target}
              label="今日专注"
              value={`${stats.minutesToday}分钟`}
              sub={`目标${stats.minutesGoal}分钟`}
            />
            <LearningStatCard
              icon={CheckCircle2}
              label="完成任务"
              value={`${stats.tasksDoneToday}/${stats.tasksTotalToday}`}
              sub="今日进度"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/6 rounded-2xl backdrop-blur-xl">
            {[
              { id: "overview" as Tab, label: "概览", icon: "📊" },
              { id: "billing" as Tab, label: "计划", icon: "💎" },
              { id: "privacy" as Tab, label: "隐私", icon: "🔒" },
              { id: "career" as Tab, label: "求职", icon: "💼" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="mango-glass-card p-4">
                <PlanCard
                  plan={plan}
                  planInfo={planInfo}
                  features={features}
                  expiresAt={planExpiresAt}
                />
              </div>
              <div className="mango-glass-card p-4">
                <QuotaDisplay
                  plan={plan}
                  agentTasks={quota.agentTasks}
                  studyPacks={quota.studyPacks}
                />
              </div>
              <div className="mango-glass-card p-4">
                <MangoCodeRedeem onUpgrade={handlePlanUpgrade} currentPlan={plan} />
              </div>
              <div className="mango-glass-card p-4">
                <LearningAssets counts={assetCounts} />
              </div>
              <div className="mango-glass-card p-4">
                <WeeklyUpdateSection />
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="mango-paper-card p-4">
                <BillingSection
                  currentPlan={plan}
                  planExpiresAt={planExpiresAt}
                  onUpgrade={handlePlanUpgrade}
                />
              </div>
              <div className="mango-glass-card p-4">
                <p className="text-sm font-semibold text-white mb-4">Standard vs Pro 完整对比</p>
                <PlanCompare />
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="mango-paper-card p-4">
              <PrivacySection />
            </div>
          )}

          {activeTab === "career" && (
            <CareerPrep />
          )}

          <ThemePicker />
        </MobileShell>
      </div>

      {/* ──────────── Desktop: Original Layout (unchanged) ──────────── */}
      <div className="hidden md:flex flex-col gap-5">
        {/* Header */}
        <ProfileHeader
          plan={plan}
          planName={planInfo.name}
          planBadge={planInfo.badge}
          mode={mode}
          totalXp={stats.totalXp}
          level={stats.level}
          streakDays={stats.streakDays}
        />

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-muted rounded-xl">
          {[
            { id: "overview" as Tab, label: "概览", icon: "📊" },
            { id: "billing" as Tab, label: "计划", icon: "💎" },
            { id: "privacy" as Tab, label: "隐私", icon: "🔒" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-surface shadow-sm text-fg"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <span className="hidden sm:inline mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            {/* Plan Card */}
            <PlanCard
              plan={plan}
              planInfo={planInfo}
              features={features}
              expiresAt={planExpiresAt}
            />

            {/* Quota Display */}
            <QuotaDisplay
              plan={plan}
              agentTasks={quota.agentTasks}
              studyPacks={quota.studyPacks}
            />

            {/* Mango Code Redemption */}
            <MangoCodeRedeem onUpgrade={handlePlanUpgrade} currentPlan={plan} />

            {/* Learning Assets */}
            <LearningAssets counts={assetCounts} />

            {/* Weekly Update */}
            <WeeklyUpdateSection />
          </div>
        )}

        {activeTab === "billing" && (
          <BillingSection
            currentPlan={plan}
            planExpiresAt={planExpiresAt}
            onUpgrade={handlePlanUpgrade}
          />
        )}

        {activeTab === "privacy" && <PrivacySection />}
        {activeTab === "career" && <CareerPrep />}

        <ThemePicker />
      </div>
    </>
  );
}
