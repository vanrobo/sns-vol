"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Smartphone, X, Monitor, Share } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { APP_NAME } from "@/lib/brand";

type InstallGuide = "ios-safari" | "mac-safari" | "other";

function detectInstallGuide(): InstallGuide {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|CriOS|Chromium|Edg|EdgiOS|FxiOS|OPR/i.test(ua);
  if (isIOS) return "ios-safari";
  if (isSafari && /Macintosh|Mac OS X/.test(ua)) return "mac-safari";
  return "other";
}

export default function InstallAppSetting() {
  const { showInstallOption, canInstall, installed, install } = usePWAInstall();
  const installGuide = useMemo(() => detectInstallGuide(), []);
  const [showSafariHelp, setShowSafariHelp] = useState(
    installGuide !== "other",
  );
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  if (installed || !showInstallOption) return null;

  const isSafariGuide =
    installGuide === "ios-safari" || installGuide === "mac-safari";

  const handleInstall = async () => {
    if (canInstall) {
      const ok = await install();
      if (ok) toast.success("App installed!");
      else toast.error("Install cancelled");
      return;
    }
    if (isSafariGuide) {
      setShowSafariHelp((v) => !v);
      setShowAndroidHelp(false);
      return;
    }
    setShowAndroidHelp((v) => !v);
    setShowSafariHelp(false);
  };

  const subtitle = canInstall
    ? `Add ${APP_NAME} to your home screen for quick access`
    : installGuide === "ios-safari"
      ? "Safari on iPhone — steps below"
      : installGuide === "mac-safari"
        ? "Safari on Mac — tap for Add to Dock steps"
        : "Tap for install steps from your browser menu";

  const actionLabel = canInstall
    ? "Install now"
    : installGuide === "ios-safari"
      ? "Safari"
      : installGuide === "mac-safari"
        ? "Safari"
        : "How to";

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
              {subtitle}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] shrink-0">
          {actionLabel}
        </span>
      </button>

      {showSafariHelp && installGuide === "ios-safari" && (
        <div className="mx-4 mb-4 p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-[var(--brand)]" />
            <p className="font-bold text-sm">Install on iPhone / iPad (Safari)</p>
          </div>
          <ol className="text-xs text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Open this site in <strong>Safari</strong> (not Chrome or in-app
              browser)
            </li>
            <li>
              Tap the <Share size={12} className="inline -mt-0.5" /> Share
              button (bottom on iPhone, top on iPad)
            </li>
            <li>Scroll and choose &ldquo;Add to Home Screen&rdquo;</li>
            <li>Tap Add — the app icon appears on your home screen</li>
          </ol>
        </div>
      )}

      {showSafariHelp && installGuide === "mac-safari" && (
        <div className="mx-4 mb-4 p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] space-y-3">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-[var(--brand)]" />
            <p className="font-bold text-sm">Install on Mac (Safari)</p>
          </div>
          <ol className="text-xs text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              In <strong>Safari</strong>, open the Share menu (toolbar) or the
              File menu
            </li>
            <li>
              Choose &ldquo;Add to Dock&rdquo; (or &ldquo;Add to Home Screen&rdquo;
              on older macOS)
            </li>
            <li>Confirm the name and click Add</li>
            <li>Open {APP_NAME} from your Dock like a regular app</li>
          </ol>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            Requires Safari 17+ on macOS Sonoma or later for Add to Dock.
          </p>
        </div>
      )}

      {showAndroidHelp && installGuide === "other" && (
        <div className="mx-4 mb-4 p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-[var(--brand)]" />
              <p className="font-bold text-sm">Install from Chrome / Edge</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAndroidHelp(false)}
              aria-label="Close"
            >
              <X size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>
          <ol className="text-xs text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              In Chrome / Edge: menu (⋮) → &ldquo;Install app&rdquo; or
              &ldquo;Add to Home screen&rdquo;
            </li>
            <li>Or use the install icon in the address bar if shown</li>
            <li>Open the installed app from your home screen or app list</li>
          </ol>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[var(--border)]">
            On iPhone, use <strong>Safari</strong> instead — Chrome cannot
            install PWAs to the home screen.
          </p>
        </div>
      )}
    </>
  );
}
