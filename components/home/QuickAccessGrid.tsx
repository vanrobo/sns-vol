"use client";

import Link from "next/link";
import { Trophy, ClipboardList, Activity } from "lucide-react";
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
      key: "applications",
      label: "Applied",
      icon: ClipboardList,
      value: "View",
      href: "/applications",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ key, label, icon: Icon, value, href }) => {
        const inner = (
          <>
            <Icon size={20} className="text-[var(--brand)]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              {label}
            </span>
            <span className="text-[11px] font-bold text-[var(--text)] truncate w-full text-center">
              {value}
            </span>
          </>
        );

        const className =
          "flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm min-h-[80px] active:scale-[0.97] transition-transform";

        if (href) {
          return (
            <Link key={key} href={href} className={className}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={key} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
