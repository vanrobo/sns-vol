import Link from "next/link";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { getPublicEvents } from "@/lib/data/events";
import { getMyRole } from "@/lib/data/profiles";
import { APP_NAME } from "@/lib/brand";
import type { Event } from "@/types";

export const metadata = {
  title: `Events · ${APP_NAME}`,
  description: "Browse SNS Family volunteer events — no login required",
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

export default async function PublicEventsPage() {
  const [events, session] = await Promise.all([getPublicEvents(), getMyRole()]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] tracking-tight">
      <header className="sticky top-0 z-50 px-5 py-4 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--brand)]">{APP_NAME}</p>
            <h1 className="text-xl font-black tracking-tight mt-0.5">Events</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {session
                ? `Signed in as ${session.name}`
                : "Public list — no login needed"}
            </p>
          </div>
          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/"}
              className="shrink-0 text-xs font-bold text-[var(--brand)] pt-1"
            >
              Open app
            </Link>
          ) : (
            <Link
              href="/login"
              className="shrink-0 text-xs font-bold text-[var(--brand)] pt-1"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="p-5 space-y-4 pb-12">
        {events.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <p className="text-lg font-bold">No open events right now</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Check back soon, or sign in if you already volunteer with us.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
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

        {!session && (
          <div className="pt-4 space-y-3 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed text-center">
              Want awards, attendance, and your I-Card? Use the full app.
            </p>
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
          </div>
        )}
      </main>
    </div>
  );
}
