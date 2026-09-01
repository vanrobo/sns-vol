"use client";

import {
  Award,
  Star,
  Trophy,
  Medal,
  Heart,
} from "lucide-react";
import type { UserAward } from "@/types";

const ICONS: Record<string, typeof Award> = {
  award: Award,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  heart: Heart,
};

type Props = {
  awards: UserAward[];
};

export default function AwardsCarousel({ awards }: Props) {
  if (!awards.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
        My Awards
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory">
        {awards.map((award) => {
          const Icon = ICONS[award.icon ?? "award"] ?? Award;
          const color = award.color ?? "#34c759";
          return (
            <div
              key={award.id}
              className="min-w-[85%] snap-center rounded-xl p-5 text-white shadow-lg relative overflow-hidden shrink-0"
              style={{
                background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #000))`,
              }}
            >
              <Icon className="absolute -right-3 -bottom-3 text-white/15" size={96} />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon size={22} className="opacity-90" />
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                    Badge
                  </p>
                </div>
                <h3 className="text-lg font-black leading-tight line-clamp-2 break-words">
                  {award.title}
                </h3>
                {award.description && (
                  <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                    {award.description}
                  </p>
                )}
                <p className="text-[10px] font-semibold opacity-80">
                  {new Date(award.awarded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
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
