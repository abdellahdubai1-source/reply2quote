import { formatCurrency, formatDate } from "@/lib/utils";
import type { BusinessProfile, QuoteFormState, QuoteTotals } from "@/types/quote";

interface QuotePreviewProps {
  business: BusinessProfile;
  quote: QuoteFormState;
  totals: QuoteTotals;
  quoteNumber: string;
  showBranding?: boolean;
}

/** Visual mirror of the PDF layout, rendered live in the browser so
 *  the owner sees exactly what they're about to send before
 *  generating the actual file. */
export function QuotePreview({ business, quote, totals, quoteNumber, showBranding = true }: QuotePreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="" className="h-9 w-9 rounded-md object-contain" />
            ) : null}
            <p className="truncate text-base font-bold text-ink">{business.businessName || "Your Business"}</p>
          </div>
          <div className="mt-1.5 space-y-0.5 text-xs text-ink-faint">
            {business.phone && <p>Tel: {business.phone}</p>}
            {business.whatsapp && <p>WhatsApp: {business.whatsapp}</p>}
            {business.email && <p>{business.email}</p>}
            {business.address && <p>{business.address}</p>}
            {business.vatRegistered && business.trn && <p>TRN: {business.trn}</p>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-brand-700">QUOTATION</p>
          <p className="mt-1 text-xs text-ink-faint">Quote No: {quoteNumber}</p>
          <p className="text-xs text-ink-faint">Date: {formatDate(new Date())}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Prepared For</p>
        <p className="mt-1 text-base font-semibold text-ink">{quote.customerName || "Valued Customer"}</p>
        {quote.location && <p className="text-sm text-ink-faint">{quote.location}</p>}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-700 text-left text-white">
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-center font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Unit Price</th>
              <th className="px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-3 align-top">
                <p className="font-medium text-ink">{quote.service || "Service"}</p>
                {quote.description && <p className="mt-0.5 whitespace-pre-line text-xs text-ink-faint">{quote.description}</p>}
              </td>
              <td className="px-3 py-3 text-center align-top text-ink-soft">{quote.quantity || 0}</td>
              <td className="px-3 py-3 text-right align-top text-ink-soft">
                {formatCurrency(quote.unitPrice, quote.currency)}
              </td>
              <td className="px-3 py-3 text-right align-top font-medium text-ink">
                {formatCurrency(quote.quantity * quote.unitPrice, quote.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <div className="w-full max-w-[220px] space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal, quote.currency)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>VAT{totals.vatRate > 0 ? ` (${totals.vatRate}%)` : ""}</span>
            <span>{totals.vatRate > 0 ? formatCurrency(totals.vatAmount, quote.currency) : "—"}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold text-brand-700">
            <span>TOTAL</span>
            <span>{formatCurrency(totals.total, quote.currency)}</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{quote.notes}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm italic text-ink-faint">Thank you for choosing us.</p>
        {showBranding && <p className="text-[11px] text-ink-faint">Made with Reply2Quote</p>}
      </div>
    </div>
  );
}
