import type { Metadata } from "next";
import { PricingCards } from "@/components/landing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for UAE service businesses. Start free, upgrade to Pro for AED 29/month.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink">Simple, honest pricing</h1>
          <p className="mt-3 text-ink-soft">
            Two plans. No hidden fees. Change or cancel anytime.
          </p>
        </div>
        <div className="mt-14">
          <PricingCards />
        </div>
        <p className="mx-auto mt-10 max-w-lg text-center text-sm text-ink-faint">
          Pro billing is not yet live — the Billing page explains what happens next and how upgrades
          will work once payments are connected.
        </p>
      </div>
    </section>
  );
}
