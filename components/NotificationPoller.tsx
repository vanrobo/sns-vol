"use client";

import { useEffect } from "react";
import { showNotificationAlertToast, previewNotificationBody } from "@/components/NotificationAlertToast";
import { pollNotificationState } from "@/lib/data/notifications";
import { getNotificationOpenTarget } from "@/lib/notifications-nav";
import { showBrowserNotification } from "@/lib/push/browser-notifications";
import {
  loadShownNotificationIds,
  markNotificationShown,
} from "@/lib/notification-alerts";
import { setNotificationPollHasUnread } from "@/lib/notification-poll-store";
import type { Notification } from "@/types";

/** Was 30s × 2–3 server actions per tab — burned Vercel invocations while testing. */
const POLL_MS = 5 * 60_000;

function hasLikelySessionCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => {
    const name = part.trim().split("=")[0] ?? "";
    return name.startsWith("sb-") && name.includes("auth");
  });
}

function alertForNotification(notif: Notification, shown: Set<string>) {
  if (shown.has(notif.id)) return;

  markNotificationShown(notif.id, shown);
  showNotificationAlertToast(notif);
  showBrowserNotification(
    notif.title,
    previewNotificationBody(notif.body, 200),
    getNotificationOpenTarget(notif).href,
    notif.id,
  );
}

/** One poller app-wide — avoids duplicate toasts when MobileLayout remounts per page. */
export default function NotificationPoller() {
  useEffect(() => {
    const shown = loadShownNotificationIds();
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      if (!hasLikelySessionCookie()) {
        setNotificationPollHasUnread(false);
        return;
      }

      try {
        const { hasUnread, latest } = await pollNotificationState();
        if (cancelled) return;
        setNotificationPollHasUnread(hasUnread);
        if (latest) alertForNotification(latest, shown);
      } catch {
        /* ignore */
      }
    };

    const startInterval = () => {
      if (interval) return;
      interval = setInterval(() => {
        void poll();
      }, POLL_MS);
    };

    const stopInterval = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void poll();
        startInterval();
      } else {
        stopInterval();
      }
    };

    if (document.visibilityState === "visible") {
      void poll();
      startInterval();
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      stopInterval();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
