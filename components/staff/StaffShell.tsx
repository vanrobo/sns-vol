"use client";

import { LogOut, Home, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

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
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
};

export default function StaffShell({
  title,
  tabs,
  activeTab,
  onTabChange,
  onSignOut,
  children,
  onRefresh,
}: StaffShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const { pullDistance, refreshing, ready } = usePullToRefresh({
    scrollRef: mainRef,
    scrollElement: scrollEl,
    onRefresh: onRefresh ?? (async () => {}),
    disabled: !onRefresh,
  });

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="w-full mx-auto h-[100dvh] flex flex-col bg-[var(--surface-muted)] relative overflow-hidden tracking-tight max-w-md md:max-w-5xl lg:max-w-6xl">
      <header className="shrink-0 z-50 px-4 py-3 flex justify-between items-center bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
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
              {APP_NAME}
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

      <PullToRefreshIndicator
        pullDistance={pullDistance}
        refreshing={refreshing}
        ready={ready}
      />
      <main
        ref={(el) => {
          mainRef.current = el;
          setScrollEl(el);
        }}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 md:px-8 pt-4 pb-4 animate-fadeIn"
      >
        {children}
      </main>

      <nav className="shrink-0 border-t border-[var(--border)] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md px-1 pt-1.5 pb-safe z-50">
        <div className="flex justify-around">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1.5 px-0.5 transition-colors ${
                  active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
                }`}
              >
                <Icon
                  size={20}
                  className={active ? "stroke-[var(--brand)]" : "stroke-current"}
                />
                <span className="text-[9px] font-bold truncate max-w-full">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
