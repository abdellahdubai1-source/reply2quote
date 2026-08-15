import { PricingCards } from "@/components/landing/PricingCards";

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border bg-neutral-50/60 py-20">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Simple Pricing</h2>
          <p className="mt-3 text-ink-soft">Start free. Upgrade when you're quoting customers every day.</p>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
      </div>
    </section>
  );
}
