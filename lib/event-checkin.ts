import type { Event } from "@/types";

export type CheckInStatus =
  | { allowed: true }
  | {
      allowed: false;
      reason: "not_today" | "too_early" | "closed";
      message: string;
    };

function parseTimeOnDate(dateStr: string, timeStr: string): Date {
  const [h, m, s = "0"] = timeStr.split(":");
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(Number(h), Number(m), Number(s.split(".")[0]), 0);
  return d;
}

/** Time-window check-in — no GPS. Grace: 30 min before start, 2 hr after end. */
export function getCheckInStatus(
  event: Pick<Event, "date" | "time_start" | "time_end">,
  now = new Date(),
): CheckInStatus {
  const today = now.toISOString().slice(0, 10);

  if (event.date < today) {
    return {
      allowed: false,
      reason: "closed",
      message: "Check-in closed. This event has ended.",
    };
  }

  if (event.date > today) {
    return {
      allowed: false,
      reason: "not_today",
      message: `Check-in opens on ${new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}.`,
    };
  }

  if (event.time_start && event.time_end) {
    const start = parseTimeOnDate(event.date, event.time_start);
    start.setMinutes(start.getMinutes() - 30);
    const end = parseTimeOnDate(event.date, event.time_end);
    end.setHours(end.getHours() + 2);

    if (now < start) {
      const opens = parseTimeOnDate(event.date, event.time_start);
      return {
        allowed: false,
        reason: "too_early",
        message: `Check-in opens at ${opens.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.`,
      };
    }

    if (now > end) {
      return {
        allowed: false,
        reason: "closed",
        message: "Check-in closed. The event window has passed.",
      };
    }

    return { allowed: true };
  }

  return { allowed: true };
}
