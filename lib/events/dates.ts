import type { Event } from "@/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function expandEventDates(event: Event): string[] {
  const dates: string[] = [];
  const start = event.date;
  if (!start) return dates;

  const cancelled = new Set(event.cancelled_dates ?? []);

  if (!event.is_recurring || !event.end_date) {
    if (!cancelled.has(start)) dates.push(start);
    return dates;
  }

  const cur = new Date(`${start}T12:00:00`);
  const end = new Date(`${event.end_date}T12:00:00`);
  while (cur <= end) {
    const iso = toIso(cur.getFullYear(), cur.getMonth(), cur.getDate());
    if (!cancelled.has(iso)) dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** True if the event has any occurrence on or after today. */
export function hasUpcomingOccurrence(event: Event, today: string): boolean {
  const dates = expandEventDates(event);
  return dates.some((d) => d >= today);
}

export function firstOfMonthIso(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}
