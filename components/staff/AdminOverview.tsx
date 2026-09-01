"use client";

import {
  Calendar,
  Users,
  AlertCircle,
  ClipboardList,
  Plus,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { AdminData } from "@/types";

type AdminOverviewProps = {
  data: AdminData;
  staffName: string;
  onNavigate: (tab: string) => void;
  onCreateEvent: () => void;
};

export default function AdminOverview({
  data,
  staffName,
  onNavigate,
  onCreateEvent,
}: AdminOverviewProps) {
  const activeEvents = data.events.filter((e) => e.status === "active").length;
  const volunteers = data.users.filter((u) => u.role === "volunteer");
  const pendingVolunteers = volunteers.filter((v) => v.status !== "active");
  const openGrievances = data.grievances.filter((g) => g.status === "open");
  const pendingApps = data.applications.filter((a) => a.status === "pending");

  const attention = [
    pendingVolunteers.length > 0 && {
      key: "volunteers",
      label: `${pendingVolunteers.length} volunteer${pendingVolunteers.length === 1 ? "" : "s"} awaiting approval`,
      sub: "Review pending I-Cards",
      icon: Users,
      tone: "amber" as const,
      tab: "volunteers",
    },
    pendingApps.length > 0 && {
      key: "apps",
      label: `${pendingApps.length} pending request${pendingApps.length === 1 ? "" : "s"}`,
      sub: "Approve or decline event interest",
      icon: ClipboardList,
      tone: "blue" as const,
      tab: "applications",
    },
    openGrievances.length > 0 && {
      key: "grievances",
      label: `${openGrievances.length} open grievance${openGrievances.length === 1 ? "" : "s"}`,
      sub: "Review on Dashboard",
      icon: AlertCircle,
      tone: "red" as const,
      tab: "overview",
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    sub: string;
    icon: typeof Users;
    tone: "amber" | "blue" | "red";
    tab: string;
  }>;

  const statCards = [
    {
      label: "Live events",
      value: activeEvents,
      icon: Calendar,
      className: "from-emerald-500/15 to-emerald-600/5 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Volunteers",
      value: volunteers.length,
      icon: Users,
      className: "from-blue-500/15 to-blue-600/5 text-blue-700 dark:text-blue-300",
    },
    {
      label: "Pending",
      value: pendingVolunteers.length,
      icon: Sparkles,
      className: "from-amber-500/15 to-amber-600/5 text-amber-700 dark:text-amber-300",
    },
    {
      label: "Open cases",
      value: openGrievances.length,
      icon: AlertCircle,
      className: "from-rose-500/15 to-rose-600/5 text-rose-700 dark:text-rose-300",
    },
  ];

  const toneBorder = {
    amber: "border-amber-200 dark:border-amber-900/50",
    blue: "border-blue-200 dark:border-blue-900/50",
    red: "border-rose-200 dark:border-rose-900/50",
  };

  const toneBg = {
    amber: "bg-amber-50 dark:bg-amber-950/30",
    blue: "bg-blue-50 dark:bg-blue-950/30",
    red: "bg-rose-50 dark:bg-rose-950/30",
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--brand)] to-emerald-800 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            Hi, {staffName.split(" ")[0]}
          </h1>
          <p className="text-sm text-white/80 mt-1 leading-relaxed">
            Here&apos;s what needs your attention today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map(({ label, value, icon: Icon, className }) => (
          <div
            key={label}
            className={`rounded-xl border border-[var(--border)] bg-gradient-to-br p-3.5 ${className}`}
          >
            <Icon size={18} className="mb-2 opacity-80" />
            <p className="text-2xl font-black leading-none">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={onCreateEvent}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--brand)] text-white text-xs font-bold shadow-md"
        >
          <Plus size={14} /> New event
        </button>
        <button
          type="button"
          onClick={() => onNavigate("volunteers")}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-bold"
        >
          <Bell size={14} className="text-[var(--brand)]" /> Broadcast
        </button>
        <button
          type="button"
          onClick={() => onNavigate("applications")}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-bold"
        >
          <ClipboardList size={14} className="text-[var(--brand)]" /> Requests
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Needs attention
        </h2>
        {attention.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
            All caught up. Nothing urgent right now.
          </div>
        ) : (
          attention.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.tab)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left active:scale-[0.99] transition-transform ${toneBorder[item.tone]} ${toneBg[item.tone]}`}
              >
                <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">{item.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {item.sub}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
