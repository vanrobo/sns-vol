"use client";

import Link from "next/link";
import { LayoutDashboard, ChevronRight, Shield, Users } from "lucide-react";
import type { UserRole } from "@/types";

type StaffHomeBannerProps = {
  role: UserRole;
  name: string;
};

export default function StaffHomeBanner({ role, name }: StaffHomeBannerProps) {
  if (role !== "admin" && role !== "organiser") return null;

  const isAdmin = role === "admin";
  const href = isAdmin ? "/admin" : "/organiser";
  const title = isAdmin ? "Admin Dashboard" : "Organize events";
  const subtitle = isAdmin
    ? "Manage events, volunteers, grievances, applications & awards"
    : "Create and manage your events from the organiser portal";

  return (
    <Link
      href={href}
      className="block bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform"
    >
      {isAdmin ? (
        <Shield
          className="absolute -right-3 -bottom-3 text-white/10"
          size={80}
        />
      ) : (
        <Users
          className="absolute -right-3 -bottom-3 text-white/10"
          size={80}
        />
      )}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-emerald-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Staff Portal
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight">{title}</h2>
          <p className="text-[12px] text-emerald-100/90 leading-snug max-w-[240px]">
            Hi {name.split(" ")[0]}. {subtitle}
          </p>
        </div>
        <div className="shrink-0 bg-white/15 p-2.5 rounded-full">
          <ChevronRight size={22} />
        </div>
      </div>
    </Link>
  );
}
