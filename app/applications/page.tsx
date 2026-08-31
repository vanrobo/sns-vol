"use client";

import MobileLayout from "@/components/MobileLayout";
import { useEffect, useState, useCallback } from "react";
import { getMyApplications, type MyApplication } from "@/lib/data/applications";
import { titleCaseStatus } from "@/types";
import { Calendar, MapPin, Loader2, ClipboardList } from "lucide-react";
import { haptic } from "@/lib/haptics";

function statusClass(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/10 text-[var(--brand)]";
    case "declined":
      return "border-red-500/30 bg-red-500/10 text-red-600";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setApps(await getMyApplications());
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    haptic("light");
    await load();
    haptic("success");
  }, [load]);

  return (
    <MobileLayout onRefresh={refresh}>
      <div className="p-5 space-y-6 pb-28">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList size={22} className="text-[var(--brand)]" />
            <h1 className="text-xl font-black tracking-tight">My Applications</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Every event you&apos;ve marked as interested, with your current
            application status.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
          </div>
        ) : apps.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-xl p-10 text-center text-sm text-[var(--text-muted)]">
            No applications yet. Browse events on Home and tap Interested.
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base leading-tight">
                    {app.event_title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusClass(app.status)}`}
                  >
                    {titleCaseStatus(app.status)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar size={12} className="text-[var(--brand)]" />
                  {app.event_date}
                </p>
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--brand)]" />
                  {app.event_venue}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  Event {titleCaseStatus(app.event_status)} · Applied{" "}
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
