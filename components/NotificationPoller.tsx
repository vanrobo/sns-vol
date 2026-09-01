"use client";

import { useEffect } from "react";
import { showNotificationAlertToast, previewNotificationBody } from "@/components/NotificationAlertToast";
import {
  hasUnreadNotifications,
  getLatestUnreadNotification,
} from "@/lib/data/notifications";
import { getNotificationHref } from "@/lib/notifications-nav";
import { showBrowserNotification } from "@/lib/push/browser-notifications";
import {
  loadShownNotificationIds,
  markNotificationShown,
} from "@/lib/notification-alerts";
import { setNotificationPollHasUnread } from "@/lib/notification-poll-store";
import { getCurrentUser } from "@/lib/data/profiles";
import type { Notification } from "@/types";

const POLL_MS = 30_000;

function alertForNotification(notif: Notification, shown: Set<string>) {
  if (shown.has(notif.id)) return;

  markNotificationShown(notif.id, shown);
  showNotificationAlertToast(notif);
  showBrowserNotification(
    notif.title,
    previewNotificationBody(notif.body, 200),
    getNotificationHref(notif.type),
    notif.id,
  );
}

/** One poller app-wide — avoids duplicate toasts when MobileLayout remounts per page. */
export default function NotificationPoller() {
  useEffect(() => {
    const shown = loadShownNotificationIds();

    const poll = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setNotificationPollHasUnread(false);
          return;
        }

        const unread = await hasUnreadNotifications();
        setNotificationPollHasUnread(unread);

        if (!unread) return;

        const latest = await getLatestUnreadNotification();
        if (latest) alertForNotification(latest, shown);
      } catch {
        /* ignore */
      }
    };

    void poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
