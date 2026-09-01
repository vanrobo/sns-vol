"use client";

import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import Link from "next/link";
import { Clock, User, LogOut, Bell, Loader2, ClipboardList } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { getProfile } from "@/lib/data/profiles";
import { getProfileCompletion } from "@/lib/onboarding";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import type { Profile } from "@/types";

export default function PendingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const { percent, steps } = getProfileCompletion(profile);
  const profileReady = percent >= 75;

  return (
    <MobileLayout>
      <div className="p-6 flex flex-col items-center min-h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
          <Clock className="text-amber-600" size={36} />
        </div>

        <div className="space-y-3 max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            {profileReady ? "Almost there!" : "Awaiting I-Card approval"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            {profileReady
              ? "Your profile looks good. An admin will review it and issue your digital I-Card. We will alert you in Alert Hub."
              : "Complete your profile so admins can verify you faster. Once approved, you can browse events, check in, and volunteer."}
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-[var(--text-muted)]">
            <Loader2 className="animate-spin mx-auto" size={24} />
          </div>
        ) : (
          <OnboardingChecklist steps={steps} percent={percent} />
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/profile?onboarding=1"
            className="flex items-center justify-center gap-2 bg-[var(--brand)] text-white rounded-xl py-3 text-sm font-bold shadow-lg"
          >
            <User size={16} />
            {profileReady ? "Review profile" : "Complete profile"}
          </Link>
          <Link
            href="/applications"
            className="flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
          >
            <ClipboardList size={16} /> Applied events
          </Link>
          <Link
            href="/notifications"
            className="flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
          >
            <Bell size={16} /> Alert Hub
          </Link>
          <button
            onClick={() => signOutAction()}
            className="flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:underline"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
