"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { Briefcase, ArrowRight, Lock, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-glow w-full">
      <div className="absolute top-20 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl border border-card-border shadow-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-gradient tracking-tight">
            <Briefcase className="w-7 h-7 text-primary" />
            <span>DevelopmentWala<span className="text-secondary">.org</span></span>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-foreground">Sign in to your account</h2>
          <p className="mt-1 text-xs text-muted">
            Or{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              register a new account
            </Link>
          </p>
        </div>

        {signupSuccess && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-primary font-semibold text-center">
            🎉 Registration successful! Please sign in below.
          </div>
        )}

        {state?.error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold text-center">
            ⚠️ {state.error}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4 text-xs text-left">
          <input 
            type="hidden" 
            name="callbackUrl" 
            value={searchParams.get("callbackUrl") || "/dashboard"} 
          />

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="candidate@gmail.com or ngo@goonj.org"
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Password</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md text-xs mt-2 disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
            {!isPending && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 text-xs text-muted">Loading Portal...</div>}>
      <SignInForm />
    </Suspense>
  );
}
