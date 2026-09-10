import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicEventBySlug, getPublicEventById } from "@/lib/data/events";
import { getMyRole } from "@/lib/data/profiles";
import { APP_NAME } from "@/lib/brand";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ slug: string }> };

/**
 * Share links land here, then open the same public board + detail sheet
 * as /events (no separate back-button detail page).
 */
export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params;

  if (UUID_RE.test(slug)) {
    const byId = await getPublicEventById(slug);
    if (byId?.slug) redirect(`/events?event=${encodeURIComponent(byId.slug)}`);
  }

  const event = await getPublicEventBySlug(slug);
  if (event?.slug) {
    redirect(`/events?event=${encodeURIComponent(event.slug)}`);
  }

  const session = await getMyRole().catch(() => null);

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
        <Link href="/events" className="text-[var(--brand)] font-bold text-sm">
          Browse events
        </Link>
        {!session && (
          <Link href="/login" className="text-[var(--text-muted)] font-bold text-sm block">
            Sign in to {APP_NAME}
          </Link>
        )}
      </div>
    </div>
  );
}
