"use client";

import Link from "next/link";
import { Trophy, BadgeCheck, Activity, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

type Props = {
  awardCount: number;
  activenessPercent: number | null;
  role?: UserRole;
  onScanAttendance?: () => void;
  onActivenessClick?: () => void;
};

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function QuickAccessGrid({
  awardCount,
  activenessPercent,
  role = "volunteer",
  onScanAttendance,
  onActivenessClick,
}: Props) {
  const isStaff = role === "admin" || role === "organiser";
  const portalHref = role === "admin" ? "/admin" : "/organiser";

  const items: Item[] = isStaff
    ? [
        {
          key: "scan",
          label: "Scan",
          icon: ScanLine,
          value: "Attendance",
          onClick: onScanAttendance,
          className:
            "bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-700/30 text-white shadow-md",
        },
        {
          key: "awards",
          label: "Awards",
          icon: Trophy,
          value: "Manage",
          href: portalHref,
        },
        {
          key: "icard",
          label: "I-Card",
          icon: BadgeCheck,
          value: "Verify",
          onClick: onScanAttendance,
          className:
            "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-700/30 text-white shadow-md",
        },
      ]
    : [
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
          value: "Open",
          href: "/i-card",
          className:
            "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-700/30 text-white shadow-md",
        },
      ];

  return (
    <div className="grid grid-cols-3 gap-2 min-w-0">
      {items.map(({ key, label, icon: Icon, value, href, onClick, className }) => {
        const isAccent = key === "icard" || key === "scan";
        const inner = (
          <>
            <Icon
              size={20}
              className={`shrink-0 ${isAccent ? "text-white" : "text-[var(--brand)]"}`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight w-full ${
                isAccent ? "text-white/90" : "text-[var(--text-muted)]"
              }`}
            >
              {label}
            </span>
            <span
              className={`text-[11px] font-bold w-full text-center leading-tight ${
                isAccent ? "text-white/80" : "text-[var(--text)]"
              }`}
            >
              {value}
            </span>
          </>
        );

        const baseClass =
          className ??
          "flex min-w-0 flex-col items-center justify-center gap-1 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm min-h-[80px] active:scale-[0.97] transition-transform overflow-hidden";

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
  );
}
