"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Loader2, Users } from "lucide-react";
import { broadcastNotification } from "@/lib/data/admin";
import { SNS_CENTERS } from "@/lib/centers";
import type { Profile } from "@/types";

type Props = {
  users: Profile[];
  batches: string[];
};

function activeVolunteers(users: Profile[]) {
  return users.filter((u) => u.role === "volunteer" && u.status === "active");
}

function countRecipients(
  users: Profile[],
  target: "all" | "batch" | "center",
  batch: string,
  center: string,
): number {
  const active = activeVolunteers(users);

  if (target === "all") return active.length;
  if (target === "batch") {
    return active.filter((u) => u.batch === batch).length;
  }
  if (!center) return 0;
  return active.filter((u) => u.college === center).length;
}

export default function NotificationBroadcastPanel({ users, batches }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [target, setTarget] = useState<"all" | "batch" | "center">("all");
  const [batch, setBatch] = useState("");
  const [center, setCenter] = useState("");
  const [busy, setBusy] = useState(false);

  const activeCount = useMemo(() => activeVolunteers(users).length, [users]);

  const recipientCount = useMemo(
    () => countRecipients(users, target, batch, center),
    [users, target, batch, center],
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
    if (target === "center" && !center) {
      toast.error("Select a concern center.");
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
        link: link.trim() || undefined,
        all: target === "all",
        batch: target === "batch" ? batch : undefined,
        center: target === "center" ? center : undefined,
      });
      toast.success(`In-app alert sent to ${count} active volunteer(s).`);
      setTitle("");
      setBody("");
      setLink("");
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
        ? `batch "${batch || "…"}"`
        : `center "${center || "…"}"`;

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"
    >
      <div>
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Bell size={16} className="text-[var(--brand)]" /> Notify volunteers
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
          Send an in-app alert to active volunteers. {activeCount} active now.
        </p>
      </div>

      <select
        value={target}
        onChange={(e) => setTarget(e.target.value as typeof target)}
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-xs font-bold"
      >
        <option value="all">All active volunteers ({activeCount})</option>
        <option value="batch">By batch / area</option>
        <option value="center">By concern center</option>
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

      {target === "center" && (
        <select
          value={center}
          onChange={(e) => setCenter(e.target.value)}
          required
          className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-xs font-bold"
        >
          <option value="">Select concern center</option>
          {SNS_CENTERS.map((c) => (
            <option key={c} value={c}>
              {c}
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
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Optional link (https://…)"
        type="url"
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
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
        Send to {recipientCount} active volunteer{recipientCount === 1 ? "" : "s"}
      </button>
    </form>
  );
}
