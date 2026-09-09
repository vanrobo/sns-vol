import Link from "next/link";
import { getPublicEvents } from "@/lib/data/events";
import { getMyRole } from "@/lib/data/profiles";
import { APP_NAME } from "@/lib/brand";
import PublicEventsBoard from "@/components/events/PublicEventsBoard";

export const metadata = {
  title: `Events · ${APP_NAME}`,
  description: "Browse SNS Family volunteer events — no login required",
};

export default async function PublicEventsPage() {
  let events: Awaited<ReturnType<typeof getPublicEvents>> = [];
  let session: Awaited<ReturnType<typeof getMyRole>> = null;

  try {
    events = await getPublicEvents();
  } catch (err) {
    console.error("getPublicEvents failed", err);
  }

  try {
    session = await getMyRole();
  } catch {
    /* public visitors may have no session */
  }

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

      <main className="p-5 space-y-6 pb-12">
        <PublicEventsBoard events={events} />

        {!session && (
          <div className="pt-2 space-y-3 border-t border-[var(--border)]">
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
