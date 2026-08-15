import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const config: Record<Tone, { icon: typeof Info; classes: string }> = {
  error: { icon: AlertTriangle, classes: "bg-red-50 text-red-800 border-red-200" },
  success: { icon: CheckCircle2, classes: "bg-brand-50 text-brand-800 border-brand-200" },
  info: { icon: Info, classes: "bg-neutral-50 text-neutral-700 border-border" },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const { icon: Icon, classes } = config[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", classes, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
