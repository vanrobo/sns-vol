import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { OnboardingStep } from "@/lib/onboarding";

type OnboardingBannerProps = {
  percent: number;
  steps?: OnboardingStep[];
};

export default function OnboardingBanner({
  percent,
  steps = [],
}: OnboardingBannerProps) {
  const todo = steps.filter(
    (s) => !s.done && s.id !== "account" && s.id !== "volunteer",
  );

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] bg-amber-50/80 dark:bg-amber-950/20">
        <p className="text-base font-bold text-[var(--text)]">
          Profile not complete yet
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
          Fill in the details below, then tap Save. Admin will review your I-Card
          after that.
        </p>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="text-2xl font-black text-[var(--brand)]">
            {percent}%
          </span>
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            complete
          </span>
        </div>
        <div className="h-3 rounded-full bg-[var(--border)] overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-2.5">
          {todo.length > 0 ? (
            todo.slice(0, 4).map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-2.5 text-base font-semibold text-[var(--text)]"
              >
                <Circle size={16} className="text-amber-500 shrink-0" />
                {step.label}
              </li>
            ))
          ) : (
            <li className="flex items-center gap-2.5 text-base font-semibold text-[var(--brand)]">
              <CheckCircle2 size={16} className="shrink-0" />
              Ready for admin review
            </li>
          )}
        </ul>
      </div>

      <div className="px-5 pb-4">
        <Link
          href="/pending"
          className="block w-full text-center rounded-xl border border-[var(--border)] bg-[var(--surface-input)] py-3.5 text-base font-bold text-[var(--text)] hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
        >
          View approval status
        </Link>
      </div>
    </section>
  );
}
