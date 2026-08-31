// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "@/lib/actions/auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { APP_NAME } from "@/lib/brand";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fillDemo = (email: string) => {
    setEmail(email);
    setPassword(DEMO_PASSWORD);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Welcome back!");
      if (result.role === "admin") router.push("/admin");
      else if (result.role === "organiser") router.push("/organiser");
      else if (result.status === "pending") router.push("/pending");
      else router.push("/");
      router.refresh();
    } catch {
      toast.error("Sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-elevated)] dark:bg-[#0B0F17] p-4 animate-fadeIn">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[var(--surface)] dark:bg-[var(--surface-elevated)] p-8 rounded-2xl shadow-xl border border-[var(--border)]"
      >
        <p className="text-sm font-bold text-[var(--brand)] tracking-tight mb-1">
          {APP_NAME}
        </p>
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-2">
          Sign In
        </h1>
        <p className="text-[var(--text-muted)] mb-8 text-[15px]">
          Access your volunteer dashboard.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={18} />
            </span>
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sns-input"
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={18} />
            </span>
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sns-input"
            />
          </div>

          <button type="submit" disabled={loading} className="sns-btn-primary">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
          </button>
        </div>
        <p className="text-center mt-6 text-[15px] text-[var(--text-muted)]">
          New here?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Create an Account
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Demo accounts
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => fillDemo(demo.email)}
                className="w-full text-left p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] hover:border-emerald-500/50 transition-colors"
              >
                <p className="text-sm font-bold text-[var(--text)]">
                  {demo.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {demo.email}
                </p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">
            Password for all demos:{" "}
            <span className="font-mono font-semibold">{DEMO_PASSWORD}</span>
          </p>
        </div>
      </form>
    </div>
  );
}
