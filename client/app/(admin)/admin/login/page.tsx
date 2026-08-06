"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { loginSchema } from "@/validation/auth.validation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const data = { email: form.get("email") as string, password: form.get("password") as string };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    setLoading(true);
    try {
      const result = await login(parsed.data);
      if (result.isAdmin) {
        router.push("/admin/dashboard");
      } else {
        setError("You do not have admin access");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to access the admin dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="admin@relay.com" className="w-full h-10 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="w-full h-10 rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Spinner /> : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need a test account?{" "}
          <a href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline transition-all">
            Learner login
          </a>
        </p>
      </div>
    </div>
  );
}
