"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useUser } from "@/lib/hooks/useUser";

export function WorkflowHeader() {
  const { user, loading } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink sm:flex"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <Logo />
        </div>

        {!loading && (
          <Link
            href={user ? "/dashboard" : "/login"}
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        )}
      </div>
    </header>
  );
}
