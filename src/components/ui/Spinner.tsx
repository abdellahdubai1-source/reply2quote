import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />;
}

/** Full loading message used during the AI generation steps — keeps
 *  the user informed with real copy instead of a static spinner. */
export function LoadingLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-soft" role="status" aria-live="polite">
      <Spinner className="text-brand-700" />
      <span className="animate-pulse-soft">{text}</span>
    </div>
  );
}
