"use client";

import Link from "next/link";
import { Trophy, CalendarDays, ClipboardList, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  awardCount: number;
  onEventsClick?: () => void;
};

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
};

export default function QuickAccessGrid({
  awardCount,
  onEventsClick,
}: Props) {
  const items: Item[] = [
    { key: "icard", label: "I-Card", icon: BadgeCheck, href: "/i-card" },
    { key: "awards", label: "Awards", icon: Trophy, href: "/profile#awards" },
    {
      key: "applications",
      label: "Applied",
      icon: ClipboardList,
      href: "/applications",
    },
    {
      key: "events",
      label: "Events",
      icon: CalendarDays,
      onClick: onEventsClick,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(({ key, label, icon: Icon, href, onClick }) => {
        const subtitle =
          key === "awards"
            ? String(awardCount)
            : key === "icard"
              ? "View"
              : key === "applications"
                ? "View"
                : "View";

        const inner = (
          <>
            <Icon size={20} className="text-[var(--brand)]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              {label}
            </span>
            <span className="text-[11px] font-bold text-[var(--text)] truncate w-full text-center">
              {subtitle}
            </span>
          </>
        );

        const className =
          "flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm min-h-[88px] active:scale-[0.97] transition-transform";

        if (onClick) {
          return (
            <button key={key} type="button" onClick={onClick} className={className}>
              {inner}
            </button>
          );
        }

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
