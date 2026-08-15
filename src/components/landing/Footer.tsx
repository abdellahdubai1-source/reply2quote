import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-faint">
          <Link href="/#how-it-works" className="hover:text-ink">
            How it Works
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-ink">
            Login
          </Link>
        </nav>
        <p className="text-xs text-ink-faint">
          &copy; {new Date().getFullYear()} Reply2Quote. Built for UAE businesses.
        </p>
      </div>
    </footer>
  );
}
