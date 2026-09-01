import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OnboardingStep } from "@/lib/onboarding";

type OnboardingBannerProps = {
  percent: number;
  steps?: OnboardingStep[];
};

export default function OnboardingBanner({
  percent,
  steps = [],
}: OnboardingBannerProps) {
  const nextStep = steps.find(
    (s) => !s.done && s.id !== "account" && s.id !== "volunteer" && s.id !== "review",
  );

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-[var(--text)]">
          Complete your profile
        </p>
        <span className="text-xs font-bold text-[var(--brand)] tabular-nums">
          {percent}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {nextStep && (
        <p className="mt-2.5 text-xs text-[var(--text-muted)]">
          Next:{" "}
          <span className="font-semibold text-[var(--text)]">{nextStep.label}</span>
        </p>
      )}

      <Link
        href="/pending"
        className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--brand)] hover:underline"
      >
        Approval status
        <ChevronRight size={14} />
      </Link>
    </section>
  );
}
