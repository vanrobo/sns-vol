// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single();

      if (profile?.status === "inactive") {
        await supabase.auth.signOut();
        toast.error("This account has been deactivated.");
        return;
      }

      toast.success("Welcome back!");
      router.push(profile?.role === "admin" ? "/admin" : "/");
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
          SNS Vol
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
      </form>
    </div>
  );
}
