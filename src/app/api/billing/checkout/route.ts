import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Stub checkout endpoint. Structured so a real payment provider (e.g.
 * Stripe Checkout) can be dropped in later without touching the
 * client: this route already authenticates the caller and would be
 * the place to create a Checkout Session and return its `url`.
 *
 * To wire up Stripe:
 *   1. `npm install stripe`
 *   2. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO to your env vars.
 *   3. Replace the body below with a call to
 *      `stripe.checkout.sessions.create(...)` and return `{ url }`.
 *   4. Add a `/api/billing/webhook` route handling
 *      `checkout.session.completed` to flip `profiles.plan` to 'pro'.
 *
 * Until then, this intentionally does NOT fake a successful upgrade —
 * it tells the caller billing isn't connected yet.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Please log in first." }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: false,
      code: "billing_not_configured",
      error:
        "Online payments aren't connected yet. Once Stripe is configured, this button will take you to a secure checkout.",
    },
    { status: 501 }
  );
}
