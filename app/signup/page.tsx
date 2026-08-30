// app/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signUp } from "@/lib/actions/auth";
import { Loader2, User, Mail, Building, Lock } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signUp(name, email, college, password);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Account created! You can sign in now.");
      router.push("/login");
    } catch {
      toast.error("Sign-up failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-elevated)] dark:bg-[#0B0F17] p-4 animate-fadeIn">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-[var(--surface)] dark:bg-[var(--surface-elevated)] p-8 rounded-2xl shadow-xl border border-[var(--border)]"
      >
        <p className="text-sm font-bold text-[var(--brand)] tracking-tight mb-1">
          SNS Vol
        </p>
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-2">
          Join SNS
        </h1>
        <p className="text-[var(--text-muted)] mb-8 text-[15px]">
          Register as a new volunteer.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <User size={18} />
            </span>
            <input
              required
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sns-input"
            />
          </div>

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
              <Building size={18} />
            </span>
            <input
              required
              type="text"
              placeholder="School / College"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
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
              placeholder="Password (min 6 characters)"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sns-input"
            />
          </div>

          <button type="submit" disabled={loading} className="sns-btn-primary">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Create Account"
            )}
          </button>
        </div>
        <p className="text-center mt-6 text-[15px] text-[var(--text-muted)]">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
