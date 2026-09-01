"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Bell,
  Loader2,
} from "lucide-react";
import type { Profile } from "@/types";
import { titleCaseStatus } from "@/types";
import {
  adminDeleteVolunteer,
  broadcastNotification,
  completeAccountDeletion,
} from "@/lib/data/admin";

type Props = {
  volunteer: Profile | null;
  email?: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function VolunteerDetailModal({
  volunteer,
  email,
  onClose,
  onUpdated,
}: Props) {
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!volunteer) return null;

  const sendNotif = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error("Title and message required.");
      return;
    }
    setBusy(true);
    try {
      await broadcastNotification({
        title: notifTitle.trim(),
        body: notifBody.trim(),
        userIds: [volunteer.id],
      });
      toast.success("In-app alert sent!");
      setNotifTitle("");
      setNotifBody("");
    } catch {
      toast.error("Failed to send notification.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Deactivate ${volunteer.name}'s account? They will lose access immediately.`,
      )
    )
      return;
    setBusy(true);
    try {
      await adminDeleteVolunteer(volunteer.id);
      toast.success("Account deactivated.");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to deactivate account.");
    } finally {
      setBusy(false);
    }
  };

  const handleCompleteDeletion = async () => {
    if (
      !confirm(
        `Permanently delete ${volunteer.name}'s account? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      await completeAccountDeletion(volunteer.id);
      toast.success("Account deletion completed.");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to complete deletion.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[var(--surface)] rounded-t-2xl sm:rounded-2xl border border-[var(--border)] shadow-2xl">
        <div className="sticky top-0 flex justify-between items-center p-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <h2 className="font-bold text-lg">{volunteer.name}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#18181B]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {titleCaseStatus(volunteer.role)}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {titleCaseStatus(volunteer.status)}
            </span>
            {volunteer.delete_requested_at && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                Delete requested
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {email && (
              <p className="flex items-center gap-2 text-[var(--text-muted)]">
                <Mail size={14} className="text-[var(--brand)] shrink-0" />
                {email}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--brand)] shrink-0" />
              {volunteer.phone || "-"}
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="text-[var(--brand)] shrink-0 mt-0.5" />
              {volunteer.address || "-"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Concern Center: {volunteer.college || "-"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Batch / area: {volunteer.batch || "-"}
            </p>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              ID: {volunteer.volunteer_id || "Not issued"}
            </p>
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-2">
            <p className="text-xs font-bold uppercase text-[var(--text-muted)]">
              In-app alert (shows in Alert Hub)
            </p>
            <input
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
            />
            <textarea
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              placeholder="Message"
              rows={2}
              className="w-full p-2.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm resize-none"
            />
            <button
              type="button"
              disabled={busy}
              onClick={sendNotif}
              className="w-full flex items-center justify-center gap-2 bg-[var(--brand)] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Bell size={16} />}
              Send in-app alert
            </button>
          </div>

          {volunteer.delete_requested_at && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-3 space-y-2">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">
                Deletion requested{" "}
                {new Date(volunteer.delete_requested_at).toLocaleDateString()}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleCompleteDeletion}
                className="w-full flex items-center justify-center gap-2 bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                <Trash2 size={16} /> Confirm permanent deletion
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            <Trash2 size={16} /> Deactivate account
          </button>
        </div>
      </div>
    </div>
  );
}
