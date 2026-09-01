"use client";

import {
  ShieldOff,
  Users,
  ClipboardList,
  UserX,
  ChevronRight,
} from "lucide-react";
import type { AdminData } from "@/types";

type AdminActionsPanelProps = {
  data: AdminData;
  onNavigate: (tab: string, peopleFilter?: string) => void;
};

export default function AdminActionsPanel({
  data,
  onNavigate,
}: AdminActionsPanelProps) {
  const volunteers = data.users.filter((u) => u.role === "volunteer");
  const inactiveCount = volunteers.filter((v) => v.status === "inactive").length;
  const pendingCount = volunteers.filter((v) => v.status === "pending").length;
  const pendingApps = data.applications.filter((a) => a.status === "pending").length;
  const deleteRequests = volunteers.filter((v) => v.delete_requested_at).length;

  const actions = [
    {
      key: "restrict",
      label: "Restricted accounts",
      sub:
        inactiveCount > 0
          ? `${inactiveCount} deactivated — review or reactivate`
          : "Deactivate volunteers who should lose access",
      icon: ShieldOff,
      tab: "volunteers",
      peopleFilter: "inactive",
      tone: inactiveCount > 0 ? "amber" : "slate",
    },
    {
      key: "pending-people",
      label: "Pending sign-ups",
      sub:
        pendingCount > 0
          ? `${pendingCount} awaiting I-Card approval`
          : "No new sign-ups waiting",
      icon: Users,
      tab: "volunteers",
      peopleFilter: "pending",
      tone: pendingCount > 0 ? "amber" : "slate",
    },
    {
      key: "requests",
      label: "Event requests",
      sub:
        pendingApps > 0
          ? `${pendingApps} pending — approve, decline, or change later`
          : "Review or change approved / declined requests",
      icon: ClipboardList,
      tab: "applications",
      tone: pendingApps > 0 ? "blue" : "slate",
    },
    deleteRequests > 0 && {
      key: "deletion",
      label: "Deletion requests",
      sub: `${deleteRequests} volunteer${deleteRequests === 1 ? "" : "s"} asked to delete account`,
      icon: UserX,
      tab: "volunteers",
      peopleFilter: "all",
      tone: "red" as const,
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    sub: string;
    icon: typeof ShieldOff;
    tab: string;
    peopleFilter?: string;
    tone: "amber" | "blue" | "red" | "slate";
  }>;

  const toneClass = {
    amber: "border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20",
    blue: "border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/20",
    red: "border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/20",
    slate: "border-[var(--border)] bg-[var(--surface)]",
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
        Administrative actions
      </h2>
      <p className="text-[11px] text-[var(--text-muted)] px-1 leading-relaxed">
        Restrict access, reverse event decisions, and manage account lifecycle.
      </p>
      <div className="space-y-2">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.tab, item.peopleFilter)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left active:scale-[0.99] transition-transform ${toneClass[item.tone]}`}
            >
              <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[var(--brand)]" />
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
        })}
      </div>
    </div>
  );
}
