import type { Event } from "@/types";
import { expandEventDates } from "@/lib/events/dates";

export type CheckInStatus =
  | { allowed: true }
  | {
      allowed: false;
      reason: "not_today" | "too_early" | "closed";
      message: string;
    };

type CheckInEvent = Pick<
  Event,
  | "date"
  | "time_start"
  | "time_end"
  | "is_recurring"
  | "end_date"
  | "cancelled_dates"
>;

function parseTimeOnDate(dateStr: string, timeStr: string): Date {
  const [h, m, s = "0"] = timeStr.split(":");
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(Number(h), Number(m), Number(s.split(".")[0]), 0);
  return d;
}

function formatDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function checkTimeWindow(
  effectiveDate: string,
  event: CheckInEvent,
  now: Date,
): CheckInStatus {
  if (event.time_start && event.time_end) {
    const start = parseTimeOnDate(effectiveDate, event.time_start);
    start.setMinutes(start.getMinutes() - 30);
    const end = parseTimeOnDate(effectiveDate, event.time_end);
    end.setHours(end.getHours() + 2);

    if (now < start) {
      const opens = parseTimeOnDate(effectiveDate, event.time_start);
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
  }

  return { allowed: true };
}

/** Time-window check-in — no GPS. Grace: 30 min before start, 2 hr after end. */
export function getCheckInStatus(
  event: CheckInEvent,
  now = new Date(),
): CheckInStatus {
  const today = now.toISOString().slice(0, 10);

  if (event.is_recurring) {
    const occurrences = expandEventDates(event as Event);
    if (occurrences.length === 0) {
      return {
        allowed: false,
        reason: "closed",
        message: "Check-in closed. This event has ended.",
      };
    }

    if (occurrences.includes(today)) {
      return checkTimeWindow(today, event, now);
    }

    const next = occurrences.find((d) => d > today);
    if (next) {
      return {
        allowed: false,
        reason: "not_today",
        message: `Check-in opens on ${formatDay(next)}.`,
      };
    }

    return {
      allowed: false,
      reason: "closed",
      message: "Check-in closed. This event has ended.",
    };
  }

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
      message: `Check-in opens on ${formatDay(event.date)}.`,
    };
  }

  return checkTimeWindow(event.date, event, now);
}
