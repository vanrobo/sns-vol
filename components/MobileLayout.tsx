// components/MobileLayout.tsx
"use client";
import { Home, User, BadgeCheck, AlertCircle, Bell, Heart, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { hasUnreadNotifications, getLatestUnreadNotification } from "@/lib/data/notifications";
import { getCurrentUser, getMyRole } from "@/lib/data/profiles";
import { APP_NAME, APP_NAME_ACCENT } from "@/lib/brand";
import type { UserRole } from "@/types";
import { getNotificationHref } from "@/lib/notifications-nav";
import { showBrowserNotification } from "@/lib/push/browser-notifications";
import toast from "react-hot-toast";
import {
  UnsavedChangesProvider,
  useUnsavedChangesOptional,
} from "@/components/UnsavedChangesProvider";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

function MobileLayoutInner({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const unsaved = useUnsavedChangesOptional();
  const [hasUnread, setHasUnread] = useState(false);
  const [staffRole, setStaffRole] = useState<UserRole | null>(null);
  const seenNotifIds = useRef<Set<string>>(new Set());
  const mainRef = useRef<HTMLElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const { pullDistance, refreshing, ready } = usePullToRefresh({
    scrollRef: mainRef,
    scrollElement: scrollEl,
    onRefresh: onRefresh ?? (async () => {}),
    disabled: !onRefresh,
  });

  const pollNotifications = async () => {
    try {
      const unread = await hasUnreadNotifications();
      if (unread) {
        const latest = await getLatestUnreadNotification();
        if (latest && !seenNotifIds.current.has(latest.id)) {
          seenNotifIds.current.add(latest.id);
          toast.success(`${latest.title}\n${latest.body}`, {
            duration: 6000,
            style: { whiteSpace: "pre-line" },
          });
          showBrowserNotification(
            latest.title,
            latest.body,
            getNotificationHref(latest.type),
          );
        }
      }
      setHasUnread(unread);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await pollNotifications();

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
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Profile", path: "/profile", icon: User },
    { name: "I-Card", path: "/i-card", icon: BadgeCheck },
    { name: "Grievance", path: "/grievance", icon: AlertCircle },
  ];

  const tryNavigate = (e: React.MouseEvent, path: string) => {
    if (path === pathname) return;
    if (unsaved?.hasUnsaved && pathname === "/profile") {
      e.preventDefault();
      unsaved.triggerShake();
      if (
        window.confirm(
          "You have unsaved changes on your profile. Leave without saving?",
        )
      ) {
        unsaved.setHasUnsaved(false);
        router.push(path);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col bg-[var(--surface-muted)] relative overflow-hidden tracking-tight selection:bg-[var(--brand)] selection:text-white transition-colors duration-200">
      <header className="shrink-0 z-50 px-5 py-4 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[var(--border)]">
        <Link href="/" className="min-w-0">
          <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
            SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {staffRole && (
            <Link
              href={staffRole === "admin" ? "/admin" : "/organiser"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
            >
              <LayoutDashboard size={12} /> Dashboard
            </Link>
          )}
          <a
            href="https://rzp.io/l/snsdonate"
            target="_blank"
            rel="noreferrer"
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md shadow-rose-500/20 transition-all"
          >
            <Heart size={12} className="fill-white" /> Donate
          </a>

          <Link
            href="/notifications"
            onClick={() => setHasUnread(false)}
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

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-t border-[var(--border)] flex justify-around p-4 z-50 pb-safe shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={(e) => tryNavigate(e, item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              <Icon
                size={22}
                className={
                  isActive
                    ? "fill-[var(--brand)]/10 stroke-[var(--brand)]"
                    : "stroke-current"
                }
              />
              <span className="text-[10px] font-bold tracking-wider mt-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function MobileLayout({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}) {
  return (
    <UnsavedChangesProvider>
      <MobileLayoutInner onRefresh={onRefresh}>{children}</MobileLayoutInner>
    </UnsavedChangesProvider>
  );
}
