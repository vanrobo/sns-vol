import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type OnboardingBannerProps = {
  percent: number;
  onDismiss?: () => void;
};

export default function OnboardingBanner({
  percent,
  onDismiss,
}: OnboardingBannerProps) {
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-[var(--brand)]/25 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/15 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-[var(--brand)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text)]">
            Welcome — let&apos;s finish your profile
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
            Add your phone, photo, and skills so admins can approve your I-Card
            faster. You&apos;re {percent}% done.
          </p>
          <div className="mt-3 h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] shrink-0"
          >
            Dismiss
          </button>
        )}
      </div>
      <Link
        href="/pending"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)]"
      >
        See approval status <ArrowRight size={14} />
      </Link>
    </div>
  );
}
