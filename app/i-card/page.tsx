// app/i-card/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect } from "react";
import { getProfile, getQrVerifyUrl } from "@/lib/data/profiles";
import type { Profile } from "@/types";
import { User, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { ICardSkeleton } from "@/components/ui/Skeleton";
import { APP_NAME } from "@/lib/brand";

const QR_SIZE = 168;

export default function ICardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getQrVerifyUrl()])
      .then(([p, url]) => {
        setProfile(p);
        setQrUrl(url);
      })
      .catch(() => toast.error("Failed to load I-Card"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <MobileLayout>
        <ICardSkeleton />
      </MobileLayout>
    );

  if (!profile)
    return (
      <MobileLayout>
        <div className="text-center mt-20 text-gray-500">
          Profile not found.
        </div>
      </MobileLayout>
    );

  const isActive = profile.status === "active";

  return (
    <MobileLayout>
      <div className="p-5 flex flex-col items-center pb-24">
        <div className="w-full max-w-[340px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">
            Digital Volunteer ID
          </p>

          <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-700/30 bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-white font-black text-lg leading-tight tracking-tight">
                  {APP_NAME}
                </p>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                  Official Volunteer ID
                </p>
              </div>
              <ShieldCheck size={28} className="text-white/70 shrink-0" />
            </div>

            {!isActive ? (
              <div className="p-8 flex flex-col items-center text-center">
                <User className="text-amber-500 mb-3" size={40} />
                <p className="text-sm font-bold text-amber-600">
                  Pending Approval
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Your ID and QR code will appear once an admin approves your
                  account.
                </p>
              </div>
            ) : (
              <>
                {/* Identity row */}
                <div className="p-5 flex gap-4 border-b border-[var(--border)]">
                  <div className="w-20 h-24 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center overflow-hidden shrink-0">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-emerald-600" size={36} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                        Name
                      </p>
                      <p className="text-lg font-black uppercase leading-tight truncate">
                        {profile.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                        Volunteer ID
                      </p>
                      <p className="text-sm font-black font-mono tracking-wide text-emerald-700 dark:text-emerald-400">
                        {profile.volunteer_id || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Concern Center
                      </p>
                      <p className="text-base font-semibold truncate">
                        {profile.college}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="px-5 py-3 grid grid-cols-1 gap-3 border-b border-[var(--border)] bg-slate-50/80 dark:bg-[#141414]">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-[var(--text-muted)]">
                      Volunteer ID
                    </p>
                    <p className="text-sm font-black font-mono tracking-wide text-emerald-700 dark:text-emerald-400">
                      {profile.volunteer_id || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-[var(--text-muted)]">
                      Valid Until
                    </p>
                    <p className="text-xs font-bold font-mono">
                      {profile.valid_until || "—"}
                    </p>
                  </div>
                </div>

                {/* Large scannable QR */}
                <div className="p-6 flex flex-col items-center bg-white dark:bg-[#0a0a0a]">
                  <div className="bg-white p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 shadow-sm">
                    {qrUrl ? (
                      <QRCodeSVG
                        value={qrUrl}
                        size={QR_SIZE}
                        level="M"
                        includeMargin
                      />
                    ) : (
                      <div
                        className="bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400"
                        style={{ width: QR_SIZE, height: QR_SIZE }}
                      >
                        QR unavailable
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-4">
                    Scan to verify ID
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    sns-vol.vercel.app
                  </p>
                </div>
              </>
            )}

            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
          </div>

          <p className="text-[9px] text-center text-[var(--text-muted)] mt-4 font-medium leading-relaxed">
            Hold your phone steady and brighten the screen for faster scanning.
            Do not share your QR code publicly.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
