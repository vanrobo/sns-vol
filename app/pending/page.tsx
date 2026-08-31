"use client";

import MobileLayout from "@/components/MobileLayout";
import Link from "next/link";
import { Clock, User, LogOut, Bell, CheckCircle2 } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export default function PendingPage() {
  return (
    <MobileLayout>
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
          <Clock className="text-amber-600" size={36} />
        </div>
        <div className="space-y-3 max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Awaiting I-Card Approval
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Your profile is with our admin team. Once your digital I-Card is
            approved, you&apos;ll get an in-app alert and can browse events,
            check in, and volunteer.
          </p>
          <ul className="text-left text-sm space-y-2 pt-2">
            <li className="flex items-start gap-2 text-[var(--text-muted)]">
              <CheckCircle2
                size={16}
                className="text-emerald-600 shrink-0 mt-0.5"
              />
              Complete your profile — name, college, phone, and photo help us
              verify you faster.
            </li>
            <li className="flex items-start gap-2 text-[var(--text-muted)]">
              <Bell size={16} className="text-amber-500 shrink-0 mt-0.5" />
              Watch Alert Hub — we&apos;ll notify you here when you&apos;re
              approved.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 bg-[var(--brand)] text-white rounded-xl py-3 text-sm font-bold shadow-lg"
          >
            <User size={16} /> Complete Profile
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
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
