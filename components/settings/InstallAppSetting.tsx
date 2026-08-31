"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { APP_NAME } from "@/lib/brand";

export default function InstallAppSetting() {
  const { showInstallOption, canInstall, isIOSDevice, installed, install } =
    usePWAInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (installed) {
    return (
      <div className="p-4 px-5 flex items-center gap-3">
        <Download size={16} className="text-[var(--brand)] shrink-0" />
        <div>
          <span className="font-semibold text-sm block">App installed</span>
          <p className="text-[10px] text-[var(--text-muted)]">
            {APP_NAME} is on your home screen
          </p>
        </div>
      </div>
    );
  }

  if (!showInstallOption) return null;

  const handleInstall = async () => {
    if (isIOSDevice && !canInstall) {
      setShowIosHelp(true);
      return;
    }
    const ok = await install();
    if (ok) toast.success("App installed!");
    else toast.error("Install cancelled");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="w-full p-4 px-5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Download size={16} className="text-[var(--brand)] shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-sm block">Install app</span>
            <p className="text-[10px] text-[var(--text-muted)] leading-snug">
              Add {APP_NAME} to your home screen for quick access
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] shrink-0">
          Install
        </span>
      </button>

      {showIosHelp && (
        <div className="mx-4 mb-4 p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-[var(--brand)]" />
              <p className="font-bold text-sm">Install on iPhone</p>
            </div>
            <button type="button" onClick={() => setShowIosHelp(false)} aria-label="Close">
              <X size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>
          <ol className="text-xs text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>Open this site in Safari</li>
            <li>Tap the Share button</li>
            <li>Choose &ldquo;Add to Home Screen&rdquo;</li>
            <li>Tap Add</li>
          </ol>
        </div>
      )}
    </>
  );
}
