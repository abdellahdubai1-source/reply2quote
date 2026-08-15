import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { PLANS } from "@/lib/plans";
import { FREE_PLAN_MONTHLY_QUOTE_LIMIT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/billing");

  const { data: profile } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const plan = profile?.plan ?? "free";
  const proPlan = PLANS.find((p) => p.id === "pro")!;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your Reply2Quote plan.</p>
      </div>

      <Card>
        <CardBody className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-ink-faint">Current plan</p>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-lg font-bold capitalize text-ink">{plan}</h2>
              <Badge tone={plan === "pro" ? "brand" : "neutral"}>{plan === "pro" ? "Active" : `${FREE_PLAN_MONTHLY_QUOTE_LIMIT} quotes / month`}</Badge>
            </div>
          </div>
          {plan !== "pro" && <UpgradeButton />}
        </CardBody>
      </Card>

      {plan !== "pro" && (
        <Card>
          <CardBody>
            <h3 className="text-base font-semibold text-ink">Why go Pro?</h3>
            <ul className="mt-4 space-y-2.5">
              {proPlan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-2xl font-bold text-ink">
              AED 29<span className="text-sm font-normal text-ink-faint">/month</span>
            </p>
          </CardBody>
        </Card>
      )}

      <p className="text-xs text-ink-faint">
        Payments are not yet connected in this deployment. See <code>/api/billing/checkout</code> for
        where to add Stripe (or another provider) when you're ready to accept payments.
      </p>
    </div>
  );
}
