"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { QuoteHistoryRow } from "@/components/quotes/QuoteHistoryRow";
import { EmptyQuotesState } from "@/components/quotes/EmptyQuotesState";
import { createClient } from "@/lib/supabase/client";
import type { QuoteRow } from "@/types/database";
import type { BusinessProfile } from "@/types/quote";

interface QuotesHistoryProps {
  initialQuotes: QuoteRow[];
  userId: string;
  business: BusinessProfile;
  showBranding: boolean;
}

export function QuotesHistory({ initialQuotes, userId, business, showBranding }: QuotesHistoryProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((quote) =>
      [quote.quote_number, quote.customer_name, quote.service, quote.location]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [quotes, query]);

  async function handleDuplicate(quote: QuoteRow) {
    const supabase = createClient();
    const { data: newNumber, error: rpcError } = await supabase.rpc("generate_quote_number", {
      p_user_id: userId,
    });
    if (rpcError || !newNumber) throw rpcError ?? new Error("Could not generate quote number");

    const { data: inserted, error: insertError } = await supabase
      .from("quotes")
      .insert({
        user_id: userId,
        quote_number: newNumber,
        customer_name: quote.customer_name,
        original_message: quote.original_message,
        ai_reply: quote.ai_reply,
        service: quote.service,
        description: quote.description,
        location: quote.location,
        quantity: quote.quantity,
        unit_price: quote.unit_price,
        vat_rate: quote.vat_rate,
        subtotal: quote.subtotal,
        vat_amount: quote.vat_amount,
        total: quote.total,
        notes: quote.notes,
        status: "draft",
      })
      .select()
      .single();

    if (insertError || !inserted) throw insertError ?? new Error("Could not duplicate quote");
    setQuotes((prev) => [inserted as QuoteRow, ...prev]);
  }

  async function handleDelete(quote: QuoteRow) {
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().eq("id", quote.id);
    if (error) throw error;
    setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
  }

  if (quotes.length === 0) {
    return <EmptyQuotesState />;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          id="quote-search"
          aria-label="Search quotes"
          placeholder="Search by customer, service, or quote number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-ink-faint">
          No quotes match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((quote) => (
            <QuoteHistoryRow
              key={quote.id}
              quote={quote}
              business={business}
              showBranding={showBranding}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
