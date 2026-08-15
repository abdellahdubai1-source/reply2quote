import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "flex flex-col rounded-2xl border p-7",
            plan.highlighted
              ? "border-brand-700 bg-ink text-white shadow-lift"
              : "border-border bg-white shadow-soft"
          )}
        >
          <h3 className={cn("text-lg font-semibold", plan.highlighted ? "text-white" : "text-ink")}>
            {plan.name}
          </h3>
          <p className={cn("mt-1 text-sm", plan.highlighted ? "text-neutral-300" : "text-ink-faint")}>
            {plan.description}
          </p>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
            {plan.priceSuffix && (
              <span className={cn("text-sm", plan.highlighted ? "text-neutral-300" : "text-ink-faint")}>
                {plan.priceSuffix}
              </span>
            )}
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check
                  className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-brand-400" : "text-brand-700")}
                  aria-hidden="true"
                />
                <span className={plan.highlighted ? "text-neutral-100" : "text-ink-soft"}>{feature}</span>
              </li>
            ))}
          </ul>

          <ButtonLink
            href={plan.id === "free" ? "/new" : "/billing"}
            variant={plan.highlighted ? "primary" : "outline"}
            size="lg"
            fullWidth
            className="mt-7"
          >
            {plan.cta}
          </ButtonLink>
        </div>
      ))}
    </div>
  );
}
