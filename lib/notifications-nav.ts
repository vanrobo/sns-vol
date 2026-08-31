import type { NotificationType } from "@/types";

export function getNotificationHref(type: NotificationType): string {
  switch (type) {
    case "icard":
      return "/i-card";
    case "application":
      return "/";
    case "award":
      return "/profile#awards";
    case "grievance":
      return "/grievance";
    case "event":
    default:
      return "/";
  }
}
