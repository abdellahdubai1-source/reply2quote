"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";

const links = [
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
            Login
          </Link>
          <ButtonLink href="/new" size="sm">
            Start Free
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
      </nav>

      {open && (
        <div className="border-t border-border bg-white px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-neutral-50 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-neutral-50 hover:text-ink"
            >
              Login
            </Link>
          </div>
          <ButtonLink href="/new" onClick={() => setOpen(false)} fullWidth className="mt-3">
            Start Free
          </ButtonLink>
        </div>
      )}
    </header>
  );
}
