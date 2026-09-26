"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Clock3, LogIn, LogOut, RefreshCw } from "lucide-react";
import {
  getMyMentorPipo,
  mentorPunchIn,
  mentorPunchOut,
} from "@/lib/center/mentors";

const STATE_COPY = {
  not_started: ["Not punched in", "Punch In"],
  punched_in: ["Working day in progress", "Punch Out"],
  completed: ["Day completed", "Completed"],
} as const;

type PipoState = keyof typeof STATE_COPY;
type PipoData = Awaited<ReturnType<typeof getMyMentorPipo>>;

export default function MentorPipoPanel() {
  const [data, setData] = useState<PipoData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        setError("");
        setData(await getMyMentorPipo());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load PiPo");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const punch = () => {
    if (!data || data.state === "completed") return;
    startTransition(async () => {
      try {
        setMessage("");
        setError("");
        const next =
          data.state === "not_started"
            ? await mentorPunchIn()
            : await mentorPunchOut();
        setData(next as PipoData);
        setMessage(
          data.state === "not_started"
            ? "Punch in recorded."
            : "Punch out recorded.",
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Punch failed");
      }
    });
  };

  const state = (data?.state ?? "not_started") as PipoState;
  const [stateLabel, actionLabel] = STATE_COPY[state] ?? STATE_COPY.not_started;
  const ActionIcon = state === "punched_in" ? LogOut : LogIn;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            {data?.date || "Today"} · IST
          </p>
          <h2 className="text-lg font-black mt-0.5">
            {data?.mentor?.name || "Your attendance"}
          </h2>
          {data?.mentor && (
            <p className="text-[11px] text-[var(--text-muted)]">
              {data.mentor.id}
              {data.mentor.center ? ` · ${data.mentor.center}` : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)] py-10 text-center">
          Loading…
        </p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                state === "completed"
                  ? "bg-emerald-500"
                  : state === "punched_in"
                    ? "bg-sky-500"
                    : "bg-slate-300"
              }`}
            />
            <span className="font-semibold text-sm">{stateLabel}</span>
            {data?.approval_status && (
              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {data.approval_status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-[var(--border)] py-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                Punch in
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums">
                {data?.raw_check_in || "--:--"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                Punch out
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums">
                {data?.raw_check_out || "--:--"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={punch}
            disabled={pending || state === "completed"}
            className="w-full h-12 rounded-xl bg-[var(--brand)] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {state === "completed" ? (
              <Clock3 size={18} />
            ) : (
              <ActionIcon size={18} />
            )}
            {actionLabel}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
          {message}
        </p>
      )}
    </div>
  );
}
