import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuotesHistory } from "@/components/quotes/QuotesHistory";
import { EMPTY_BUSINESS_PROFILE, type BusinessProfile } from "@/types/quote";

export const metadata: Metadata = {
  title: "Quotes",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/quotes");

  const [{ data: quotes }, { data: profileRow }] = await Promise.all([
    supabase.from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const business: BusinessProfile = profileRow
    ? {
        businessName: profileRow.business_name ?? "",
        logoUrl: profileRow.logo_url ?? "",
        phone: profileRow.phone ?? "",
        whatsapp: profileRow.whatsapp ?? "",
        email: profileRow.email ?? "",
        address: profileRow.address ?? "",
        trn: profileRow.trn ?? "",
        vatRegistered: profileRow.vat_registered ?? false,
      }
    : EMPTY_BUSINESS_PROFILE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Quotes</h1>
        <p className="mt-1 text-sm text-ink-soft">Every quotation you've generated, in one place.</p>
      </div>

      <QuotesHistory
        initialQuotes={quotes ?? []}
        userId={user.id}
        business={business}
        showBranding={profileRow?.plan !== "pro"}
      />
    </div>
  );
}
