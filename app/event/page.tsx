import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicEventById } from "@/lib/data/events";

type Props = { searchParams: Promise<{ id?: string }> };

/** Legacy /event?id=uuid → /event/slug */
export default async function EventLegacyRedirectPage({ searchParams }: Props) {
  const { id } = await searchParams;

  if (id) {
    const event = await getPublicEventById(id);
    if (event?.slug) redirect(`/event/${event.slug}`);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] p-8 text-center">
      <h1 className="text-xl font-bold mb-2">Event not found</h1>
      <Link href="/signup" className="text-[var(--brand)] font-bold text-sm">
        Browse events. Sign up free
      </Link>
    </div>
  );
}
