// components/MobileLayout.tsx
"use client";
import { Home, User, BadgeCheck, AlertCircle, Bell, Heart, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasUnreadNotifications } from "@/lib/data/notifications";
import { getCurrentUser, getMyRole } from "@/lib/data/profiles";
import { APP_NAME, APP_NAME_ACCENT } from "@/lib/brand";
import type { UserRole } from "@/types";

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [staffRole, setStaffRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        setHasUnread(await hasUnreadNotifications());
      } catch {
        /* ignore */
      }

      try {
        const session = await getMyRole();
        if (session && (session.role === "admin" || session.role === "organiser")) {
          setStaffRole(session.role);
        }
      } catch {
        /* ignore */
      }
    };

    checkAuth();
    const interval = setInterval(async () => {
      try {
        setHasUnread(await hasUnreadNotifications());
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted, router]);

  if (!mounted) return null;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Profile", path: "/profile", icon: User },
    { name: "I-Card", path: "/i-card", icon: BadgeCheck },
    { name: "Grievance", path: "/grievance", icon: AlertCircle },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--surface-muted)] relative overflow-hidden pb-20 tracking-tight selection:bg-[var(--brand)] selection:text-white transition-colors duration-200">
      <header className="sticky top-0 z-50 px-5 py-4 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-[var(--border)]">
        <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
          SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
        </h1>

        <div className="flex items-center gap-3">
          {staffRole && (
            <Link
              href={staffRole === "admin" ? "/admin" : "/organiser"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md"
            >
              <LayoutDashboard size={12} /> Dashboard
            </Link>
          )}
          <div className="flex gap-2 text-slate-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-pink-500 transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              <TwitterIcon size={18} />
            </a>
          </div>
          <a
            href="https://rzp.io/l/snsdonate"
            target="_blank"
            rel="noreferrer"
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md shadow-rose-500/20 transition-all"
          >
            <Heart size={12} className="fill-white" /> Donate
          </a>

          <Link
            href="/notifications"
            onClick={() => setHasUnread(false)}
            className="relative p-1 text-[var(--text-muted)] hover:text-black dark:hover:text-white transition-colors ml-1"
          >
            <Bell size={22} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--brand)] rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
            )}
          </Link>
        </div>
      </header>

      <main className="h-full overflow-y-auto animate-fadeIn">{children}</main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-t border-[var(--border)] flex justify-around p-4 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              <Icon
                size={22}
                className={
                  isActive
                    ? "fill-[var(--brand)]/10 stroke-[var(--brand)]"
                    : "stroke-current"
                }
              />
              <span className="text-[10px] font-bold tracking-wider mt-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
