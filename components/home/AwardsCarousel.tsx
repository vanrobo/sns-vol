"use client";

import { useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
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
  const [index, setIndex] = useState(0);

  if (!awards.length) return null;

  const current = awards[index];
  const Icon = ICONS[current.icon ?? "award"] ?? Award;
  const color = current.color ?? "#34c759";

  const prev = () => setIndex((i) => (i === 0 ? awards.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % awards.length);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
        My Awards
      </h2>
      <div
        className="rounded-xl p-5 text-white shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #000))`,
        }}
      >
        <Icon className="absolute -right-3 -bottom-3 text-white/15" size={96} />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Icon size={22} className="opacity-90" />
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                Badge
              </p>
            </div>
            <h3 className="text-lg font-black leading-tight">{current.title}</h3>
            {current.description && (
              <p className="text-sm text-white/90 leading-relaxed">
                {current.description}
              </p>
            )}
            <p className="text-[10px] font-semibold opacity-80">
              {new Date(current.awarded_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={prev}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
              aria-label="Previous award"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
              aria-label="Next award"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1.5">
        {awards.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to award ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === index ? "bg-[var(--brand)] w-4" : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
