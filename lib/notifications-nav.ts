import type { Notification, NotificationType } from "@/types";

const OPEN_LINK_PREFIX = "\n\nOpen:";

/** Link appended by admin broadcast (optional). */
export function extractNotificationLink(body: string): string | null {
  const idx = body.lastIndexOf(OPEN_LINK_PREFIX);
  if (idx === -1) return null;
  const url = body.slice(idx + OPEN_LINK_PREFIX.length).trim();
  return /^https?:\/\//i.test(url) ? url : null;
}

export function getNotificationHref(type: NotificationType): string {
  switch (type) {
    case "icard":
      return "/i-card";
    case "application":
      return "/applications";
    case "award":
      return "/profile#awards";
    case "grievance":
      return "/grievance";
    case "event":
    default:
      return "/";
  }
}

/** Resolve in-app path or external URL from a notification. */
export function getNotificationOpenTarget(
  notif: Pick<Notification, "body" | "type">,
): { href: string; external: boolean } {
  const link = extractNotificationLink(notif.body);
  if (link) {
    if (typeof window !== "undefined") {
      try {
        const parsed = new URL(link, window.location.origin);
        if (parsed.origin === window.location.origin) {
          return {
            href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
            external: false,
          };
        }
      } catch {
        /* fall through */
      }
    } else if (link.startsWith("/")) {
      return { href: link, external: false };
    }
    return { href: link, external: true };
  }
  return { href: getNotificationHref(notif.type), external: false };
}
