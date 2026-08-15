import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href="/">
        <Logo />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink-soft">The page you're looking for doesn't exist or has moved.</p>
      </div>
      <ButtonLink href="/">Back to home</ButtonLink>
    </div>
  );
}
