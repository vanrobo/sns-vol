"use client";

type PullToRefreshIndicatorProps = {
  pullDistance: number;
  refreshing: boolean;
  ready: boolean;
};

const THRESHOLD = 72;
const R = 10;
const C = 2 * Math.PI * R;
/** ~60% arc — round caps need a real gap or a full ring looks static when rotated. */
const SPIN_ARC = C * 0.58;
const SPIN_GAP = C - SPIN_ARC;

export default function PullToRefreshIndicator({
  pullDistance,
  refreshing,
  ready,
}: PullToRefreshIndicatorProps) {
  if (!refreshing && pullDistance <= 6 && !ready) return null;

  const pullProgress = ready
    ? 1
    : Math.min(pullDistance / THRESHOLD, 1);
  const pullDashOffset = C * (1 - pullProgress);

  return (
    <div
      className="flex justify-center items-center py-5 min-h-[56px] pointer-events-none z-30 shrink-0"
      aria-hidden
    >
      <div className="relative size-7">
        <svg
          className="absolute inset-0 block size-full"
          viewBox="0 0 28 28"
          aria-hidden
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
        </svg>

        {refreshing ? (
          <svg
            className="absolute inset-0 block size-full animate-spin"
            viewBox="0 0 28 28"
            aria-hidden
            style={{ transformOrigin: "center" }}
          >
            <circle
              cx={14}
              cy={14}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={`${SPIN_ARC} ${SPIN_GAP}`}
              transform="rotate(-90 14 14)"
              className="text-[var(--brand)]"
            />
          </svg>
        ) : (
          <svg
            className="absolute inset-0 block size-full"
            viewBox="0 0 28 28"
            aria-hidden
          >
            <circle
              cx={14}
              cy={14}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={pullDashOffset}
              transform="rotate(-90 14 14)"
              className="text-[var(--brand)] transition-[stroke-dashoffset] duration-75"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
