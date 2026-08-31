"use client";

import { Loader2 } from "lucide-react";

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
  if (!refreshing && pullDistance <= 8 && !ready) return null;

  const scale = refreshing
    ? 1
    : Math.min(0.5 + pullDistance / 120, 1);

  return (
    <div className="flex justify-center py-2 pointer-events-none z-30 shrink-0">
      <div
        className="transition-transform"
        style={{ transform: `scale(${scale})` }}
      >
        <Loader2
          size={22}
          className={`animate-spin text-[var(--brand)] ${
            refreshing || ready ? "opacity-100" : "opacity-60"
          }`}
        />
      </div>
    </div>
  );
}
