"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production, wire this up to your error monitoring provider.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href="/">
        <Logo />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          We hit an unexpected error. Please try again — if it keeps happening, refresh the page.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
