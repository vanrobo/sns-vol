// app/i-card/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect } from "react";
import { getProfile, getQrVerifyUrl } from "@/lib/data/profiles";
import type { Profile } from "@/types";
import {
  BadgeCheck,
  User,
  Building,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { ICardSkeleton } from "@/components/ui/Skeleton";

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
      <div className="p-5 flex flex-col items-center pb-24 space-y-6">
        <div className="bg-black dark:bg-[#121212] rounded-xl p-6 text-white relative overflow-hidden border border-[var(--border)] shadow-sm w-full">
          <BadgeCheck
            className="absolute -right-4 -bottom-4 text-white/5"
            size={120}
          />
          <div className="relative z-10">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">
              Digital ID
            </h2>
            <p className="text-[#98989D] text-[13px] leading-relaxed">
              Present this verified digital credential for secure entry to
              active campaign locations.
            </p>
          </div>
        </div>

        <div className="w-full max-w-[320px] bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden relative shadow-sm">
          <div className="bg-emerald-600 p-5 text-white flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base leading-tight tracking-tight">
                SNS Volunteer
              </h3>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mt-1">
                Official ID
              </p>
            </div>
            <ShieldCheck size={28} className="opacity-80" />
          </div>

          <div className="p-5">
            {!isActive ? (
              <div className="text-center py-8 space-y-2">
                <User className="mx-auto text-gray-400" size={40} />
                <p className="text-sm font-bold text-amber-600">
                  I-Card Pending Approval
                </p>
                <p className="text-xs text-gray-500">
                  Your digital ID will appear here once approved by an admin.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-200">
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
                  <div>
                    <p className="font-bold text-lg leading-tight">
                      {profile.name}
                    </p>
                    <p className="text-xs font-mono text-emerald-600 font-bold">
                      {profile.volunteer_id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="col-span-2 bg-slate-50 dark:bg-[#18181B] p-2.5 rounded-lg border border-[var(--border)]">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Valid Until
                    </p>
                    <p className="text-[11px] font-medium">
                      {profile.valid_until || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2 bg-slate-50 dark:bg-[#18181B] p-2.5 rounded-lg border border-[var(--border)]">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building size={10} /> Institution
                    </p>
                    <p className="text-xs font-medium truncate">
                      {profile.college}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center pt-4 border-t border-[var(--border)]">
                  <div className="bg-white p-2 rounded-xl border border-neutral-200/60 shadow-sm flex items-center justify-center">
                    {qrUrl ? (
                      <QRCodeSVG value={qrUrl} size={90} />
                    ) : (
                      <div className="w-[90px] h-[90px] bg-gray-100 rounded flex items-center justify-center text-[9px] text-gray-400 text-center p-2">
                        QR unavailable
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">
                    Scan to Verify ID
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
