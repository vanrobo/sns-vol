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
        <div className="w-full max-w-[360px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">
            Digital Volunteer ID
          </p>

          {/* Landscape ID card */}
          <div className="relative aspect-[1.586/1] w-full rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-700/30 bg-white dark:bg-[#0a0a0a]">
            {/* Left green stripe */}
            <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-br from-emerald-600 to-emerald-700 flex flex-col">
              <div className="p-3 flex justify-between items-start">
                <div>
                  <p className="text-white font-black text-[11px] leading-tight tracking-tight">
                    {APP_NAME}
                  </p>
                  <p className="text-emerald-100 text-[7px] font-bold uppercase tracking-[0.15em] mt-0.5">
                    Volunteer ID
                  </p>
                </div>
                <ShieldCheck size={18} className="text-white/70 shrink-0" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-3 pb-3">
                <div className="w-[72px] h-[88px] rounded-lg bg-white/15 border-2 border-white/40 flex items-center justify-center overflow-hidden shadow-inner">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-white/80" size={36} />
                  )}
                </div>
                <p className="text-[7px] text-emerald-100/80 font-bold uppercase tracking-wider mt-2">
                  Photo
                </p>
              </div>

              <div className="px-3 pb-3">
                <div className="bg-white/10 rounded-md px-2 py-1.5">
                  <p className="text-[6px] text-emerald-100/70 font-bold uppercase">
                    Valid Until
                  </p>
                  <p className="text-[9px] text-white font-bold font-mono">
                    {profile.valid_until || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right details panel */}
            <div className="absolute inset-y-0 right-0 w-[62%] p-4 flex flex-col justify-between bg-[#fafafa] dark:bg-[#141414]">
              {!isActive ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                  <User className="text-amber-500 mb-2" size={28} />
                  <p className="text-xs font-bold text-amber-600">
                    Pending Approval
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Your ID activates once approved.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                      Name
                    </p>
                    <p className="text-base font-black uppercase leading-tight tracking-tight text-[var(--text)] truncate">
                      {profile.name}
                    </p>

                    <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 mt-3 mb-0.5">
                      ID Number
                    </p>
                    <p className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {profile.volunteer_id}
                    </p>

                    <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 mt-3 mb-0.5">
                      Institution
                    </p>
                    <p className="text-[11px] font-semibold text-[var(--text)] truncate">
                      {profile.college}
                    </p>

                    {profile.batch && (
                      <>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 mt-2 mb-0.5">
                          Batch / Area
                        </p>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">
                          {profile.batch}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2 pt-2 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[7px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                        Scan to verify
                      </p>
                      <p className="text-[8px] text-emerald-600 font-bold">
                        sns-vol.vercel.app
                      </p>
                    </div>
                    <div className="bg-white p-1 rounded border border-neutral-200 dark:border-neutral-700 shrink-0">
                      {qrUrl ? (
                        <QRCodeSVG value={qrUrl} size={52} />
                      ) : (
                        <div className="w-[52px] h-[52px] bg-gray-100 rounded flex items-center justify-center text-[7px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Holographic accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
          </div>

          <p className="text-[9px] text-center text-[var(--text-muted)] mt-4 font-medium">
            Present this card at events for verification. Do not share your QR
            code publicly.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
