"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";
import type { Event } from "@/types";
import EventCalendarView from "@/components/events/EventCalendarView";
import { firstOfMonthIso } from "@/lib/events/dates";
import { groupEventsByLocation } from "@/lib/events/locations";

type Props = {
  events: Event[];
};

function formatWhen(event: Event) {
  const day = new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time =
    event.time_start && event.time_end
      ? ` · ${event.time_start.slice(0, 5)}–${event.time_end.slice(0, 5)}`
      : event.time_start
        ? ` · ${event.time_start.slice(0, 5)}`
        : "";
  const recurring = event.is_recurring
    ? event.end_date
      ? ` · weekly until ${new Date(`${event.end_date}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
      : " · weekly"
    : "";
  return `${day}${time}${recurring}`;
}

export default function PublicEventsBoard({ events }: Props) {
  const [month, setMonth] = useState(firstOfMonthIso);
  const [selectedDate, setSelectedDate] = useState("");
  const [dayPopup, setDayPopup] = useState<{
    date: string;
    events: Event[];
  } | null>(null);

  const list = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [events],
  );

  return (
    <div className="space-y-5">
      <Link
        href="/library"
        className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)] shrink-0">
            <BookOpen size={20} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm">SNS Magazine &amp; Newsletters</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Open PDF reader — no login needed
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[var(--brand)] shrink-0" />
      </Link>

      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-0.5">
          Calendar
        </h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <EventCalendarView
            events={events}
            monthAnchor={month}
            onMonthChange={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onDayOpen={(date, dayEvents) => setDayPopup({ date, events: dayEvents })}
            embedded
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-0.5">
          All events
        </h2>
        {list.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2 rounded-2xl border border-dashed border-[var(--border)]">
            <p className="text-lg font-bold">No open events right now</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Check back soon, or open the magazine while you wait.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/event/${event.slug}`}
                  className="block bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--brand)]/30 bg-[var(--brand)]/10 text-[var(--brand)]">
                        {event.category}
                      </span>
                      <h2 className="text-lg font-black leading-snug">
                        {event.title}
                      </h2>
                      <p className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                        <Calendar
                          size={16}
                          className="text-[var(--brand)] shrink-0 mt-0.5"
                        />
                        <span>{formatWhen(event)}</span>
                      </p>
                      <p className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                        <MapPin
                          size={16}
                          className="text-[var(--brand)] shrink-0 mt-0.5"
                        />
                        <span className="leading-snug">{event.venue}</span>
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-[var(--text-muted)] shrink-0 mt-2"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {dayPopup && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close calendar events"
            onClick={() => setDayPopup(null)}
          />
          <div className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--text-muted)]">
                  {new Date(`${dayPopup.date}T12:00:00`).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </p>
                <h3 className="font-bold text-lg mt-0.5">On this day</h3>
              </div>
              <button
                type="button"
                onClick={() => setDayPopup(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#18181B]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {groupEventsByLocation(dayPopup.events).map(({ label, events: group }) => (
              <div key={label} className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin size={11} className="text-[var(--brand)]" />
                  {label}
                </p>
                {group.map((event) => (
                  <Link
                    key={event.id}
                    href={`/event/${event.slug}`}
                    className="block rounded-xl border border-[var(--border)] p-3 hover:border-[var(--brand)]/40"
                    onClick={() => setDayPopup(null)}
                  >
                    <p className="font-bold text-sm">{event.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatWhen(event)}
                    </p>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
