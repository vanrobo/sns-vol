"use client";

type PullToRefreshIndicatorProps = {
  pullDistance: number;
  refreshing: boolean;
  ready: boolean;
};

const THRESHOLD = 72;
const R = 10;
const C = 2 * Math.PI * R;

export default function PullToRefreshIndicator({
  pullDistance,
  refreshing,
  ready,
}: PullToRefreshIndicatorProps) {
  if (!refreshing && pullDistance <= 6 && !ready) return null;

  const progress = refreshing
    ? 1
    : ready
      ? 1
      : Math.min(pullDistance / THRESHOLD, 1);
  const dashOffset = C * (1 - progress);

  return (
    <div
      className="flex justify-center items-center py-5 min-h-[56px] pointer-events-none z-30 shrink-0"
      aria-hidden
    >
      <svg
        width={28}
        height={28}
        viewBox="0 0 28 28"
        className={refreshing ? "animate-spin" : ""}
        style={{ transformOrigin: "center" }}
      >
        <circle
          cx={14}
          cy={14}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-[var(--border)]"
        />
        <circle
          cx={14}
          cy={14}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          className="text-[var(--brand)] transition-[stroke-dashoffset] duration-75"
          transform="rotate(-90 14 14)"
        />
      </svg>
    </div>
  );
}
