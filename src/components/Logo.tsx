import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string | null }) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight text-ink", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white">
        <MessageSquareText className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="text-[17px]">
        Reply<span className="text-brand-700">2</span>Quote
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Reply2Quote home">
      {content}
    </Link>
  );
}
