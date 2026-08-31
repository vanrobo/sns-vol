"use client";

import { Calendar, MapPin, Pencil, Lock, Link2, Share2, Unlock, Copy, Users, CalendarOff } from "lucide-react";
import type { Event } from "@/types";
import { titleCaseStatus } from "@/types";
import { getEventPublicUrl } from "@/lib/events/share";
import Pagination, { paginate } from "@/components/staff/Pagination";
import toast from "react-hot-toast";

type EventsTableProps = {
  events: Event[];
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (event: Event) => void;
  onClose: (eventId: string) => void;
  onReopen?: (eventId: string) => void;
  onDuplicate?: (event: Event) => void;
  onCancelOccurrence?: (event: Event) => void;
  onViewAttendance?: (event: Event) => void;
  closingId: string | null;
};

const PAGE_SIZE = 6;

export default function EventsTable({
  events,
  page,
  onPageChange,
  onEdit,
  onClose,
  onReopen,
  onDuplicate,
  onCancelOccurrence,
  onViewAttendance,
  closingId,
}: EventsTableProps) {
  const paged = paginate(events, page, PAGE_SIZE);

  const copyLink = (slug: string) => {
    const url = getEventPublicUrl(slug);
    navigator.clipboard.writeText(url).then(
      () => toast.success("Public link copied!"),
      () => toast.error("Could not copy link"),
    );
  };

  return (
    <div className="space-y-3">
      {paged.map((evt) => (
        <div
          key={evt.id}
          className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${evt.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}
              >
                {titleCaseStatus(evt.status)}
              </span>
              <h3 className="font-bold text-base mt-2 leading-tight">
                {evt.title}
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase text-[var(--brand)] bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
              {evt.category}
            </span>
          </div>

          <div className="space-y-1 text-sm text-[var(--text-muted)]">
            <p className="flex items-center gap-2">
              <Calendar size={14} className="text-[var(--brand)] shrink-0" />
              {evt.date}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--brand)] shrink-0" />
              <span className="truncate">{evt.venue}</span>
            </p>
          </div>

          {evt.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {evt.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181B]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => copyLink(evt.slug)}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 dark:bg-[#18181B] text-xs font-bold"
            >
              <Link2 size={14} /> Copy link
            </button>
            <a
              href={getEventPublicUrl(evt.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#18181B] text-xs font-bold"
            >
              <Share2 size={14} />
            </a>
            <button
              type="button"
              onClick={() => onEdit(evt)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#18181B] text-xs font-bold"
              aria-label="Edit"
            >
              <Pencil size={14} />
            </button>
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(evt)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#18181B] text-xs font-bold"
                aria-label="Duplicate"
              >
                <Copy size={14} />
              </button>
            )}
            {onViewAttendance && (
              <button
                type="button"
                onClick={() => onViewAttendance(evt)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#18181B] text-xs font-bold"
                aria-label="Attendance"
              >
                <Users size={14} />
              </button>
            )}
            {evt.is_recurring && onCancelOccurrence && (
              <button
                type="button"
                onClick={() => onCancelOccurrence(evt)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold"
                aria-label="Cancel occurrence"
              >
                <CalendarOff size={14} />
              </button>
            )}
            {evt.status === "active" && (
              <button
                type="button"
                disabled={closingId === evt.id}
                onClick={() => onClose(evt.id)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold disabled:opacity-50"
              >
                <Lock size={14} /> Close
              </button>
            )}
            {evt.status === "closed" && onReopen && (
              <button
                type="button"
                disabled={closingId === evt.id}
                onClick={() => onReopen(evt.id)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold disabled:opacity-50"
              >
                <Unlock size={14} /> Reopen
              </button>
            )}
          </div>
        </div>
      ))}

      <Pagination
        total={events.length}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}
