import type { Notification } from "@/types";

const CACHE_KEY = "sns-notifications-v1";

type NotificationsCache = {
  userId: string;
  items: Notification[];
  ts: number;
};

export function readNotificationsCache(userId?: string): Notification[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NotificationsCache;
    if (userId && parsed.userId !== userId) return null;
    if (Date.now() - parsed.ts > 1000 * 60 * 15) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

export function writeNotificationsCache(userId: string, items: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ userId, items, ts: Date.now() } satisfies NotificationsCache),
    );
  } catch {
    /* ignore */
  }
}

export function clearNotificationsCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
