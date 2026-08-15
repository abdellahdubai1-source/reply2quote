import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/types/database";

type Tone = "neutral" | "brand" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  brand: "bg-brand-50 text-brand-800",
  warning: "bg-amber-50 text-amber-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge tone={status === "sent" ? "brand" : "neutral"}>{status === "sent" ? "Sent" : "Draft"}</Badge>;
}
