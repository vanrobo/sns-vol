"use client";

import MobileLayout from "@/components/MobileLayout";
import Link from "next/link";
import { Clock, User, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export default function PendingPage() {
  return (
    <MobileLayout>
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
          <Clock className="text-amber-600" size={36} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Awaiting I-Card Approval
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Your profile is under review. Once an admin approves your digital
            I-Card, you&apos;ll be able to browse events and volunteer.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
          >
            <User size={16} /> View Profile
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
