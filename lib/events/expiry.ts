/** Shared rules for when an active event should be treated as closed. */

export function todayIso(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function isPastActiveEvent(
  event: {
    date: string;
    is_recurring?: boolean | null;
    end_date?: string | null;
  },
  today: string,
): boolean {
  if (event.is_recurring) {
    return event.end_date != null && event.end_date < today;
  }
  return event.date < today;
}
