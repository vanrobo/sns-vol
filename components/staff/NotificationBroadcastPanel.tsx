"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Bell, Loader2, Users } from "lucide-react";
import { broadcastNotification } from "@/lib/data/admin";

type Props = {
  batches: string[];
  regions: string[];
};

export default function NotificationBroadcastPanel({ batches, regions }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "batch" | "region">("all");
  const [batch, setBatch] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message required.");
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
      toast.success(`Sent to ${count} volunteer(s).`);
      setTitle("");
      setBody("");
    } catch {
      toast.error("Broadcast failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"
    >
      <h3 className="font-bold flex items-center gap-2 text-sm">
        <Bell size={16} className="text-[var(--brand)]" /> Broadcast notification
      </h3>
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
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Users size={16} />
        )}
        Send broadcast
      </button>
    </form>
  );
}
