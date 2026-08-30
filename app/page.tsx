// app/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getEvents,
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
} from "lucide-react";
import { EventListSkeleton } from "@/components/ui/Skeleton";
import StaffHomeBanner from "@/components/StaffHomeBanner";
import { getMyRole } from "@/lib/data/profiles";
import { getEventPublicUrl } from "@/lib/events/share";
import type { UserRole } from "@/types";

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Active");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [applying, setApplying] = useState(false);
  const [rating, setRating] = useState(0);
  const [session, setSession] = useState<{
    role: UserRole;
    name: string;
  } | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    getMyRole().then((s) => {
      if (s) setSession({ role: s.role, name: s.name });
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedEvent]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const status =
        tab === "Attended" ? "attended" : tab === "Active" ? "active" : "closed";
      let fetched = await getEvents(status);

      if (dateFilter) {
        fetched = fetched.filter((e) => e.date === dateFilter);
      }
      fetched = [...fetched].sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortBy === "newest" ? timeB - timeA : timeA - timeB;
      });
      setEvents(fetched);
    } catch {
      toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dateFilter, sortBy]);

  const handleAction = async (overrideAction?: string) => {
    if (!selectedEvent) return;
    setApplying(true);
    try {
      if (overrideAction === "mark_attended") {
        await markAttended(selectedEvent.id);
        toast.success("Marked as Attended!");
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id ? { ...e, has_attended: true } : e,
          ),
        );
        setSelectedEvent(null);
      } else if (tab === "Active") {
        if (selectedEvent.has_applied) {
          await withdrawApplication(selectedEvent.id);
          toast.success("Interest withdrawn");
        } else {
          await applyToEvent(selectedEvent.id);
          toast.success("Marked as Interested!");
        }
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id
              ? {
                  ...e,
                  has_applied: !selectedEvent.has_applied,
                  application_status: selectedEvent.has_applied
                    ? null
                    : "pending",
                }
              : e,
          ),
        );
        setSelectedEvent(null);
      } else {
        if (rating === 0) {
          toast.error("Please select a star rating");
          return;
        }
        await submitFeedback(selectedEvent.id, rating);
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
          text: `Check out "${event.title}" on SNS Vol`,
          url,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setRating(0);
  };

  return (
    <MobileLayout>
      <div className="p-5 space-y-6 pb-28">
        {session && (session.role === "admin" || session.role === "organiser") && (
          <StaffHomeBanner role={session.role} name={session.name} />
        )}
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} className="text-[var(--brand)]" /> Sort & Filter
            </span>
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg p-2.5 text-xs font-bold outline-[var(--brand)]"
            />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest")
              }
              className="w-full bg-slate-50 dark:bg-[#18181B] border border-[var(--border)] rounded-lg p-2.5 text-xs font-bold outline-[var(--brand)]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="flex bg-[#E4E4E7] dark:bg-[#121212] p-1 rounded-lg border border-[var(--border)]">
          {(["Active", "Closed", "Attended"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setLoading(true);
              }}
              className={`flex-1 py-1.5 text-[14px] font-bold rounded-md transition-all duration-150 ${tab === t ? "bg-white dark:bg-black text-[var(--brand)] shadow-sm border border-[var(--border)]" : "text-slate-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <EventListSkeleton count={4} />
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl">
              No events found match this selection.
            </div>
          ) : (
            events.map((evt) => {
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
                    aria-label="Share event link"
                    onClick={() => shareEvent(selectedEvent)}
                    className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
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
                  <p className="text-sm font-medium">
                    {selectedEvent.criteria}
                    {selectedEvent.required_skills?.length
                      ? ` · ${selectedEvent.required_skills.join(", ")}`
                      : ""}
                  </p>
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
              {selectedEvent.has_applied && !selectedEvent.has_attended && (
                <button
                  onClick={() => handleAction("mark_attended")}
                  disabled={applying}
                  className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg shadow-emerald-500/20 font-bold py-3.5 rounded-lg text-[14px] transition-all flex justify-center items-center mb-3"
                >
                  <CheckCircle2 size={16} className="mr-2" /> Mark as Attended
                </button>
              )}

              {tab === "Active" ? (
                <div className="space-y-3">
                  {selectedEvent.has_applied ? (
                    <button
                      onClick={() => handleAction()}
                      disabled={applying}
                      className="w-full bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-900/50 font-bold py-3.5 rounded-lg text-[14px] flex justify-center items-center"
                    >
                      {applying ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Remove Interest"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction()}
                      disabled={applying}
                      className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg font-bold py-3.5 rounded-lg text-[14px] flex justify-center items-center"
                    >
                      {applying ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Register as Interested"
                      )}
                    </button>
                  )}
                  <a
                    href={`tel:${selectedEvent.coordinator_phone || "+919876543210"}`}
                    className="w-full flex items-center justify-center gap-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] font-semibold py-3.5 rounded-lg text-[14px]"
                  >
                    <Phone size={14} className="text-[var(--brand)]" />
                    <span>Call Coordinator</span>
                  </a>
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

              <button
                type="button"
                onClick={() => shareEvent(selectedEvent)}
                className="w-full flex items-center justify-center gap-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] font-semibold py-3.5 rounded-lg text-[14px] mt-3"
              >
                <Share2 size={14} className="text-[var(--brand)]" />
                <span>Share Event Link</span>
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </MobileLayout>
  );
}
