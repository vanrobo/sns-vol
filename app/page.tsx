// app/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  getEvents,
  getUpcomingEvents,
  getCheckInStatus,
  applyToEvent,
  withdrawApplication,
  markAttended,
  submitFeedback,
} from "@/lib/data/events";
import type { Event, ApplicationStatus } from "@/types";
import { titleCaseStatus } from "@/types";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Loader2,
  ChevronRight,
  X,
  Star,
  CheckCircle2,
  ExternalLink,
  Target,
  Phone,
  Filter,
  Share2,
  HeartOff,
  BookmarkPlus,
  CalendarDays,
  Clock,
  Search,
} from "lucide-react";
import { EventListSkeleton } from "@/components/ui/Skeleton";
import SkillChips from "@/components/ui/SkillChips";
import StaffHomeBanner from "@/components/StaffHomeBanner";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import AwardsCarousel from "@/components/home/AwardsCarousel";
import EventCalendarView, {
  expandEventDates,
} from "@/components/events/EventCalendarView";
import { getMyRole, getVolunteerStats } from "@/lib/data/profiles";
import { getMyAwards } from "@/lib/data/awards";
import { getEventPublicUrl } from "@/lib/events/share";
import { APP_NAME } from "@/lib/brand";
import { readHomeCache, writeHomeCache } from "@/lib/home-cache";
import {
  eventsCacheKey,
  readEventsCache,
  writeEventsCache,
} from "@/lib/events-cache";
import type { UserRole, UserAward } from "@/types";
import { haptic } from "@/lib/haptics";

function applicationStatusClass(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/10 text-[var(--brand)]";
    case "declined":
      return "border-red-500/30 bg-red-500/10 text-red-600";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }
}

type Tab = "Active" | "Closed" | "Attended";

export default function VolunteeringDashboard() {
  const [events, setEvents] = useState<Event[]>(() => {
    const uid = readHomeCache()?.userId;
    if (!uid) return [];
    return readEventsCache(uid, eventsCacheKey("Active", "", "all"))?.events ?? [];
  });
  const [loading, setLoading] = useState(() => {
    const uid = readHomeCache()?.userId;
    if (!uid) return true;
    return !readEventsCache(uid, eventsCacheKey("Active", "", "all"));
  });
  const [tab, setTab] = useState<Tab>("Active");
  const [dateFilter, setDateFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarView, setCalendarView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [applying, setApplying] = useState(false);
  const [rating, setRating] = useState(0);
  const [session, setSession] = useState<{
    role: UserRole;
    name: string;
    batch: string | null;
  } | null>(() => readHomeCache()?.session ?? null);
  const [userId, setUserId] = useState<string | undefined>(
    () => readHomeCache()?.userId,
  );
  const [myAwards, setMyAwards] = useState<UserAward[]>(
    () => readHomeCache()?.awards ?? [],
  );
  const [stats, setStats] = useState<{ attended: number; totalActive: number } | null>(
    () => readHomeCache()?.stats ?? null,
  );
  const [allEventsForCalendar, setAllEventsForCalendar] = useState<Event[]>([]);
  const [calendarDayPopup, setCalendarDayPopup] = useState<{
    date: string;
    events: Event[];
  } | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    Promise.all([getMyRole(), getMyAwards(), getVolunteerStats()]).then(
      ([s, awards, st]) => {
        const nextSession = s
          ? { role: s.role, name: s.name, batch: s.batch }
          : null;
        if (nextSession && s) {
          setUserId(s.id);
          setSession(nextSession);
          setMyAwards(awards);
          if (st) setStats(st);
          writeHomeCache({
            userId: s.id,
            session: nextSession,
            awards,
            stats: st,
          });
          if (s.role === "volunteer") {
            getUpcomingEvents()
              .then(setUpcomingEvents)
              .catch(() => setUpcomingEvents([]));
          }
        }
      },
    );
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      for (const t of ["Active", "Closed", "Attended"] as Tab[]) {
        const key = eventsCacheKey(t, "", "all");
        if (readEventsCache(userId, key)) continue;
        try {
          const status =
            t === "Attended" ? "attended" : t === "Active" ? "active" : "closed";
          let fetched = await getEvents(status);
          if (t === "Active") fetched = fetched.filter((e) => !e.is_recurring);
          const calendarEvents =
            t === "Active" ? await getEvents("active") : [];
          writeEventsCache(userId, key, fetched, calendarEvents);
        } catch {
          /* ignore prefetch errors */
        }
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!selectedEvent) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedEvent]);

  const loadEvents = useCallback(async (opts?: { silent?: boolean }) => {
    const cacheKey = eventsCacheKey(tab, dateFilter, regionFilter);
    const cached = userId ? readEventsCache(userId, cacheKey) : null;

    if (!opts?.silent && !cached) {
      setLoading(true);
    } else if (cached) {
      setEvents(cached.events);
      if (cached.calendarEvents.length > 0) {
        setAllEventsForCalendar(cached.calendarEvents);
      }
    }

    try {
      const status =
        tab === "Attended" ? "attended" : tab === "Active" ? "active" : "closed";
      let fetched = await getEvents(status);

      if (dateFilter) {
        fetched = fetched.filter((e) =>
          expandEventDates(e).includes(dateFilter),
        );
      }
      if (regionFilter !== "all") {
        fetched = fetched.filter(
          (e) => (e.region || e.venue) === regionFilter,
        );
      }
      if (!dateFilter) {
        fetched = fetched.filter((e) => !e.is_recurring);
      }
      fetched = [...fetched].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setEvents(fetched);

      let calendarEvents: Event[] = [];
      if (tab === "Active") {
        calendarEvents = await getEvents("active");
        setAllEventsForCalendar(calendarEvents);
      }

      if (userId) {
        writeEventsCache(userId, cacheKey, fetched, calendarEvents);
      }
    } catch {
      if (!cached) toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  }, [tab, dateFilter, regionFilter, userId]);

  const refreshHome = useCallback(async () => {
    haptic("light");
    const [s, awards, st] = await Promise.all([
      getMyRole(),
      getMyAwards(),
      getVolunteerStats(),
    ]);
    const nextSession = s
      ? { role: s.role, name: s.name, batch: s.batch }
      : null;
    if (nextSession && s) {
      setUserId(s.id);
      setSession(nextSession);
      setMyAwards(awards);
      if (st) setStats(st);
      writeHomeCache({
        userId: s.id,
        session: nextSession,
        awards,
        stats: st,
      });
    }
    await loadEvents({ silent: true });
    if (s?.role === "volunteer") {
      getUpcomingEvents()
        .then(setUpcomingEvents)
        .catch(() => setUpcomingEvents([]));
    }
    haptic("success");
  }, [loadEvents]);

  useEffect(() => {
    if (!userId) return;
    const cacheKey = eventsCacheKey(tab, dateFilter, regionFilter);
    const cached = readEventsCache(userId, cacheKey);
    if (cached) {
      setEvents(cached.events);
      if (cached.calendarEvents.length > 0) {
        setAllEventsForCalendar(cached.calendarEvents);
      }
      setLoading(false);
      loadEvents({ silent: true });
    } else {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dateFilter, regionFilter, userId]);

  const handleAction = async (overrideAction?: string) => {
    if (!selectedEvent) return;
    setApplying(true);
    try {
      if (overrideAction === "mark_attended") {
        await markAttended(selectedEvent.id);
        haptic("success");
        toast.success("Checked in — attendance recorded!");
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id ? { ...e, has_attended: true } : e,
          ),
        );
        setSelectedEvent({ ...selectedEvent, has_attended: true });
      } else if (tab === "Active") {
        if (selectedEvent.has_applied) {
          await withdrawApplication(selectedEvent.id);
          haptic("warning");
          toast.success("Interest withdrawn");
        } else {
          await applyToEvent(selectedEvent.id);
          haptic("success");
          toast.success("Marked as Interested!");
        }
        const nextApplied = !selectedEvent.has_applied;
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id
              ? {
                  ...e,
                  has_applied: nextApplied,
                  application_status: nextApplied ? "pending" : null,
                }
              : e,
          ),
        );
        setSelectedEvent({
          ...selectedEvent,
          has_applied: nextApplied,
          application_status: nextApplied ? "pending" : null,
        });
      } else {
        if (rating === 0) {
          toast.error("Please select a star rating");
          return;
        }
        await submitFeedback(selectedEvent.id, rating);
        haptic("success");
        toast.success("Feedback submitted!");
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id ? { ...e, rating } : e,
          ),
        );
        setSelectedEvent(null);
        setRating(0);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const getSkillMatch = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * 37) % 40;
    return 60 + hash;
  };

  const getCardColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "stem":
        return "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900";
      case "education":
        return "bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900";
      case "environment":
        return "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900";
      default:
        return "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900";
    }
  };

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
      toast.success("Link copied!", { id: "share-link" });
    } catch {
      toast.error("Could not copy link");
    }
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setRating(0);
  };

  const regions = [
    "all",
    ...new Set(
      allEventsForCalendar
        .map((e) => e.region || e.venue)
        .filter(Boolean)
        .filter((r) => !/mumbai/i.test(r)),
    ),
  ];

  const displayedEvents = events.filter((evt) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      evt.title.toLowerCase().includes(q) ||
      evt.venue.toLowerCase().includes(q) ||
      (evt.category ?? "").toLowerCase().includes(q) ||
      (evt.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <MobileLayout onRefresh={refreshHome}>
      <div className="p-5 space-y-6 pb-28">
        {session && (session.role === "admin" || session.role === "organiser") && (
          <StaffHomeBanner role={session.role} name={session.name} />
        )}

        {session && session.role === "volunteer" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Welcome, {session.name.split(" ")[0]}
              </h1>
              {stats && (
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                  {stats.attended} events attended · {stats.totalActive} active
                  now
                </p>
              )}
            </div>
            <QuickAccessGrid
              batch={session.batch}
              awardCount={myAwards.length}
              onEventsClick={() => setCalendarView(true)}
            />
            <UpcomingEvents
              events={upcomingEvents}
              onSelect={setSelectedEvent}
            />
            <AwardsCarousel awards={myAwards} />
          </div>
        )}

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 space-y-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-[var(--brand)]" /> Events
              </span>
              {(dateFilter || regionFilter !== "all") && (
                <button
                  onClick={() => {
                    setDateFilter("");
                    setRegionFilter("all");
                  }}
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
                placeholder="Search events by title, venue, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 p-2.5 bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg text-xs font-medium outline-[var(--brand)]"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg p-2.5 text-xs font-bold outline-[var(--brand)]"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "All regions / venues" : r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCalendarView((v) => !v)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                calendarView
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--brand)] bg-[var(--brand)]/10 hover:bg-[var(--brand)]/15"
              }`}
            >
              <CalendarDays size={14} />
              {calendarView ? "Hide Calendar" : "Calendar View"}
            </button>
            {calendarView && (
              <EventCalendarView
                embedded
                events={allEventsForCalendar}
                selectedDate={dateFilter}
                onSelectDate={(d) => setDateFilter(d)}
                onDayOpen={(date, dayEvents) =>
                  setCalendarDayPopup({ date, events: dayEvents })
                }
              />
            )}
          </div>

          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="flex bg-slate-100 dark:bg-[#18181B] p-1 rounded-lg">
              {(["Active", "Closed", "Attended"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    haptic("selection");
                    const cacheKey = eventsCacheKey(t, dateFilter, regionFilter);
                    const cached = userId ? readEventsCache(userId, cacheKey) : null;
                    if (cached) {
                      setEvents(cached.events);
                      setLoading(false);
                    }
                    setTab(t);
                  }}
                  className={`flex-1 py-1.5 text-[14px] font-bold rounded-md transition-all duration-150 ${tab === t ? "bg-white dark:bg-black text-[var(--brand)] shadow-sm border border-[var(--border)]" : "text-slate-500"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3 bg-[var(--surface)]">
            {loading ? (
              <EventListSkeleton count={4} />
            ) : displayedEvents.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl">
                No events found match this selection.
              </div>
            ) : (
              displayedEvents.map((evt) => {
                const matchPercentage = getSkillMatch(evt.id);
                const isHighMatch = matchPercentage >= 75;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`rounded-xl p-5 border cursor-pointer active:scale-[0.98] transition-all flex justify-between items-center shadow-sm group ${getCardColor(evt.category)}`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex gap-2 mb-2 flex-wrap items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40">
                          {evt.category || "Community"}
                        </span>
                        {tab === "Active" && evt.has_applied && evt.application_status && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${applicationStatusClass(evt.application_status)}`}
                          >
                            {titleCaseStatus(evt.application_status)}
                          </span>
                        )}
                        {tab === "Active" && !evt.has_applied && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--brand)]/20 bg-[var(--brand)]/10 text-[var(--brand)] flex items-center gap-1.5">
                            {isHighMatch && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]" />
                              </span>
                            )}
                            <Target size={10} /> {matchPercentage}% Match
                          </span>
                        )}
                        {(tab === "Closed" || tab === "Attended") &&
                          evt.has_attended && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-[var(--brand)] flex items-center gap-1">
                              <CheckCircle2 size={10} /> Attended
                            </span>
                          )}
                      </div>
                      <h3 className="font-bold text-[18px] tracking-tight leading-tight">
                        {evt.title}
                      </h3>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium mt-1">
                        <Calendar size={12} className="text-[var(--brand)]" />{" "}
                        {evt.date}
                      </p>
                    </div>
                    <div className="text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors bg-white/50 dark:bg-black/10 p-2 rounded-full">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {portalReady &&
        selectedEvent &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Close event details"
              className="absolute inset-0"
              onClick={closeEventModal}
            />
            <div className="relative z-10 w-full max-w-md flex flex-col max-h-[92dvh] rounded-t-3xl overflow-hidden shadow-2xl bg-[#F4F4F5] dark:bg-black border-t border-[var(--border)]">
              <div
                className={`shrink-0 p-6 pb-4 border-b border-black/5 dark:border-white/5 flex justify-between items-start gap-3 ${getCardColor(selectedEvent.category)}`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--brand)]/20 bg-white/80 text-slate-900 mb-2 inline-block shadow-sm">
                    {tab === "Active" ? "Open for Registration" : "Event Closed"}
                  </span>
                  {selectedEvent.has_applied && selectedEvent.application_status && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ml-2 inline-block ${applicationStatusClass(selectedEvent.application_status)}`}
                    >
                      Application: {titleCaseStatus(selectedEvent.application_status)}
                    </span>
                  )}
                  <h2 className="text-2xl font-black tracking-tight leading-tight">
                    {selectedEvent.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeEventModal}
                    className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-[var(--surface)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-4 rounded-xl">
                  <Calendar size={16} className="text-[var(--brand)] mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                    Date
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {selectedEvent.date}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-4 rounded-xl hover:border-emerald-500 transition-colors"
                >
                  <MapPin size={16} className="text-[var(--brand)] mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                    Venue <ExternalLink size={10} />
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 truncate underline">
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

              {tab === "Closed" &&
                selectedEvent.has_attended &&
                !selectedEvent.rating && (
                  <div className="bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] p-5 rounded-xl flex flex-col items-center">
                    <h4 className="font-bold mb-3 text-sm">
                      Rate your experience
                    </h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setRating(star)}
                          size={32}
                          className={`cursor-pointer transition-transform hover:scale-110 ${rating >= star ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="shrink-0 p-5 pb-6 bg-[var(--surface)] border-t border-[var(--border)]">
              {selectedEvent.has_applied &&
                selectedEvent.application_status === "approved" &&
                !selectedEvent.has_attended &&
                (() => {
                  const checkIn = getCheckInStatus(selectedEvent);
                  if (checkIn.allowed) {
                    return (
                      <button
                        onClick={() => handleAction("mark_attended")}
                        disabled={applying}
                        className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg shadow-emerald-500/20 font-bold py-3.5 rounded-lg text-[14px] transition-all flex justify-center items-center mb-3"
                      >
                        <CheckCircle2 size={16} className="mr-2" /> Check in
                        (I&apos;m here)
                      </button>
                    );
                  }
                  return (
                    <p className="text-xs text-center text-[var(--text-muted)] font-medium mb-3 leading-relaxed px-2">
                      {checkIn.message}
                    </p>
                  );
                })()}

              {tab === "Active" ? (
                <div className="space-y-2">
                  {selectedEvent.coordinator_phone?.trim() ? (
                    <a
                      href={`tel:${selectedEvent.coordinator_phone.trim()}`}
                      className="w-full flex items-center justify-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-3.5 rounded-xl text-[14px] shadow-lg"
                    >
                      <Phone size={16} />
                      Call Coordinator
                    </a>
                  ) : (
                    <p className="text-center text-xs text-[var(--text-muted)] font-medium py-2">
                      No coordinator phone listed for this event.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction()}
                      disabled={applying}
                      className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-[13px] disabled:opacity-50 ${
                        selectedEvent.has_applied
                          ? "bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-900/50"
                          : "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/25"
                      }`}
                    >
                      {applying ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : selectedEvent.has_applied ? (
                        <>
                          <HeartOff size={14} /> Withdraw
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={14} /> Interested
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => shareEvent(selectedEvent)}
                      className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#18181B] border border-[var(--border)] font-semibold py-3 rounded-xl text-[13px]"
                    >
                      <Share2 size={14} className="text-[var(--brand)]" />
                      Share
                    </button>
                  </div>
                </div>
              ) : selectedEvent.has_attended ? (
                selectedEvent.rating && selectedEvent.rating > 0 ? (
                  <button
                    disabled
                    className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-[var(--border)] text-slate-500 font-semibold py-3.5 rounded-lg text-[14px]"
                  >
                    Thank you for reviewing!
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction()}
                    disabled={applying || rating === 0}
                    className="w-full bg-[var(--brand)] text-white font-semibold py-3.5 rounded-lg text-[14px] flex justify-center shadow-lg"
                  >
                    {applying ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Submit Rating"
                    )}
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-[var(--border)] text-slate-500 font-semibold py-3.5 rounded-lg text-[14px]"
                >
                  Event has ended
                </button>
              )}

              {tab !== "Active" && (
                <button
                  type="button"
                  onClick={() => shareEvent(selectedEvent)}
                  className="w-full flex items-center justify-center gap-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] font-semibold py-3 rounded-lg text-[13px] mt-3"
                >
                  <Share2 size={14} className="text-[var(--brand)]" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}

      {portalReady &&
        calendarDayPopup &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Close calendar events"
              className="absolute inset-0"
              onClick={() => setCalendarDayPopup(null)}
            />
            <div className="relative z-10 w-full max-w-md max-h-[70dvh] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl bg-[var(--surface)] border-t border-[var(--border)]">
              <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Events on
                  </p>
                  <h3 className="text-lg font-black">
                    {new Date(
                      `${calendarDayPopup.date}T12:00:00`,
                    ).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarDayPopup(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#18181B]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {calendarDayPopup.events.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      setCalendarDayPopup(null);
                      setSelectedEvent(evt);
                    }}
                    className={`w-full text-left rounded-xl p-4 border cursor-pointer active:scale-[0.98] transition-all flex justify-between items-center ${getCardColor(evt.category)}`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-sm truncate">{evt.title}</p>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1">
                        <Calendar size={11} className="text-[var(--brand)] shrink-0" />
                        {calendarDayPopup.date}
                        {evt.time_start && (
                          <>
                            <Clock size={11} className="shrink-0" />
                            {evt.time_start.slice(0, 5)}
                            {evt.time_end ? `–${evt.time_end.slice(0, 5)}` : ""}
                          </>
                        )}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                        {evt.venue}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </MobileLayout>
  );
}
