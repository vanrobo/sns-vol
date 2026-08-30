"use client";

import { LogOut, Home, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export type StaffTab = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type StaffShellProps = {
  title: string;
  tabs: StaffTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  stats?: React.ReactNode;
  children: React.ReactNode;
};

export default function StaffShell({
  title,
  tabs,
  activeTab,
  onTabChange,
  onSignOut,
  stats,
  children,
}: StaffShellProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] relative pb-24 tracking-tight overflow-x-hidden">
      <header className="sticky top-0 z-50 px-4 py-3 flex justify-between items-center bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="p-1.5 -ml-1 text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Back to app"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider">
              SNS Vol
            </p>
            <h1 className="text-base font-black truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--brand)]"
            title="Volunteer home"
          >
            <Home size={20} />
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="p-2 text-[var(--text-muted)] hover:text-red-500"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="border-b border-[var(--border)] bg-[var(--surface)] max-w-full overflow-x-auto overflow-y-hidden scrollbar-none overscroll-x-contain touch-pan-x">
        <div className="flex flex-nowrap gap-2 px-4 py-3 w-max min-w-full">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                activeTab === key
                  ? "bg-[var(--brand)] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-[#18181B] text-[var(--text-muted)]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-5 animate-fadeIn">
        {stats}
        {children}
      </main>
    </div>
  );
}
