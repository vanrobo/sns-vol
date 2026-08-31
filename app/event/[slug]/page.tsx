import { redirect } from "next/navigation";
import {
  Calendar,
  MapPin,
  Target,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getPublicEventBySlug, getPublicEventById } from "@/lib/data/events";
import { getMyRole } from "@/lib/data/profiles";
import { APP_NAME } from "@/lib/brand";
import { titleCaseStatus } from "@/types";
import type { ProfileStatus, UserRole } from "@/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ slug: string }> };

function appHomeForUser(role: UserRole, status: ProfileStatus): string {
  if (role === "admin") return "/admin";
  if (role === "organiser") return "/organiser";
  if (status === "pending") return "/pending";
  return "/";
}

function appHomeLabel(role: UserRole, status: ProfileStatus): string {
  if (role === "admin") return "Open Admin Dashboard";
  if (role === "organiser") return "Open Organiser Dashboard";
  if (status === "pending") return "Continue Your Application";
  return `Open in ${APP_NAME}`;
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params;
  const session = await getMyRole();

  if (UUID_RE.test(slug)) {
    const byId = await getPublicEventById(slug);
    if (byId?.slug) redirect(`/event/${byId.slug}`);
  }

  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] tracking-tight">
        <header className="sticky top-0 z-50 px-5 py-4 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
          <p className="text-sm font-bold text-[var(--brand)]">{APP_NAME}</p>
        </header>
        <div className="text-center py-20 px-6 space-y-4">
          <h1 className="text-xl font-bold">Event not found</h1>
          <p className="text-sm text-[var(--text-muted)]">
            This link may be invalid or the event was removed.
          </p>
          <Link href={session ? appHomeForUser(session.role, session.status) : "/login"} className="text-[var(--brand)] font-bold text-sm">
            {session ? `Back to ${APP_NAME}` : `Sign in to ${APP_NAME}`}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] tracking-tight">
      <header className="sticky top-0 z-50 px-5 py-4 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
        <p className="text-sm font-bold text-[var(--brand)]">{APP_NAME}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {session ? `Signed in as ${session.name}` : "Public event preview"}
        </p>
      </header>

      <div className="p-5 space-y-5 pb-10">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--brand)]/30 bg-[var(--brand)]/10 text-[var(--brand)]">
            {event.category}
          </span>
          <span
            className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${event.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}
          >
            {titleCaseStatus(event.status)}
          </span>
          <h1 className="text-2xl font-black tracking-tight leading-tight pt-2">
            {event.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <Calendar size={18} className="text-[var(--brand)] mb-2" />
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">
              Date
            </p>
            <p className="font-semibold">{event.date}</p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-emerald-500 transition-colors"
          >
            <MapPin size={18} className="text-[var(--brand)] mb-2" />
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 flex items-center gap-1">
              Venue <ExternalLink size={10} />
            </p>
            <p className="font-semibold text-emerald-600">{event.venue}</p>
          </a>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-sm">About this event</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {event.description}
          </p>
          <div className="pt-3 border-t border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2 flex items-center gap-1">
              <Target size={12} className="text-[var(--brand)]" /> Requirements
            </p>
            <p className="text-sm font-medium">{event.criteria}</p>
            {event.required_skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {event.required_skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[var(--brand)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {event.status === "active" && (
          <div className="space-y-3 pt-2">
            {session ? (
              <Link
                href={appHomeForUser(session.role, session.status)}
                className="block w-full text-center bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-3.5 rounded-xl shadow-lg"
              >
                {appHomeLabel(session.role, session.status)}
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="block w-full text-center bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-3.5 rounded-xl shadow-lg"
                >
                  Sign up to volunteer
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center bg-[var(--surface)] border border-[var(--border)] font-bold py-3.5 rounded-xl text-sm"
                >
                  Already have an account? Log in
                </Link>
              </>
            )}
          </div>
        )}

        {event.status !== "active" && session && (
          <Link
            href={appHomeForUser(session.role, session.status)}
            className="block w-full text-center bg-[var(--surface)] border border-[var(--border)] font-bold py-3.5 rounded-xl text-sm"
          >
            {appHomeLabel(session.role, session.status)}
          </Link>
        )}
      </div>
    </div>
  );
}
