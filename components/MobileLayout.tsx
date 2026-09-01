// components/MobileLayout.tsx
"use client";
import { Home, User, AlertCircle, Bell, Heart, Settings, Clock, ClipboardList, LayoutDashboard, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { getCurrentUser, getMyRole } from "@/lib/data/profiles";
import { APP_NAME_ACCENT, DONATE_URL } from "@/lib/brand";
import type { ProfileStatus, UserRole } from "@/types";
import { useNotificationUnread } from "@/hooks/useNotificationUnread";
import { clearNotificationUnread } from "@/lib/notification-poll-store";
import { useUnsavedChangesOptional } from "@/components/UnsavedChangesProvider";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import {
  readCachedRole,
  readCachedVolunteerStatus,
  writeCachedSession,
  clearCachedSession,
} from "@/lib/role-cache";

function useCachedStaffRole(): UserRole | null {
  return useSyncExternalStore(
    () => () => {},
    readCachedRole,
    () => null,
  );
}

function useCachedVolunteerStatus(): ProfileStatus | null {
  return useSyncExternalStore(
    () => () => {},
    readCachedVolunteerStatus,
    () => null,
  );
}

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
  const cachedRole = useCachedStaffRole();
  const cachedStatus = useCachedVolunteerStatus();
  const [volunteerStatus, setVolunteerStatus] = useState<ProfileStatus | null>(
    cachedStatus,
  );
  const [staffRole, setStaffRole] = useState<UserRole | null>(cachedRole);
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
        clearCachedSession();
        router.push("/login");
        return;
      }

      try {
        const session = await getMyRole();
        if (!session) return;

        writeCachedSession(session.role, session.status);

        if (session.role === "volunteer") {
          setVolunteerStatus(session.status);
          setStaffRole(null);
        } else if (session.role === "admin" || session.role === "organiser") {
          setStaffRole(session.role);
          setVolunteerStatus(null);
        }
      } catch {
        /* keep cached nav until next successful fetch */
      }
    };

    checkAuth();
  }, [router]);

  const isPendingVolunteer = volunteerStatus === "pending";

  const navItems = isPendingVolunteer
    ? [
        { name: "Status", path: "/pending", icon: Clock },
        { name: "Profile", path: "/profile", icon: User },
        { name: "Applied", path: "/applications", icon: ClipboardList },
        { name: "Settings", path: "/settings", icon: Settings },
      ]
    : staffRole === "admin"
      ? [
          { name: "Home", path: "/", icon: Home },
          { name: "Profile", path: "/profile", icon: User },
          { name: "Admin", path: "/admin", icon: Shield },
          { name: "Settings", path: "/settings", icon: Settings },
        ]
      : staffRole === "organiser"
        ? [
            { name: "Home", path: "/", icon: Home },
            { name: "Profile", path: "/profile", icon: User },
            { name: "Organiser", path: "/organiser", icon: LayoutDashboard },
            { name: "Settings", path: "/settings", icon: Settings },
          ]
        : [
            { name: "Home", path: "/", icon: Home },
            { name: "Profile", path: "/profile", icon: User },
            { name: "Grievance", path: "/grievance", icon: AlertCircle },
            { name: "Settings", path: "/settings", icon: Settings },
          ];

  const brandHref = isPendingVolunteer ? "/pending" : "/";

  return (
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col bg-[var(--surface-muted)] relative overflow-hidden tracking-tight selection:bg-[var(--brand)] selection:text-white transition-colors duration-200">
      <header className="shrink-0 z-50 px-5 py-4 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[var(--border)]">
        <Link
          href={brandHref}
          onClick={(e) => guard(e, brandHref)}
          className="min-w-0"
        >
          <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
            SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
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
            className={`relative p-1 transition-colors ${
              hasUnread
                ? "text-amber-400 hover:text-amber-300"
                : "text-[var(--text-muted)] hover:text-black dark:hover:text-white"
            }`}
          >
            <Bell
              size={22}
              className={
                hasUnread
                  ? "animate-bell-ring text-amber-400 fill-amber-400/15 stroke-amber-400"
                  : undefined
              }
            />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
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
              <span className="text-[10px] font-bold tracking-wide truncate max-w-full px-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
