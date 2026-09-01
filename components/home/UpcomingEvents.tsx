"use client";

import type { Event, ApplicationStatus } from "@/types";
import { titleCaseStatus } from "@/types";
import { Calendar, ChevronRight, MapPin, Loader2 } from "lucide-react";

type UpcomingEventsProps = {
  events: Event[];
  loading?: boolean;
  onSelect: (event: Event) => void;
};

function statusClass(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/10 text-[var(--brand)]";
    case "declined":
      return "border-red-500/30 bg-red-500/10 text-red-600";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }
}

export default function UpcomingEvents({
  events,
  loading = false,
  onSelect,
}: UpcomingEventsProps) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
          Your upcoming events
        </h2>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          Events you marked interested in (approval optional)
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-[var(--brand)]" size={22} />
        </div>
      ) : events.length === 0 ? (
        <p className="p-4 text-sm text-[var(--text-muted)] leading-relaxed">
          No upcoming events yet. Browse below and tap{" "}
          <span className="font-bold text-[var(--text)]">Interested</span> to
          apply.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-[var(--brand)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm truncate">{event.title}</p>
                  {event.application_status && (
                    <span
                      className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusClass(event.application_status)}`}
                    >
                      {titleCaseStatus(event.application_status)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  {new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {event.time_start && ` · ${event.time_start.slice(0, 5)}`}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={10} /> {event.venue}
                </p>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
