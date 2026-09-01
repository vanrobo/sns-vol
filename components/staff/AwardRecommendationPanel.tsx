"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Trophy, Loader2 } from "lucide-react";
import { recommendAward } from "@/lib/data/award-recommendations";

export default function AwardRecommendationPanel() {
  const [volunteerName, setVolunteerName] = useState("");
  const [awardTitle, setAwardTitle] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await recommendAward({ volunteerName, awardTitle, note });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Recommendation sent to admin.");
      setVolunteerName("");
      setAwardTitle("");
      setNote("");
    } catch {
      toast.error("Failed to send recommendation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"
    >
      <div>
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Trophy size={16} className="text-amber-500" /> Recommend for award
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
          Suggest a volunteer for an award. Admins review and grant awards from
          the Admin portal.
        </p>
      </div>
      <input
        required
        value={volunteerName}
        onChange={(e) => setVolunteerName(e.target.value)}
        placeholder="Volunteer name"
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
      />
      <input
        required
        value={awardTitle}
        onChange={(e) => setAwardTitle(e.target.value)}
        placeholder="Award title (e.g. Star Volunteer)"
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Why recommend them? (optional)"
        rows={2}
        className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm resize-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
      >
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Trophy size={16} />}
        Send to admin
      </button>
    </form>
  );
}
