import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { OnboardingStep } from "@/lib/onboarding";

type OnboardingChecklistProps = {
  steps: OnboardingStep[];
  percent: number;
};

export default function OnboardingChecklist({
  steps,
  percent,
}: OnboardingChecklistProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm font-bold text-[var(--text)]">Your onboarding</p>
        <span className="text-xs font-bold text-[var(--brand)]">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="space-y-3">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3">
            {step.done ? (
              <CheckCircle2
                size={18}
                className="text-emerald-600 shrink-0 mt-0.5"
              />
            ) : step.current ? (
              <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {step.href && !step.done ? (
                <Link
                  href={step.href}
                  className={`text-sm font-semibold leading-snug ${
                    step.current
                      ? "text-[var(--brand)]"
                      : "text-[var(--text-muted)]"
                  } hover:underline`}
                >
                  {step.label}
                </Link>
              ) : (
                <span
                  className={`text-sm font-semibold leading-snug ${
                    step.done
                      ? "text-[var(--text-muted)] line-through decoration-slate-400/60"
                      : step.current
                        ? "text-[var(--brand)]"
                        : "text-[var(--text-muted)]"
                  }`}
                >
                  {step.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
