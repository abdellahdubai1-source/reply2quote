import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuoteDetailView } from "@/components/quotes/QuoteDetailView";
import { EMPTY_BUSINESS_PROFILE, type BusinessProfile } from "@/types/quote";

export const metadata: Metadata = {
  title: "Quote",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/quotes/${params.id}`);

  // RLS also enforces this, but checking user_id explicitly means a
  // quote belonging to someone else resolves to a clean 404 instead of
  // an ambiguous empty result.
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!quote) notFound();

  const { data: profileRow } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

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
    <QuoteDetailView quote={quote} business={business} showBranding={profileRow?.plan !== "pro"} />
  );
}
