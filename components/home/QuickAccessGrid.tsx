"use client";

import Link from "next/link";
import { Trophy, BadgeCheck, Activity, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  awardCount: number;
  activenessPercent: number | null;
  onActivenessClick?: () => void;
};

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  value?: string;
  href?: string;
  onClick?: () => void;
  accent?: boolean;
};

export default function QuickAccessGrid({
  awardCount,
  activenessPercent,
  onActivenessClick,
}: Props) {
  const items: Item[] = [
    {
      key: "activeness",
      label: "Activeness",
      icon: Activity,
      value: activenessPercent !== null ? `${activenessPercent}%` : "—",
      onClick: onActivenessClick,
    },
    {
      key: "awards",
      label: "Awards",
      icon: Trophy,
      value: String(awardCount),
      href: "/profile#awards",
    },
    {
      key: "icard",
      label: "I-Card",
      icon: BadgeCheck,
      href: "/i-card",
      accent: true,
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <div className="grid grid-cols-3 gap-1.5 w-full min-w-0">
        {items.map(({ key, label, icon: Icon, value, href, onClick, accent }) => {
          const inner = (
            <>
              <Icon
                size={18}
                className={`shrink-0 ${accent ? "text-white" : "text-[var(--brand)]"}`}
              />
              <span
                className={`block w-full text-center text-[9px] font-bold uppercase tracking-wide leading-tight ${
                  accent ? "text-white/90" : "text-[var(--text-muted)]"
                }`}
              >
                {label}
              </span>
              {value !== undefined ? (
                <span
                  className={`block w-full text-center text-xs font-black leading-none ${
                    accent ? "text-white" : "text-[var(--text)]"
                  }`}
                >
                  {value}
                </span>
              ) : (
                <ChevronRight
                  size={14}
                  className={`shrink-0 ${accent ? "text-white/80" : "text-[var(--brand)]"}`}
                  aria-hidden
                />
              )}
            </>
          );

          const baseClass = accent
            ? "flex min-w-0 w-full flex-col items-center justify-center gap-1 px-1 py-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-700/30 text-white shadow-md min-h-[76px] active:scale-[0.97] transition-transform overflow-hidden"
            : "flex min-w-0 w-full flex-col items-center justify-center gap-1 px-1 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm min-h-[76px] active:scale-[0.97] transition-transform overflow-hidden";

          if (onClick) {
            return (
              <button key={key} type="button" onClick={onClick} className={baseClass}>
                {inner}
              </button>
            );
          }

          if (href) {
            return (
              <Link key={key} href={href} className={baseClass}>
                {inner}
              </Link>
            );
          }

          return (
            <div key={key} className={baseClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
