import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuoteRow as QuoteRowType } from "@/types/database";

export function QuoteRow({ quote }: { quote: QuoteRowType }) {
  return (
    <Link
      href={`/quotes/${quote.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white px-4 py-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{quote.quote_number}</span>
          <StatusBadge status={quote.status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-soft">
          {quote.customer_name || "Unnamed customer"} &middot; {quote.service || "Service"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{formatCurrency(quote.total)}</p>
          <p className="text-xs text-ink-faint">{formatDate(quote.created_at)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden="true" />
      </div>
    </Link>
  );
}
