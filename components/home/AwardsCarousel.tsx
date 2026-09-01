"use client";

import type { UserAward } from "@/types";
import AwardBadge from "@/components/awards/AwardBadge";

type Props = {
  awards: UserAward[];
  volunteerName?: string;
};

function showDescription(text?: string) {
  const value = text?.trim();
  if (!value) return false;
  if (/^(this is a test|example)$/i.test(value)) return false;
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
              className="snap-center shrink-0 w-[min(72vw,172px)] flex flex-col items-center"
            >
              <AwardBadge
                award={award}
                volunteerName={volunteerName}
                size={160}
                showVolunteerName={false}
                showActions
              />
              {showDescription(award.description) && (
                <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed line-clamp-2 mt-1 px-1">
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
