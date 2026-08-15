"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, MessageCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Alert } from "@/components/ui/Alert";
import { downloadQuotePdf } from "@/lib/pdf/generateQuotePdf";
import { buildQuoteWhatsAppMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { formatCurrency, friendlyError } from "@/lib/utils";
import type { BusinessProfile, QuoteFormState, QuoteTotals } from "@/types/quote";

interface QuoteActionsProps {
  quoteNumber: string;
  business: BusinessProfile;
  quote: QuoteFormState;
  totals: QuoteTotals;
  showBranding: boolean;
  isAuthed: boolean;
  onMarkedSent?: () => void;
}

export function QuoteActions({
  quoteNumber,
  business,
  quote,
  totals,
  showBranding,
  isAuthed,
  onMarkedSent,
}: QuoteActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function handleDownload() {
    setPdfError(null);
    setDownloading(true);
    try {
      await downloadQuotePdf({
        quoteNumber,
        date: new Date(),
        business,
        quote,
        totals,
        showBranding,
      });
    } catch {
      setPdfError(friendlyError("pdf"));
    } finally {
      setDownloading(false);
    }
  }

  function handleWhatsApp() {
    const text = buildQuoteWhatsAppMessage({
      businessName: business.businessName,
      quoteNumber,
      customerName: quote.customerName,
      service: quote.service,
      total: formatCurrency(totals.total, quote.currency),
    });
    window.open(buildWhatsAppLink(text), "_blank", "noopener,noreferrer");
    onMarkedSent?.();
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <PartyPopper className="h-5 w-5 text-brand-700" aria-hidden="true" />
        <h3 className="text-base font-semibold text-ink">Quote {quoteNumber} is ready</h3>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Download the PDF, then share it with your customer on WhatsApp.
      </p>

      {pdfError && (
        <Alert tone="error" className="mt-3">
          {pdfError}
        </Alert>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={handleDownload} loading={downloading} className="sm:flex-1">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download PDF
        </Button>
        <Button type="button" variant="secondary" onClick={handleWhatsApp} className="sm:flex-1">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Share on WhatsApp
        </Button>
      </div>
      <p className="mt-2.5 text-xs text-ink-faint">
        Browsers can't attach files to WhatsApp automatically — download the PDF first, then attach it
        in the WhatsApp chat that opens.
      </p>

      {!isAuthed && (
        <Alert tone="info" className="mt-4">
          <span className="font-medium text-ink">Save this quote for later.</span>{" "}
          <Link href="/signup" className="font-medium text-brand-700 underline underline-offset-2">
            Create a free account
          </Link>{" "}
          to keep your business details, quote history, and quote numbers in one place.
        </Alert>
      )}

      {isAuthed && (
        <div className="mt-4">
          <ButtonLink href="/quotes" variant="ghost" size="sm">
            View in Quote History →
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
