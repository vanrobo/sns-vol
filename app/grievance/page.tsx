// app/grievance/page.tsx
"use client";

import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getUserGrievances, submitGrievance } from "@/lib/data/grievances";
import type { Grievance } from "@/types";
import { titleCaseStatus } from "@/types";
import {
  AlertCircle,
  Send,
  Loader2,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function GrievancePage() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Staff Misconduct");
  const [submitting, setSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [pastTickets, setPastTickets] = useState<Grievance[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    getUserGrievances()
      .then(setPastTickets)
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoadingTickets(false));
  }, []);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const text = e.target.value;
    setDescription(text);
    const lowerText = text.toLowerCase();
    if (lowerText.includes("certificate") || lowerText.includes("badge")) {
      setRecommendation(
        "Tip: Contact your coordinator for certificate requests.",
      );
    } else if (
      lowerText.includes("harassment") ||
      lowerText.includes("abuse") ||
      lowerText.includes("unsafe") ||
      lowerText.includes("late") ||
      lowerText.includes("rude")
    ) {
      setRecommendation(
        "URGENT: Your safety and experience is our priority. This complaint will be flagged to the highest admin level immediately.",
      );
    } else {
      setRecommendation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim())
      return toast.error("Please describe your complaint in detail.");

    setSubmitting(true);
    try {
      const ticket = await submitGrievance(category, description);
      toast.success("Complaint Submitted.");
      setPastTickets([ticket, ...pastTickets]);
      setDescription("");
      setCategory("Staff Misconduct");
      setRecommendation(null);
    } catch {
      toast.error("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="p-5 space-y-6 pb-28">
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
          <AlertCircle
            className="absolute -right-4 -bottom-4 text-white/20"
            size={120}
          />
          <div className="relative z-10">
            <h2 className="text-[22px] font-black tracking-tight mb-2">
              Complaint Desk
            </h2>
            <p className="text-rose-50 text-[13px] leading-relaxed font-medium">
              Submit formal complaints, safety concerns, or coordinator
              misconduct feedback.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] space-y-5 shadow-sm"
        >
          <h3 className="text-base font-bold tracking-tight">
            Submit a Formal Complaint
          </h3>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Complaint Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--surface-input)] border-none rounded-lg p-3.5 text-sm outline-none font-bold"
            >
              <option value="Staff Misconduct">
                Staff / Coordinator Misconduct
              </option>
              <option value="Safety Concern">Safety Concern / Hazard</option>
              <option value="Timeline Issue">
                Campaign / Time Log Dispute
              </option>
              <option value="Inappropriate Content">
                Other Incident / Complaint
              </option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Complaint Details
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Provide a thorough description of the incident..."
              rows={4}
              className="w-full bg-[var(--surface-input)] border-none rounded-lg p-3.5 text-sm outline-none resize-none font-medium"
            />
          </div>

          {recommendation && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${category === "Safety Concern" || category === "Staff Misconduct" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700" : "bg-gray-50 dark:bg-[#18181B] border-[var(--border)]"}`}
            >
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">
                {recommendation}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className={`w-full font-bold py-3.5 rounded-lg text-sm transition-all flex justify-center items-center gap-2 shadow-lg ${category === "Safety Concern" || category === "Staff Misconduct" ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20" : "bg-indigo-600 hover:bg-indigo-700 text-white"} disabled:opacity-50`}
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Send size={16} /> Submit Formal Complaint
              </>
            )}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wider ml-1">
            My Complaint History
          </h3>

          {loadingTickets ? (
            <TableSkeleton rows={3} />
          ) : pastTickets.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6 border border-dashed border-[var(--border)] rounded-xl">
              No complaints yet.
            </p>
          ) : (
            <div className="space-y-3">
              {pastTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-[var(--border)] bg-slate-50 dark:bg-[#18181B]">
                      {ticket.category}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${ticket.status === "resolved" ? "text-emerald-600" : "text-amber-500"}`}
                    >
                      {ticket.status === "resolved" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {titleCaseStatus(ticket.status)}
                    </span>
                  </div>

                  <p className="text-sm font-semibold mb-1 leading-relaxed">
                    {ticket.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3 font-medium">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>

                  {ticket.admin_notes && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-lg mt-2">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Admin Action Taken
                      </p>
                      <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300 leading-relaxed">
                        {ticket.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
