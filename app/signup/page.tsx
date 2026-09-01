"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signUp } from "@/lib/actions/auth";
import { clearAppCaches } from "@/lib/home-cache";
import { onboardingRedirect } from "@/lib/onboarding";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import SignupProgress from "@/components/auth/SignupProgress";
import CenterPicker from "@/components/ui/CenterPicker";
import { Loader2, User, Mail, Lock, ArrowLeft } from "lucide-react";

function passwordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length < 6) {
    return { label: "Too short", color: "bg-red-400", width: "20%" };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Fair", color: "bg-amber-400", width: "50%" };
  if (score === 2) return { label: "Good", color: "bg-emerald-400", width: "75%" };
  return { label: "Strong", color: "bg-emerald-600", width: "100%" };
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [center, setCenter] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please accept the volunteer terms to continue.");
      return;
    }
    if (!center) {
      toast.error("Please select your concern center.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(
        name.trim(),
        email.trim(),
        center.trim(),
        password,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.userId) {
        clearAppCaches();
        toast.success("Account created! Let's finish your profile.");
        router.push(
          onboardingRedirect(result.status ?? "pending", result.role ?? "volunteer"),
        );
        router.refresh();
        return;
      }
      toast("Account created. Sign in with your email and password.", {
        icon: "ℹ️",
      });
      router.push("/login");
    } catch {
      toast.error("Sign-up failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Join as a volunteer"
      subtitle={
        step === 1
          ? "Create your account in under a minute. You'll complete your profile next for I-Card approval."
          : "Select your SNS concern center so we can match you with nearby events."
      }
      footer={
        <p className="text-center text-[15px] text-[var(--text-muted)]">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignupProgress step={step} />

      {step === 1 ? (
        <form onSubmit={goToStep2} className="space-y-4">
          <AuthField
            icon={<User size={18} />}
            type="text"
            placeholder="Full name"
            value={name}
            onChange={setName}
            required
            autoComplete="name"
          />
          <AuthField
            icon={<Mail size={18} />}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <AuthField
            icon={<Lock size={18} />}
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <div className="px-1 -mt-1">
              <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                Password strength: {strength.label}
              </p>
            </div>
          )}
          <AuthField
            icon={<Lock size={18} />}
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button type="submit" className="sns-btn-primary">
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <CenterPicker
            variant="auth"
            value={center}
            onChange={setCenter}
            required
          />

          <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-input)] p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[var(--brand)]"
            />
            <span className="text-xs text-[var(--text-muted)] leading-relaxed">
              I agree to volunteer responsibly, follow event guidelines, and keep
              my profile accurate for I-Card verification.
            </span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="submit"
              disabled={loading || !agreed}
              className="sns-btn-primary flex-1"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
