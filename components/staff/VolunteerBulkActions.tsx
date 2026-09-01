"use client";

import { useState } from "react";
import { X, CheckCircle2, Users, Bell, Loader2 } from "lucide-react";

type VolunteerBulkActionsProps = {
  count: number;
  actioningId: string | null;
  onClear: () => void;
  onApprove: () => void;
  onSetBatch: (batch: string) => void;
  onSendAlert: (title: string, body: string) => void;
};

export default function VolunteerBulkActions({
  count,
  actioningId,
  onClear,
  onApprove,
  onSetBatch,
  onSendAlert,
}: VolunteerBulkActionsProps) {
  const [panel, setPanel] = useState<"batch" | "notify" | null>(null);
  const [batch, setBatch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (count === 0) return null;

  const closePanel = () => setPanel(null);

  const submitBatch = () => {
    onSetBatch(batch);
    setBatch("");
    closePanel();
  };

  const submitAlert = () => {
    onSendAlert(title, body);
    setTitle("");
    setBody("");
    closePanel();
  };

  return (
    <>
      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-[var(--brand)]">
              {count} selected
            </p>
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-bold text-red-500 px-2 py-1"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={actioningId === "bulk-approve"}
              onClick={onApprove}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold disabled:opacity-50"
            >
              {actioningId === "bulk-approve" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Approve
            </button>
            <button
              type="button"
              onClick={() => setPanel("batch")}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18181B] text-[10px] font-bold"
            >
              <Users size={16} className="text-[var(--brand)]" />
              Set batch
            </button>
            <button
              type="button"
              onClick={() => setPanel("notify")}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18181B] text-[10px] font-bold"
            >
              <Bell size={16} className="text-[var(--brand)]" />
              Alert selected
            </button>
          </div>
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">
                {panel === "batch" ? "Set batch" : "Alert selected volunteers"}
              </h3>
              <button type="button" onClick={closePanel} aria-label="Close">
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {panel === "batch" ? (
              <>
                <p className="text-xs text-[var(--text-muted)]">
                  Apply a batch / area label to all {count} selected volunteers.
                </p>
                <input
                  type="text"
                  placeholder="e.g. Sector 2, Delhi North"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
                />
                <button
                  type="button"
                  disabled={actioningId === "bulk-batch"}
                  onClick={submitBatch}
                  className="w-full py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actioningId === "bulk-batch" && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Apply to {count} volunteer{count === 1 ? "" : "s"}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[var(--text-muted)]">
                  Sends only to the {count} checked volunteer
                  {count === 1 ? "" : "s"}. Use Broadcast above for all active.
                </p>
                <input
                  type="text"
                  placeholder="Alert title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
                />
                <textarea
                  placeholder="Message body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm resize-none"
                />
                <button
                  type="button"
                  disabled={actioningId === "bulk-notify"}
                  onClick={submitAlert}
                  className="w-full py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actioningId === "bulk-notify" && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Send alert
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
