"use client";

import type { UserAward } from "@/types";
import AwardBadge from "@/components/awards/AwardBadge";

type Props = {
  awards: UserAward[];
  volunteerName?: string;
};

function formatAwardDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function showDescription(text?: string) {
  const value = text?.trim();
  if (!value) return false;
  if (/^this is a test/i.test(value)) return false;
  return true;
}

export default function AwardsCarousel({ awards, volunteerName }: Props) {
  if (!awards.length) return null;

  return (
    <div className="space-y-3 min-w-0 w-full overflow-hidden">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] px-0.5">
        My Awards
      </h2>
      <div className="-mx-5 px-5">
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 scroll-px-5">
          {awards.map((award) => (
            <article
              key={award.id}
              className="snap-center shrink-0 w-[min(76vw,210px)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm flex flex-col items-center"
            >
              <div className="w-full flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-tight line-clamp-2">
                    {award.title}
                  </p>
                  <p className="text-[10px] font-semibold text-[var(--brand)] mt-0.5">
                    {formatAwardDate(award.awarded_at)}
                  </p>
                </div>
              </div>

              <AwardBadge
                award={award}
                volunteerName={volunteerName}
                variant="compact"
                size={118}
                showActions
                iconOnlyActions
              />

              {showDescription(award.description) && (
                <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed line-clamp-2 mt-2 w-full border-t border-[var(--border)] pt-2">
                  {award.description}
                </p>
              )}
            </article>
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
