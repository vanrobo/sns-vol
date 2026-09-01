"use client";

import MobileLayout from "@/components/MobileLayout";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getMyApplications, type MyApplication } from "@/lib/data/applications";
import { titleCaseStatus } from "@/types";
import { Calendar, MapPin, Loader2, ClipboardList, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      setApps(await getMyApplications());
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not load applications.";
      setError(msg);
      if (!opts?.silent) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    haptic("light");
    await load({ silent: true });
    haptic("success");
  }, [load]);

  return (
    <MobileLayout onRefresh={refresh}>
      <div className="p-5 space-y-6 pb-28">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <ClipboardList size={22} className="text-[var(--brand)] shrink-0" />
              <h1 className="text-xl font-black tracking-tight">Applied</h1>
            </div>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-50"
              aria-label="Refresh applications"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Every event you&apos;ve marked as interested, with your current
            status.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
          </div>
        ) : error ? (
          <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="text-sm font-bold text-[var(--brand)]"
            >
              Try again
            </button>
          </div>
        ) : apps.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-xl p-10 text-center text-sm text-[var(--text-muted)] leading-relaxed">
            No applications yet. Once approved, browse events on Home and tap
            Interested to apply.
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
                  {app.event_date || "Date TBA"}
                </p>
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--brand)]" />
                  {app.event_venue || "Venue TBA"}
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
