"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "@/lib/actions/auth";
import { clearAppCaches } from "@/lib/home-cache";
import { onboardingRedirect } from "@/lib/onboarding";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import DemoLoginPanel from "@/components/auth/DemoLoginPanel";
import { Loader2, Mail, Lock } from "lucide-react";

const SHOW_DEMO =
  process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const completeLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    try {
      const result = await signIn(loginEmail.trim(), loginPassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      clearAppCaches();
      toast.success("Welcome back!");
      router.push(
        onboardingRedirect(result.status ?? "pending", result.role ?? "volunteer"),
      );
      router.refresh();
    } catch {
      toast.error("Sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeLogin(email, password);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to browse events, manage your I-Card, and track your volunteer journey."
      footer={
        <p className="text-center text-[15px] text-[var(--text-muted)]">
          New here?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
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
          placeholder="Password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading} className="sns-btn-primary">
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign in"}
        </button>
      </form>

      {SHOW_DEMO && (
        <DemoLoginPanel
          loading={loading}
          onSelect={(demoEmail, demoPassword) => {
            setEmail(demoEmail);
            setPassword(demoPassword);
            void completeLogin(demoEmail, demoPassword);
          }}
        />
      )}
    </AuthShell>
  );
}
