// components/MobileLayout.tsx
"use client";
import { Home, User, BadgeCheck, AlertCircle, Bell, Heart, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, getMyRole } from "@/lib/data/profiles";
import { APP_NAME_ACCENT, DONATE_URL } from "@/lib/brand";
import type { UserRole } from "@/types";
import { useNotificationUnread } from "@/hooks/useNotificationUnread";
import { clearNotificationUnread } from "@/lib/notification-poll-store";
import { useUnsavedChangesOptional } from "@/components/UnsavedChangesProvider";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

export default function MobileLayout({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const unsaved = useUnsavedChangesOptional();
  const hasUnread = useNotificationUnread();
  const [staffRole, setStaffRole] = useState<UserRole | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const { pullDistance, refreshing, ready } = usePullToRefresh({
    scrollRef: mainRef,
    scrollElement: scrollEl,
    onRefresh: onRefresh ?? (async () => {}),
    disabled: !onRefresh,
  });

  const guard = (e: React.MouseEvent, href: string) => {
    unsaved?.guardNavigation(e, href);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const session = await getMyRole();
        if (session && (session.role === "admin" || session.role === "organiser")) {
          setStaffRole(session.role);
        }
      } catch {
        /* ignore */
      }
    };

    checkAuth();
  }, [router]);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "I-Card", path: "/i-card", icon: BadgeCheck },
    { name: "Grievance", path: "/grievance", icon: AlertCircle },
  ];

  return (
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col bg-[var(--surface-muted)] relative overflow-hidden tracking-tight selection:bg-[var(--brand)] selection:text-white transition-colors duration-200">
      <header className="shrink-0 z-50 px-5 py-4 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[var(--border)]">
        <Link
          href="/"
          onClick={(e) => guard(e, "/")}
          className="min-w-0"
        >
          <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
            SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {staffRole && (
            <Link
              href={staffRole === "admin" ? "/admin" : "/organiser"}
              onClick={(e) =>
                guard(e, staffRole === "admin" ? "/admin" : "/organiser")
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
            >
              <LayoutDashboard size={12} />{" "}
              {staffRole === "admin" ? "Dashboard" : "Event organize"}
            </Link>
          )}
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(DONATE_URL, "_blank", "noopener,noreferrer");
            }}
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md shadow-rose-500/20 transition-all"
          >
            <Heart size={12} className="fill-white" /> Donate
          </a>

          <Link
            href="/notifications"
            onClick={(e) => guard(e, "/notifications")}
            className="relative p-1 text-[var(--text-muted)] hover:text-black dark:hover:text-white transition-colors ml-1"
          >
            <Bell size={22} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--brand)] rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
            )}
          </Link>
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
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain animate-fadeIn pb-20"
      >
        {children}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-t border-[var(--border)] flex justify-around px-1 py-3 z-50 pb-safe shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={(e) => guard(e, item.path)}
              className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 transition-all ${isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              <Icon
                size={22}
                className={
                  isActive
                    ? "fill-[var(--brand)]/10 stroke-[var(--brand)]"
                    : "stroke-current"
                }
              />
              <span className="text-[10px] font-bold tracking-wide truncate max-w-full">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
