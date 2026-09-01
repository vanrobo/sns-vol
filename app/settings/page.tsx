"use client";

import MobileLayout from "@/components/MobileLayout";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Settings,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Type,
  Minus,
  Plus,
} from "lucide-react";
import InstallAppSetting from "@/components/settings/InstallAppSetting";
import AppDataSettings from "@/components/settings/AppDataSettings";
import {
  canUseBrowserNotifications,
  isPushEnabledLocally,
  requestBrowserNotificationPermission,
  setPushEnabledLocally,
} from "@/lib/push/browser-notifications";
import {
  bumpFontScale,
  FONT_SCALE,
  readFontScale,
} from "@/lib/font-scale";
import { haptic } from "@/lib/haptics";

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(FONT_SCALE.DEFAULT);

  useEffect(() => {
    setPushEnabled(isPushEnabledLocally());
    setFontScale(readFontScale());
  }, []);

  const refresh = async () => {
    haptic("light");
    setPushEnabled(isPushEnabledLocally());
    setFontScale(readFontScale());
    haptic("success");
  };

  return (
    <MobileLayout onRefresh={refresh}>
      <div className="p-5 space-y-6 pb-28">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={22} className="text-[var(--brand)]" />
            <h1 className="text-xl font-black tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            App preferences, accessibility, alerts, and offline data.
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)] overflow-hidden">
          <div className="p-4 px-5">
            <div className="flex items-center gap-3 mb-3">
              <Type size={16} className="text-[var(--brand)]" />
              <div>
                <span className="font-semibold text-sm block">Text size</span>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Adjust font size across the app
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={fontScale <= FONT_SCALE.MIN}
                onClick={() => {
                  haptic("selection");
                  setFontScale(bumpFontScale(-FONT_SCALE.STEP));
                }}
                className="p-3 rounded-xl border border-[var(--border)] disabled:opacity-40"
                aria-label="Decrease text size"
              >
                <Minus size={18} />
              </button>
              <span className="text-sm font-bold tabular-nums">
                {Math.round(fontScale * 100)}%
              </span>
              <button
                type="button"
                disabled={fontScale >= FONT_SCALE.MAX}
                onClick={() => {
                  haptic("selection");
                  setFontScale(bumpFontScale(FONT_SCALE.STEP));
                }}
                className="p-3 rounded-xl border border-[var(--border)] disabled:opacity-40"
                aria-label="Increase text size"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)] overflow-hidden">
          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-slate-400" />
              <span className="font-semibold text-sm">Theme mode</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                  theme === "system"
                    ? "bg-[var(--brand)] text-white"
                    : "bg-slate-100 dark:bg-[#18181B] text-[var(--text-muted)]"
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="p-1.5 bg-slate-100 dark:bg-[#1C1C1E] rounded-md active:scale-95 transition-transform"
                aria-label="Toggle light or dark"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={14} className="text-yellow-500" />
                ) : (
                  <Moon size={14} className="text-blue-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)] overflow-hidden">
          <InstallAppSetting />
        </div>

        <AppDataSettings />

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          <div className="p-4 px-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Bell size={16} className="text-[var(--brand)] shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-sm block">Browser alerts</span>
                <p className="text-[10px] text-[var(--text-muted)] leading-snug">
                  Pop-ups while this site is open
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={pushEnabled}
                disabled={!canUseBrowserNotifications()}
                onChange={async () => {
                  if (!canUseBrowserNotifications()) {
                    toast.error("Notifications not supported on this device.");
                    return;
                  }
                  if (!pushEnabled) {
                    const perm = await requestBrowserNotificationPermission();
                    if (perm !== "granted") {
                      toast.error("Enable notifications in browser settings.");
                      return;
                    }
                    setPushEnabled(true);
                    setPushEnabledLocally(true);
                    toast.success("Browser alerts enabled");
                  } else {
                    setPushEnabled(false);
                    setPushEnabledLocally(false);
                    toast.success("Browser alerts disabled");
                  }
                }}
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand)] peer-disabled:opacity-40" />
            </label>
          </div>
          <Link
            href="/notifications"
            className="p-4 px-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="font-semibold text-sm">In-app alert history</span>
            <ChevronDown size={14} className="-rotate-90 text-slate-400" />
          </Link>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Edit your profile details from the{" "}
          <Link href="/profile" className="text-[var(--brand)] font-bold">
            Profile
          </Link>{" "}
          tab.
        </p>
      </div>
    </MobileLayout>
  );
}
