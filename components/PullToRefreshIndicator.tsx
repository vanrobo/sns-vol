"use client";

import { ArrowDown, Loader2 } from "lucide-react";

type PullToRefreshIndicatorProps = {
  pullDistance: number;
  refreshing: boolean;
  ready: boolean;
};

export default function PullToRefreshIndicator({
  pullDistance,
  refreshing,
  ready,
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 4 && !refreshing) return null;

  return (
    <div
      className="flex justify-center pointer-events-none z-30 -mb-2"
      style={{ height: Math.max(pullDistance, refreshing ? 48 : 0) }}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm text-xs font-bold text-[var(--text-muted)] transition-colors ${
          ready || refreshing ? "text-[var(--brand)]" : ""
        }`}
      >
        {refreshing ? (
          <Loader2 size={14} className="animate-spin text-[var(--brand)]" />
        ) : (
          <ArrowDown
            size={14}
            className={`transition-transform duration-150 ${ready ? "rotate-180 text-[var(--brand)]" : ""}`}
          />
        )}
        {refreshing
          ? "Refreshing…"
          : ready
            ? "Release to refresh"
            : "Pull to refresh"}
      </div>
    </div>
  );
}
