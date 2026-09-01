"use client";

import toast from "react-hot-toast";
import Link from "next/link";
import { Bug, Bell, Database, ChevronDown } from "lucide-react";
import { APP_VERSION } from "@/components/settings/AppDataSettings";
import { clearAppCaches } from "@/lib/home-cache";
import {
  canUseBrowserNotifications,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from "@/lib/push/browser-notifications";
import { showNotificationAlertToast } from "@/components/NotificationAlertToast";

export default function DeveloperToolsPanel() {
  const sendTestAlert = async () => {
    if (!canUseBrowserNotifications()) {
      toast.error("Browser alerts not supported here.");
      return;
    }
    const perm = await requestBrowserNotificationPermission();
    if (perm !== "granted") {
      toast.error("Allow notifications in browser settings first.");
      return;
    }
    showNotificationAlertToast({
      id: "test-alert-dev",
      user_id: "",
      title: "Test alert",
      body: "Developer mode test — in-app toast and browser notification.",
      type: "event",
      read_at: null,
      created_at: new Date().toISOString(),
    });
    showBrowserNotification(
      "Test alert",
      "Developer mode browser notification test.",
      "/notifications",
      "test-alert-dev",
    );
    toast.success("Test alert sent");
  };

  const clearCache = () => {
    clearAppCaches();
    toast.success("Offline cache cleared");
  };

  return (
    <div className="border-t border-[var(--border)] bg-slate-50/80 dark:bg-[#18181B]/80">
      <div className="p-4 px-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Developer tools
        </p>

        <button
          type="button"
          onClick={sendTestAlert}
          className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-[#222] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-[var(--brand)] shrink-0" />
            <span className="font-semibold text-sm">Send test alert</span>
          </div>
          <ChevronDown size={14} className="-rotate-90 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={clearCache}
          className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-[#222] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database size={16} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-sm">Clear offline cache</span>
          </div>
        </button>

        <Link
          href="/notifications"
          className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#222] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bug size={16} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-sm">Open alert history</span>
          </div>
          <ChevronDown size={14} className="-rotate-90 text-slate-400" />
        </Link>

        <p className="text-[10px] text-[var(--text-muted)] font-mono pt-1">
          build v{APP_VERSION} · {typeof window !== "undefined" ? window.location.host : ""}
        </p>
      </div>
    </div>
  );
}
