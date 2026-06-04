// ═══════════════════════════════════════════════════════════════
// Example: A new "Learning Paths" feature built in < 5 minutes.
// Every card, header, and section inherits v5 design automatically.
// This file compiles as-is — uncomment the route to activate.
// ═══════════════════════════════════════════════════════════════

"use client";

import { Route, BookOpen, Trophy, TrendingUp } from "lucide-react";
import { PageHeader, PageSection, StatCard, EmptyState } from "@/components/ui/surface";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function LearningPathsExample() {
  return (
    <div className="flex flex-col gap-6">
      {/* Auto: heading-xl typography + muted description */}
      <PageHeader
        icon={Route}
        title="Learning Paths"
        description="Structured learning journeys with milestones and progress tracking"
      />

      {/* Auto: surface-card stats in 3-col grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Active Paths" value="3" color="var(--chart-1)" />
        <StatCard icon={Trophy} label="Completed" value="7" color="var(--chart-2)" />
        <StatCard icon={TrendingUp} label="In Progress" value="2" color="var(--chart-3)" />
        <StatCard icon={Route} label="Total Hours" value="48" color="var(--chart-4)" />
      </div>

      {/* Auto: heading-lg section title + surface-card containers */}
      <PageSection title="Your Paths" description="Continue where you left off">
        <div className="grid gap-3">
          {[
            { name: "Deep Learning Foundations", progress: 68, hours: 12, badges: ["AI", "Math"] },
            { name: "Financial Modeling Mastery", progress: 42, hours: 8, badges: ["Finance", "Excel"] },
            { name: "Academic English C1", progress: 91, hours: 28, badges: ["English", "Writing"] },
          ].map(p => (
            <Card key={p.name}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.hours}h spent</CardDescription>
                </div>
                <span className="heading-lg tabular-nums">{p.progress}%</span>
              </div>
              <Progress value={p.progress} className="h-1.5 mt-1" />
              <div className="flex gap-1.5 mt-2">
                {p.badges.map(b => <Badge key={b} variant="secondary" className="text-[10px]">{b}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      </PageSection>

      {/* Auto: 3-col feature grid with surface-card */}
      <PageSection title="Popular Paths">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: BookOpen, title: "Beginner", desc: "Start from zero", color: "var(--chart-1)" },
            { icon: TrendingUp, title: "Intermediate", desc: "Build on basics", color: "var(--chart-2)" },
            { icon: Trophy, title: "Advanced", desc: "Master the craft", color: "var(--chart-3)" },
          ].map(p => {
            const Icon = p.icon;
            return (
              <Card key={p.title}>
                <span className="flex size-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in oklch, ${p.color} 12%, transparent)` }}>
                  <Icon className="size-4" style={{ color: p.color }} />
                </span>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
              </Card>
            );
          })}
        </div>
      </PageSection>

      {/* Auto: EmptyState when no data */}
      <EmptyState icon={Route} title="Create your first path"
        description="Choose a topic and we'll build a personalized learning journey."
        action={<Button size="sm"><Route className="size-4" /> Start New Path</Button>} />
    </div>
  );
}
