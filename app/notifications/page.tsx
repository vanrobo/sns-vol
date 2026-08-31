"use client";
import MobileLayout from "@/components/MobileLayout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  CalendarCheck,
  Loader2,
  BadgeCheck,
  Award,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/data/notifications";
import { getMyRole } from "@/lib/data/profiles";
import type { Notification } from "@/types";
import { NotificationSkeleton } from "@/components/ui/Skeleton";
import { getNotificationHref } from "@/lib/notifications-nav";
import {
  readNotificationsCache,
  writeNotificationsCache,
} from "@/lib/notifications-cache";
import { haptic } from "@/lib/haptics";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadNotifications = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    try {
      const me = await getMyRole();
      const data = await getNotifications();
      setNotifications(data);
      if (me) writeNotificationsCache(me.id, data);
      await markNotificationsRead();
    } catch {
      /* keep cached list visible */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const me = await getMyRole();
      const cached = me ? readNotificationsCache(me.id) : null;
      if (cached?.length) {
        setNotifications(cached);
        setLoading(false);
      }

      if (cancelled) return;
      await loadNotifications({ silent: !!cached?.length });
    })();

    return () => {
      cancelled = true;
    };
  }, [loadNotifications]);

  const refreshNotifications = useCallback(async () => {
    haptic("light");
    await loadNotifications({ silent: true });
    haptic("success");
  }, [loadNotifications]);

  const getIconData = (type: string) => {
    switch (type) {
      case "application":
        return <CheckCircle size={18} className="text-[var(--brand)]" />;
      case "grievance":
        return <AlertTriangle size={18} className="text-amber-500" />;
      case "icard":
        return <BadgeCheck size={18} className="text-emerald-600" />;
      case "award":
        return <Award size={18} className="text-amber-500" />;
      case "event":
      default:
        return <CalendarCheck size={18} className="text-blue-500" />;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleDateString();
  };

  const toggleNotification = (notif: Notification) => {
    haptic("selection");
    setExpandedId((prev) => (prev === notif.id ? null : notif.id));
  };

  const openNotification = (notif: Notification) => {
    haptic("light");
    router.push(getNotificationHref(notif.type));
  };

  return (
    <MobileLayout onRefresh={refreshNotifications}>
      <div className="p-5 space-y-6 pb-24">
        <div className="bg-black dark:bg-[#121212] rounded-xl p-6 text-white relative overflow-hidden border border-[var(--border)] shadow-sm">
          <Bell
            className="absolute -right-4 -bottom-4 text-white/5"
            size={120}
          />
          <div className="relative z-10 flex justify-between items-start gap-3">
            <div>
              <h2 className="text-[22px] font-bold tracking-tight mb-2">
                In-app alerts
              </h2>
              <p className="text-[#98989D] text-[13px] leading-relaxed">
                Tap an alert to expand. Use Open to go to the related screen.
              </p>
            </div>
            {refreshing && (
              <Loader2 className="animate-spin text-white/60 shrink-0" size={18} />
            )}
          </div>
        </div>

        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-xl p-10 text-center flex flex-col items-center gap-3">
            <Bell size={32} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 font-medium">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isRead = !!notif.read_at;
              const isExpanded = expandedId === notif.id;
              return (
                <div
                  key={notif.id}
                  className={`rounded-xl border transition-all ${!isRead ? "bg-[var(--surface)] border-[var(--border)] shadow-sm" : "bg-transparent border-transparent opacity-80"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleNotification(notif)}
                    className="w-full text-left p-4 flex gap-4 active:scale-[0.99] transition-transform"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-full border border-[var(--border)] bg-gray-50 dark:bg-[#18181B] flex items-center justify-center">
                      {getIconData(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className="font-semibold text-sm">{notif.title}</h4>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--brand)] mt-1.5 shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2 ${
                          isExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {notif.body}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 shrink-0 self-center transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0">
                      <button
                        type="button"
                        onClick={() => openNotification(notif)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--brand)] text-white text-xs font-bold"
                      >
                        <ExternalLink size={14} />
                        Open related screen
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
