const PUSH_PREF_KEY = "sns-push-enabled-v1";

export function isPushEnabledLocally(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PUSH_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPushEnabledLocally(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PUSH_PREF_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function canUseBrowserNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestBrowserNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string, href?: string) {
  if (!canUseBrowserNotifications()) return;
  if (Notification.permission !== "granted") return;
  if (!isPushEnabledLocally()) return;

  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: `sns-${title.slice(0, 32)}`,
    });
    n.onclick = () => {
      window.focus();
      if (href) window.location.href = href;
      n.close();
    };
  } catch {
    /* ignore — iOS / restricted contexts */
  }
}
