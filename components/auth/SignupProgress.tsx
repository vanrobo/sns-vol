type SignupProgressProps = {
  step: 1 | 2;
};

export default function SignupProgress({ step }: SignupProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
        <span className={step === 1 ? "text-[var(--brand)]" : ""}>Account</span>
        <span className={step === 2 ? "text-[var(--brand)]" : ""}>About you</span>
      </div>
      <div className="flex gap-2">
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-[var(--brand)]" : "bg-[var(--border)]"}`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-[var(--brand)]" : "bg-[var(--border)]"}`}
        />
      </div>
    </div>
  );
}
