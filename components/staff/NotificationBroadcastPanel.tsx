"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Loader2, Users } from "lucide-react";
import { broadcastNotification } from "@/lib/data/admin";
import type { Profile } from "@/types";

type Props = {
  users: Profile[];
  batches: string[];
  regions: string[];
};

function countRecipients(
  users: Profile[],
  target: "all" | "batch" | "region",
  batch: string,
  region: string,
): number {
  const active = users.filter(
    (u) => u.role === "volunteer" && u.status === "active",
  );

  if (target === "all") return active.length;
  if (target === "batch") {
    return active.filter((u) => u.batch === batch).length;
  }
  if (!region) return 0;
  const needle = region.toLowerCase();
  return active.filter(
    (u) =>
      u.batch?.toLowerCase().includes(needle) ||
      u.address?.toLowerCase().includes(needle),
  ).length;
}

export default function NotificationBroadcastPanel({
  users,
  batches,
  regions,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "batch" | "region">("all");
  const [batch, setBatch] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);

  const recipientCount = useMemo(
    () => countRecipients(users, target, batch, region),
    [users, target, batch, region],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message required.");
      return;
    }
    if (target === "batch" && !batch) {
      toast.error("Select a batch.");
      return;
    }
    if (target === "region" && !region) {
      toast.error("Select a region.");
      return;
    }
    if (recipientCount === 0) {
      toast.error("No active volunteers match this audience.");
      return;
    }

    setBusy(true);
    try {
      const count = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        all: target === "all",
        batch: target === "batch" ? batch : undefined,
        region: target === "region" ? region : undefined,
      });
      toast.success(`In-app alert sent to ${count} volunteer(s).`);
      setTitle("");
      setBody("");
    } catch {
      toast.error("Broadcast failed.");
    } finally {
      setBusy(false);
    }
  };

  const audienceLabel =
    target === "all"
      ? "all active volunteers"
      : target === "batch"
        ? `batch “${batch || "…"}”`
        : `region “${region || "…"}”`;

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"
    >
      <div>
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Bell size={16} className="text-[var(--brand)]" /> Broadcast in-app
          alert
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
          Sends to everyone in the audience below — not the checkboxes on
          volunteer cards.
        </p>
      </div>

      <select
        value={target}
        onChange={(e) => setTarget(e.target.value as typeof target)}
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-xs font-bold"
      >
        <option value="all">All active volunteers</option>
        <option value="batch">By batch / area</option>
        <option value="region">By event region</option>
      </select>

      {target === "batch" && (
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          required
          className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-xs font-bold"
        >
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}

      {target === "region" && (
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-xs font-bold"
        >
          <option value="">Select region</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )}

      <p className="text-xs font-bold text-[var(--brand)]">
        Will reach {recipientCount} active volunteer
        {recipientCount === 1 ? "" : "s"}
        {target !== "all" ? ` in ${audienceLabel}` : ""}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Notification title"
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message body"
        rows={3}
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm resize-none"
      />
      <button
        type="submit"
        disabled={busy || recipientCount === 0}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Users size={16} />
        )}
        Send to {recipientCount} volunteer{recipientCount === 1 ? "" : "s"}
      </button>
    </form>
  );
}
