"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, ScanLine, Keyboard } from "lucide-react";
import type { Event } from "@/types";
import {
  getStaffScanEvents,
  recordAttendanceFromScan,
} from "@/lib/data/attendance-scan";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AttendanceScanModal({ open, onClose }: Props) {
  const readerId = useId().replace(/:/g, "");
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const busyRef = useRef(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      /* camera may already be stopped */
    }
  }, []);

  const handleScan = useCallback(
    async (value: string) => {
      if (!eventId || busyRef.current) return;
      busyRef.current = true;
      try {
        const result = await recordAttendanceFromScan(eventId, value);
        if (result.alreadyMarked) {
          toast.success(`${result.volunteerName} is already marked attended.`);
        } else {
          toast.success(`Attendance recorded for ${result.volunteerName}.`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Scan failed.");
      } finally {
        busyRef.current = false;
      }
    },
    [eventId],
  );

  useEffect(() => {
    if (!open) return;
    setLoadingEvents(true);
    getStaffScanEvents()
      .then((list) => {
        setEvents(list);
        setEventId((prev) => prev || list[0]?.id || "");
      })
      .catch(() => toast.error("Could not load events."))
      .finally(() => setLoadingEvents(false));
  }, [open]);

  useEffect(() => {
    if (!open || showManual || !eventId) {
      void stopScanner();
      setCameraReady(false);
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        await stopScanner();
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            void handleScan(decoded);
          },
          () => {},
        );

        if (!cancelled) setCameraReady(true);
      } catch {
        if (!cancelled) {
          setCameraReady(false);
          setShowManual(true);
          toast.error("Camera unavailable. Paste the I-Card link instead.");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
      setCameraReady(false);
    };
  }, [open, showManual, eventId, readerId, handleScan, stopScanner]);

  const close = () => {
    void stopScanner();
    setShowManual(false);
    setManualCode("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <ScanLine size={18} className="text-[var(--brand)]" />
              Scan attendance
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Scan a volunteer I-Card QR to mark them present
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Event
            </label>
            {loadingEvents ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Loader2 size={16} className="animate-spin" />
                Loading events…
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No active events available to scan into.
              </p>
            ) : (
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm font-semibold"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} — {event.date}
                  </option>
                ))}
              </select>
            )}
          </div>

          {!showManual && events.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-black min-h-[240px] relative">
              <div id={readerId} className="w-full" />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Starting camera…
                </div>
              )}
            </div>
          )}

          {showManual && events.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Paste I-Card verify link
              </label>
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="https://…/verify/…"
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || !eventId}
                onClick={() => void handleScan(manualCode.trim())}
                className="w-full py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-50"
              >
                Record attendance
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-muted)] py-2"
          >
            <Keyboard size={14} />
            {showManual ? "Use camera instead" : "Paste link instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
