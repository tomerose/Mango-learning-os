"use client";

import * as React from "react";
import { PUBLIC_VERSION, UPDATE_RHYTHM, UPDATE_DESCRIPTION } from "@/lib/roadmap/public-version";

export function VersionBadge() {
  return (
    <div className="rounded-2xl border border-border bg-bg-subtle/50 px-4 py-3 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-fg">{PUBLIC_VERSION}</span>
        <span className="text-[10px] text-fg-muted/90 bg-bg-muted rounded-full px-2 py-0.5">
          {UPDATE_RHYTHM}
        </span>
      </div>
      <p className="text-[11px] text-fg-muted/90 leading-relaxed">
        {UPDATE_DESCRIPTION}
      </p>
    </div>
  );
}
