"use client";

import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/** Shared shell for Center / Wordsmith / Internship hubs (mobile-first). */
export default function ModuleShell({
  title,
  subtitle,
  backHref = "/",
  children,
  footer,
}: Props) {
  return (
    <div className="w-full mx-auto h-[100dvh] flex flex-col bg-[var(--surface-muted)] relative overflow-hidden tracking-tight max-w-md md:max-w-3xl">
      <header className="shrink-0 z-50 px-4 py-3 flex justify-between items-center bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={backHref}
            className="p-1.5 -ml-1 text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider">
              {APP_NAME}
            </p>
            <h1 className="text-base font-black truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--brand)]"
          title="Home"
        >
          <Home size={20} />
        </Link>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pt-4 pb-6 space-y-4">
        {children}
      </main>
      {footer}
    </div>
  );
}
