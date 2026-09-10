"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Event, UserRole } from "@/types";
import PublicEventsBoard from "@/components/events/PublicEventsBoard";

type SessionInfo = {
  name: string;
  role: UserRole;
} | null;

type Props = {
  events: Event[];
  session: SessionInfo;
};

function BoardWithDeepLink({ events, session }: Props) {
  const searchParams = useSearchParams();
  const eventSlug = searchParams.get("event");

  return (
    <PublicEventsBoard
      events={events}
      session={session}
      initialEventSlug={eventSlug}
    />
  );
}

export default function PublicEventsClient({ events, session }: Props) {
  return (
    <Suspense
      fallback={<PublicEventsBoard events={events} session={session} />}
    >
      <BoardWithDeepLink events={events} session={session} />
    </Suspense>
  );
}
