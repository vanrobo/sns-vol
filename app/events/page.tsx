import Link from "next/link";
import { getPublicEvents } from "@/lib/data/events";
import { getMyRole } from "@/lib/data/profiles";
import { APP_NAME, APP_NAME_ACCENT, DONATE_URL } from "@/lib/brand";
import PublicEventsClient from "@/components/events/PublicEventsClient";

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

  const appHref =
    session?.role === "admin"
      ? "/admin"
      : session?.role === "organiser"
        ? "/organiser"
        : session
          ? "/"
          : "/login";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] tracking-tight">
      <header className="sticky top-0 z-50 px-5 py-4 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="min-w-0">
          <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
            SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {session ? `Hi, ${session.name.split(" ")[0]}` : "Public events"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[var(--brand)] px-2 py-1.5 rounded-lg border border-[var(--brand)]/20 hidden sm:inline"
          >
            Donate
          </a>
          <Link
            href={appHref}
            className="text-xs font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] px-3 py-2 rounded-lg"
          >
            {session ? "Open app" : "Log in"}
          </Link>
        </div>
      </header>

      <main className="p-5 space-y-6 pb-28">
        <PublicEventsClient
          events={events}
          session={
            session
              ? { name: session.name, role: session.role }
              : null
          }
        />
      </main>
    </div>
  );
}
