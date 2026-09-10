"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  Filter,
  MapPin,
  Pencil,
  Search,
  Share2,
  Target,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Event, UserRole } from "@/types";
import { titleCaseStatus } from "@/types";
import EventCalendarView from "@/components/events/EventCalendarView";
import QuickLinksNav from "@/components/home/QuickLinksNav";
import Pagination, { paginate } from "@/components/staff/Pagination";
import SkillChips from "@/components/ui/SkillChips";
import EventFormModal, { eventToForm } from "@/components/staff/EventFormModal";
import type { EventInput } from "@/lib/data/admin";
import { firstOfMonthIso } from "@/lib/events/dates";
import { groupEventsByLocation } from "@/lib/events/locations";
import { getEventCardColor } from "@/lib/events/card-colors";
import { isClassCancelCategory } from "@/components/events/EventCalendarView";
import { getEventPublicUrl } from "@/lib/events/share";
import { SNS_CENTERS, matchesCenter } from "@/lib/centers";
import { APP_NAME } from "@/lib/brand";
import { updateEvent } from "@/lib/data/admin";

type SessionInfo = {
  name: string;
  role: UserRole;
} | null;

type Props = {
  events: Event[];
  session: SessionInfo;
  initialEventSlug?: string | null;
};

const PAGE_SIZE = 8;

export default function PublicEventsBoard({
  events: initialEvents,
  session,
  initialEventSlug = null,
}: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [month, setMonth] = useState(firstOfMonthIso);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [dayPopup, setDayPopup] = useState<{
    date: string;
    events: Event[];
  } | null>(null);
  const [editing, setEditing] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<EventInput | null>(null);
  const [saving, setSaving] = useState(false);

  const isStaff =
    session?.role === "admin" || session?.role === "organiser";

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (!initialEventSlug) return;
    const match = initialEvents.find((e) => e.slug === initialEventSlug);
    if (match) setSelectedEvent(match);
  }, [initialEventSlug, initialEvents]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, regionFilter]);

  useEffect(() => {
    if (!selectedEvent) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedEvent]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((evt) => {
      if (regionFilter !== "all" && !matchesCenter(evt.region, regionFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        (evt.region ?? "").toLowerCase().includes(q) ||
        (evt.category ?? "").toLowerCase().includes(q) ||
        (evt.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery, regionFilter]);

  const paged = paginate(filtered, page, PAGE_SIZE);
  const centers = ["all", ...SNS_CENTERS];

  const shareEvent = async (event: Event) => {
    const url = getEventPublicUrl(event.slug);
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out "${event.title}" on ${APP_NAME}`,
          url,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setEditForm(eventToForm(event));
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editForm) return;
    setSaving(true);
    try {
      const updated = await updateEvent(editing.id, editForm);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updated.id ? { ...ev, ...updated } : ev)),
      );
      setSelectedEvent((prev) =>
        prev?.id === updated.id ? { ...prev, ...updated } : prev,
      );
      setEditing(null);
      setEditForm(null);
      toast.success("Event updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <QuickLinksNav />

      <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-[var(--border)]">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-[var(--brand)]" />
            Calendar
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            All active events by date and location
          </p>
        </div>
        <div className="p-4">
          <EventCalendarView
            embedded
            events={events}
            monthAnchor={month}
            onMonthChange={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onDayOpen={(date, dayEvents) => {
              setSelectedDate(date);
              setDayPopup({ date, events: dayEvents });
            }}
          />
        </div>
      </section>

      <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 space-y-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} className="text-[var(--brand)]" /> Events
            </span>
            {regionFilter !== "all" && (
              <button
                type="button"
                onClick={() => setRegionFilter("all")}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 p-2.5 bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg text-sm font-medium outline-[var(--brand)]"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg p-2.5 text-sm font-bold outline-[var(--brand)]"
          >
            {centers.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All concern centers" : r}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 space-y-3">
          {paged.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl">
              No events found match this selection.
            </div>
          ) : (
            <>
              {paged.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => setSelectedEvent(evt)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border cursor-pointer active:scale-[0.98] transition-all flex justify-between items-center gap-2 shadow-sm group ${getEventCardColor(evt.category)}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 mb-1 flex-wrap items-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40">
                        {evt.category || "Community"}
                      </span>
                      {isClassCancelCategory(evt.category) && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm tracking-tight leading-snug truncate">
                      {evt.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20">
                        <Calendar size={10} className="text-[var(--brand)] shrink-0" />
                        {evt.date}
                      </span>
                      {(evt.region || evt.venue) && (
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 truncate max-w-[160px]">
                          <MapPin size={10} className="text-[var(--brand)] shrink-0" />
                          {evt.region || evt.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0"
                  />
                </button>
              ))}
              <Pagination
                total={filtered.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      {portalReady &&
        selectedEvent &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Close event details"
              className="absolute inset-0"
              onClick={() => setSelectedEvent(null)}
            />
            <div className="relative z-10 w-full max-w-md flex flex-col max-h-[92dvh] rounded-t-3xl overflow-hidden shadow-2xl bg-[#F4F4F5] dark:bg-black border-t border-[var(--border)]">
              <div
                className={`shrink-0 p-6 pb-4 border-b border-black/5 dark:border-white/5 flex justify-between items-start gap-3 ${getEventCardColor(selectedEvent.category)}`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--brand)]/20 bg-white/80 text-slate-900 mb-2 inline-block shadow-sm">
                    {isClassCancelCategory(selectedEvent.category)
                      ? "Class cancelled"
                      : selectedEvent.status === "active"
                        ? "Open for Registration"
                        : "Event Closed"}
                  </span>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">
                    {selectedEvent.title}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-[var(--surface)]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-4 rounded-xl">
                    <Calendar size={16} className="text-[var(--brand)] mb-2" />
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                      Date
                    </p>
                    <p className="text-base font-semibold truncate">
                      {selectedEvent.date}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-4 rounded-xl">
                    <MapPin size={16} className="text-[var(--brand)] mb-2" />
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                      Concern Center
                    </p>
                    <p className="text-base font-semibold truncate">
                      {selectedEvent.region || "Not specified"}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 block bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-4 rounded-xl hover:border-emerald-500 transition-colors"
                  >
                    <MapPin size={16} className="text-[var(--brand)] mb-2" />
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                      Venue <ExternalLink size={10} />
                    </p>
                    <p className="text-base font-semibold text-emerald-600 underline">
                      {selectedEvent.venue}
                    </p>
                  </a>
                </div>

                <div className="bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-5 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">About the Event</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {selectedEvent.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Target size={12} className="text-[var(--brand)]" /> Skill
                      Requirements
                    </p>
                    <SkillChips
                      criteria={selectedEvent.criteria}
                      skills={selectedEvent.required_skills}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 pb-4">
                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => openEdit(selectedEvent)}
                      className="w-full flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] font-bold py-3 rounded-xl text-sm"
                    >
                      <Pencil size={16} />
                      Edit event
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => shareEvent(selectedEvent)}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] font-bold py-3 rounded-xl text-sm"
                  >
                    <Share2 size={16} />
                    Share public link
                  </button>
                  {!session && (
                    <Link
                      href="/signup"
                      className="w-full text-center bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-3.5 rounded-xl shadow-lg"
                    >
                      Sign up to volunteer
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {portalReady &&
        dayPopup &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close calendar day"
              onClick={() => setDayPopup(null)}
            />
            <div className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--text-muted)]">
                    {new Date(`${dayPopup.date}T12:00:00`).toLocaleDateString(
                      undefined,
                      { weekday: "long", day: "numeric", month: "long" },
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
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        setDayPopup(null);
                        setSelectedEvent(event);
                      }}
                      className={`w-full text-left rounded-xl p-4 border cursor-pointer active:scale-[0.98] transition-all flex justify-between items-center ${getEventCardColor(event.category)}`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{event.title}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {event.category} · {titleCaseStatus(event.status)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {editForm && editing && (
        <EventFormModal
          open
          editing={editing}
          form={editForm}
          onClose={() => {
            if (saving) return;
            setEditing(null);
            setEditForm(null);
          }}
          onChange={setEditForm}
          onSubmit={saveEdit}
        />
      )}
    </div>
  );
}
