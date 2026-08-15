"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (resetMode) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      setLoading(false);
      if (resetError) {
        setError("We couldn't send a reset link. Please check the email address and try again.");
        return;
      }
      setResetSent(true);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (resetSent) {
    return (
      <Alert tone="success">
        If an account exists for <strong>{email}</strong>, a password reset link is on its way.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="login-email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!resetMode && (
          <Input
            id="login-password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" fullWidth loading={loading}>
          {resetMode ? "Send reset link" : "Log in"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setResetMode((v) => !v);
          setError(null);
        }}
        className="block w-full text-center text-sm font-medium text-ink-faint hover:text-ink"
      >
        {resetMode ? "Back to login" : "Forgot password?"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          Start free
        </Link>
      </p>
    </div>
  );
}
