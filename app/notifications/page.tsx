// app/notifications/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  CalendarCheck,
  Loader2,
  BadgeCheck,
  Award,
} from "lucide-react";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/data/notifications";
import type { Notification } from "@/types";
import { NotificationSkeleton } from "@/components/ui/Skeleton";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        await markNotificationsRead();
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

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

  return (
    <MobileLayout>
      <div className="p-5 space-y-6 pb-24">
        <div className="bg-black dark:bg-[#121212] rounded-xl p-6 text-white relative overflow-hidden border border-[var(--border)] shadow-sm">
          <Bell
            className="absolute -right-4 -bottom-4 text-white/5"
            size={120}
          />
          <div className="relative z-10">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">
              Alert Hub
            </h2>
            <p className="text-[#98989D] text-[13px] leading-relaxed">
              Stay updated on skill matches, application status, and grievance
              ticket solutions.
            </p>
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
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl flex gap-4 transition-all border ${!isRead ? "bg-[var(--surface)] border-[var(--border)] shadow-sm" : "bg-transparent border-transparent opacity-70"}`}
                >
                  <div className="w-10 h-10 shrink-0 rounded-full border border-[var(--border)] bg-gray-50 dark:bg-[#18181B] flex items-center justify-center">
                    {getIconData(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{notif.title}</h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--brand)] mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {formatTime(notif.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
