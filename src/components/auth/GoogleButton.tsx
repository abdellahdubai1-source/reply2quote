"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.62c-.13 1.1-.86 2.76-2.47 3.87l-.02.15 3.59 2.78.25.02c2.28-2.1 3.55-5.2 3.55-8.49z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.78-2.94c-1.02.71-2.4 1.2-4.15 1.2-3.17 0-5.86-2.1-6.82-5.02l-.14.01-3.73 2.89-.05.14C3.25 21.3 7.28 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.18 14.34a7.4 7.4 0 0 1-.4-2.34c0-.82.14-1.6.39-2.34l-.01-.16-3.78-2.94-.12.06A11.96 11.96 0 0 0 0 12c0 1.93.47 3.76 1.26 5.38l3.92-3.04z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c2.26 0 3.78.98 4.65 1.8l3.4-3.32C17.94 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.26 6.62l3.91 3.04C6.14 6.85 8.83 4.75 12 4.75z"
      />
    </svg>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  async function handleClick() {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <Button type="button" variant="outline" fullWidth onClick={handleClick}>
      <GoogleIcon />
      {label}
    </Button>
  );
}
