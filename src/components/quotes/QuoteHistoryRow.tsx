"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Download, Loader2, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, friendlyError } from "@/lib/utils";
import { downloadQuotePdf } from "@/lib/pdf/generateQuotePdf";
import type { QuoteRow } from "@/types/database";
import type { BusinessProfile } from "@/types/quote";

interface QuoteHistoryRowProps {
  quote: QuoteRow;
  business: BusinessProfile;
  showBranding: boolean;
  onDuplicate: (quote: QuoteRow) => Promise<void>;
  onDelete: (quote: QuoteRow) => Promise<void>;
}

export function QuoteHistoryRow({ quote, business, showBranding, onDuplicate, onDelete }: QuoteHistoryRowProps) {
  const [busy, setBusy] = useState<"download" | "duplicate" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleDownload() {
    setBusy("download");
    setError(null);
    try {
      await downloadQuotePdf({
        quoteNumber: quote.quote_number,
        date: new Date(quote.created_at),
        business,
        quote: {
          customerName: quote.customer_name ?? "",
          service: quote.service,
          description: quote.description ?? "",
          location: quote.location ?? "",
          quantity: quote.quantity,
          unitPrice: quote.unit_price,
          currency: "AED",
          vatOption: quote.vat_rate > 0 ? "5" : "none",
          notes: quote.notes ?? "",
        },
        totals: { subtotal: quote.subtotal, vatRate: quote.vat_rate, vatAmount: quote.vat_amount, total: quote.total },
        showBranding,
      });
    } catch {
      setError(friendlyError("pdf"));
    } finally {
      setBusy(null);
    }
  }

  async function handleDuplicate() {
    setBusy("duplicate");
    setError(null);
    try {
      await onDuplicate(quote);
    } catch {
      setError("We couldn't duplicate this quote. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setBusy("delete");
    setError(null);
    try {
      await onDelete(quote);
    } catch {
      setError("We couldn't delete this quote. Please try again.");
      setBusy(null);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/quotes/${quote.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{quote.quote_number}</span>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-soft">
            {quote.customer_name || "Unnamed customer"} &middot; {quote.service || "Service"} &middot;{" "}
            {formatDate(quote.created_at)}
          </p>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-2 hidden text-sm font-semibold text-ink sm:inline">{formatCurrency(quote.total)}</span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy !== null}
            aria-label={`Download PDF for ${quote.quote_number}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-100 hover:text-ink disabled:opacity-50"
          >
            {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={busy !== null}
            aria-label={`Duplicate ${quote.quote_number}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-100 hover:text-ink disabled:opacity-50"
          >
            {busy === "duplicate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            aria-label={confirmingDelete ? `Confirm delete ${quote.quote_number}` : `Delete ${quote.quote_number}`}
            className={`flex h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-ink-faint hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ${confirmingDelete ? "bg-red-50 text-red-600" : ""}`}
          >
            {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {confirmingDelete && <span className="text-xs font-medium">Confirm</span>}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
