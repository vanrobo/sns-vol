"use client";

import { useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import type { Notification } from "@/types";

const BODY_PREVIEW_CHARS = 140;
const SWIPE_UP_THRESHOLD = 48;
const SWIPE_SIDE_THRESHOLD = 72;

export function previewNotificationBody(body: string, max = BODY_PREVIEW_CHARS) {
  const withoutLink = body.split("\n\nOpen:")[0]?.trim() ?? body;
  const trimmed = withoutLink.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

function SwipeDismissToast({
  toastId,
  visible,
  children,
}: {
  toastId: string;
  visible: boolean;
  children: ReactNode;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const reset = () => {
    offsetRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY };
    draggingRef.current = true;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    const next = {
      x: dx,
      y: dy < 0 ? dy : dy * 0.25,
    };
    offsetRef.current = next;
    setOffset(next);
  };

  const onTouchEnd = () => {
    draggingRef.current = false;
    setDragging(false);
    const { x, y } = offsetRef.current;
    const dismissUp = y <= -SWIPE_UP_THRESHOLD;
    const dismissSide = Math.abs(x) >= SWIPE_SIDE_THRESHOLD;

    if (dismissUp || dismissSide) {
      toast.dismiss(toastId);
      return;
    }
    reset();
  };

  const dragDistance = Math.hypot(offset.x, Math.min(offset.y, 0));
  const fade = dragging
    ? Math.max(0.35, 1 - dragDistance / 140)
    : visible
      ? 1
      : 0;

  return (
    <div
      role="presentation"
      className="touch-none select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        opacity: fade,
        transition: dragging
          ? "none"
          : "transform 0.22s ease, opacity 0.22s ease",
      }}
    >
      {children}
    </div>
  );
}

export function showNotificationAlertToast(notif: Notification) {
  const preview = previewNotificationBody(notif.body);
  const isTruncated = notif.body.trim().length > BODY_PREVIEW_CHARS;

  toast.custom(
    (t) => (
      <SwipeDismissToast toastId={t.id} visible={t.visible}>
        <div
          role="alert"
          className={`pointer-events-auto flex w-[min(100vw-2rem,22rem)] gap-3 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-white shadow-lg ${
            t.visible ? "translate-y-0" : "-translate-y-1"
          } transition-transform duration-200`}
        >
          <Bell size={18} className="shrink-0 mt-0.5 opacity-90" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm leading-snug break-words">
              {notif.title}
            </p>
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
      </SwipeDismissToast>
    ),
    {
      id: `notif-${notif.id}`,
      duration: 8000,
    },
  );
}
