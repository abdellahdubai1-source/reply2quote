import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card, CardBody } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50/60 px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-sm">
        <CardBody className="p-7">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </CardBody>
      </Card>
      <p className="mt-6 text-sm text-ink-faint">{footer}</p>
    </div>
  );
}
