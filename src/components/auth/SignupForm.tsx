"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { createClient } from "@/lib/supabase/client";
import { authEmailSchema } from "@/lib/validation";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = authEmailSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please check your details and try again.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already registered")
          ? "An account with this email already exists. Try logging in instead."
          : "We couldn't create your account. Please try again."
      );
      return;
    }

    // If email confirmation is disabled in the Supabase project, a
    // session comes back immediately and we can go straight in.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="h-8 w-8 text-brand-700" aria-hidden="true" />
        <p className="text-sm text-ink-soft">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Open it to activate your
          account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="Sign up with Google" />
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="signup-email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="signup-password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" fullWidth loading={loading}>
          Create free account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
