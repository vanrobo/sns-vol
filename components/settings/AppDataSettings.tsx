"use client";

import toast from "react-hot-toast";
import { Database } from "lucide-react";
import { clearAppCaches } from "@/lib/home-cache";

export default function AppDataSettings() {
  const clearCache = () => {
    if (
      !window.confirm(
        "Clear saved offline data? The app will reload fresh content on next visit.",
      )
    ) {
      return;
    }
    clearAppCaches();
    toast.success("Offline cache cleared");
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
      <button
        type="button"
        onClick={clearCache}
        className="w-full p-4 px-5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Database size={16} className="text-slate-400 shrink-0" />
          <div>
            <span className="font-semibold text-sm block">Clear offline cache</span>
            <p className="text-[10px] text-[var(--text-muted)]">
              Removes locally saved events, profile, and alerts
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

export const APP_VERSION = "0.1.0";

export function AppVersionCard() {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-4 px-5">
      <p className="font-semibold text-sm">App version</p>
      <p className="text-[11px] text-[var(--text-muted)] mt-1">v{APP_VERSION}</p>
    </div>
  );
}
