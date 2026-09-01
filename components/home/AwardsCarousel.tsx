"use client";

import type { UserAward } from "@/types";
import AwardBadge from "@/components/awards/AwardBadge";

type Props = {
  awards: UserAward[];
  volunteerName?: string;
};

export default function AwardsCarousel({ awards, volunteerName }: Props) {
  if (!awards.length) return null;

  return (
    <div className="space-y-3 min-w-0 w-full overflow-hidden">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] px-0.5">
        My Awards
      </h2>
      <div className="-mx-5 px-5">
        <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 scroll-px-5">
          {awards.map((award) => (
            <div
              key={award.id}
              className="snap-center shrink-0 w-[min(100%,280px)] flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
            >
              <AwardBadge
                award={award}
                volunteerName={volunteerName}
                size={220}
                showActions
              />
              {award.description && (
                <p className="text-xs text-[var(--text-muted)] text-center mt-3 leading-relaxed line-clamp-2">
                  {award.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {awards.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {awards.map((a) => (
            <span
              key={a.id}
              className="w-2 h-2 rounded-full bg-[var(--brand)]/40"
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}
