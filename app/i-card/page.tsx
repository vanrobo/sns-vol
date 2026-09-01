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
import { APP_NAME, APP_SITE_HOST } from "@/lib/brand";

const QR_SIZE = 236;

export default function ICardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteHost, setSiteHost] = useState(APP_SITE_HOST);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteHost(window.location.host);
    }
  }, []);

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
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-white font-black text-base leading-tight tracking-tight">
                  {APP_NAME}
                </p>
                <p className="text-emerald-100 text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5">
                  Volunteer I-Card
                </p>
              </div>
              <ShieldCheck size={22} className="text-white/70 shrink-0" />
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
                <div className="px-4 py-3 border-b border-[var(--border)] flex gap-3 items-center">
                  <div className="w-14 h-16 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center overflow-hidden shrink-0">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-emerald-600" size={28} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-black uppercase leading-tight truncate">
                      {profile.name}
                    </p>
                    <p className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {profile.volunteer_id || "—"}
                    </p>
                    <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">
                      {profile.college}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Valid until{" "}
                      <span className="font-semibold text-[var(--text)]">
                        {profile.valid_until || "—"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-5 flex flex-col items-center bg-white dark:bg-[#0a0a0a]">
                  <div className="bg-white p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 shadow-sm">
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-3">
                    Scan to verify ID
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {siteHost}
                  </p>
                </div>
              </>
            )}

            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
          </div>

          <p className="text-[9px] text-center text-[var(--text-muted)] mt-4 font-medium leading-relaxed">
            Brighten your screen and hold steady for faster scanning. Do not
            share your QR publicly.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
