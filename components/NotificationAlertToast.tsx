"use client";

import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import type { Notification } from "@/types";

const BODY_PREVIEW_CHARS = 140;

export function previewNotificationBody(body: string, max = BODY_PREVIEW_CHARS) {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function showNotificationAlertToast(notif: Notification) {
  const preview = previewNotificationBody(notif.body);
  const isTruncated = notif.body.trim().length > BODY_PREVIEW_CHARS;

  toast.custom(
    (t) => (
      <div
        role="alert"
        className={`pointer-events-auto flex w-[min(100vw-2rem,22rem)] gap-3 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-white shadow-lg ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        } transition-all duration-200`}
      >
        <Bell size={18} className="shrink-0 mt-0.5 opacity-90" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-snug break-words">{notif.title}</p>
          <p className="mt-1 text-xs leading-relaxed opacity-95 line-clamp-3 break-words">
            {preview}
          </p>
          {isTruncated && (
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = "/notifications";
              }}
              className="mt-2 text-[11px] font-bold underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              Read full message
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 self-start text-white/70 hover:text-white text-lg leading-none p-0.5"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      </div>
    ),
    {
      id: `notif-${notif.id}`,
      duration: 8000,
    },
  );
}
