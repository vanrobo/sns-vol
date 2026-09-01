"use client";

import Link from "next/link";
import { Trophy, BadgeCheck, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  awardCount: number;
  activenessPercent: number | null;
};

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  href?: string;
  className?: string;
};

export default function QuickAccessGrid({ awardCount, activenessPercent }: Props) {
  const items: Item[] = [
    {
      key: "activeness",
      label: "Activeness",
      icon: Activity,
      value: activenessPercent !== null ? `${activenessPercent}%` : "—",
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
      value: "View",
      href: "/i-card",
      className:
        "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-700/30 text-white shadow-md",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ key, label, icon: Icon, value, href, className }) => {
        const isIcard = key === "icard";
        const inner = (
          <>
            <Icon
              size={20}
              className={isIcard ? "text-white" : "text-[var(--brand)]"}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${
                isIcard ? "text-white/80" : "text-[var(--text-muted)]"
              }`}
            >
              {label}
            </span>
            <span
              className={`text-[11px] font-bold truncate w-full text-center ${
                isIcard ? "text-white" : "text-[var(--text)]"
              }`}
            >
              {value}
            </span>
          </>
        );

        const baseClass =
          className ??
          "flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm min-h-[80px] active:scale-[0.97] transition-transform";

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
  );
}
