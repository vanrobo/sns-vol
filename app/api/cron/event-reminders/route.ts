import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function formatEventTime(time: string | null | undefined): string {
  if (!time) return "";
  return time.slice(0, 5);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 },
    );
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, date, time_start, venue")
    .eq("status", "active")
    .in("date", [today, tomorrowStr]);

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  let sent = 0;

  for (const event of events ?? []) {
    const isTomorrow = event.date === tomorrowStr;
    const title = isTomorrow ? "Event tomorrow" : "Event today";
    const timeLabel = formatEventTime(event.time_start);
    const body = `${event.title}${timeLabel ? ` at ${timeLabel}` : ""} at ${event.venue}`;

    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("id, user_id")
      .eq("event_id", event.id)
      .eq("status", "approved")
      .is("reminder_sent_at", null);

    if (appsError) continue;

    for (const app of apps ?? []) {
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: app.user_id,
        title,
        body,
        type: "event",
      });
      if (notifError) continue;

      await supabase
        .from("applications")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", app.id);

      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
