import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { QuoteRow } from "@/components/quotes/QuoteRow";
import { EmptyQuotesState } from "@/components/quotes/EmptyQuotesState";
import { greeting } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: quotes }] = await Promise.all([
    supabase.from("profiles").select("business_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = profile?.business_name || user.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Ready to turn another message into a quote?</p>
        </div>
        <ButtonLink href="/new" size="lg">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Reply &amp; Quote
        </ButtonLink>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Recent Quotes</h2>
          {quotes && quotes.length > 0 && (
            <ButtonLink href="/quotes" variant="ghost" size="sm">
              View all →
            </ButtonLink>
          )}
        </div>

        {quotes && quotes.length > 0 ? (
          <div className="space-y-2.5">
            {quotes.map((quote) => (
              <QuoteRow key={quote.id} quote={quote} />
            ))}
          </div>
        ) : (
          <EmptyQuotesState />
        )}
      </div>
    </div>
  );
}
