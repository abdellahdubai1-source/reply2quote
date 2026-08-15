"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/app/LogoutButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quotes", label: "Quotes" },
  { href: "/profile", label: "Business Profile" },
  { href: "/billing", label: "Billing" },
];

export function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Logo href="/dashboard" />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Account">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href ? "text-ink" : "text-ink-faint hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LogoutButton />
          <ButtonLink href="/new" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Quote
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-neutral-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-[15px] font-medium",
                  pathname === link.href ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-neutral-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <LogoutButton />
          </div>
          <ButtonLink href="/new" onClick={() => setOpen(false)} fullWidth className="mt-3">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Quote
          </ButtonLink>
        </div>
      )}
    </header>
  );
}
