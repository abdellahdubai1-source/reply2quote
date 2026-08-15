"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Field";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { createClient } from "@/lib/supabase/client";
import { calculateTotals, cn, friendlyError } from "@/lib/utils";
import { quoteFormSchema } from "@/lib/validation";
import { downloadQuotePdf } from "@/lib/pdf/generateQuotePdf";
import type { QuoteRow, QuoteStatus } from "@/types/database";
import type { BusinessProfile, QuoteFormState } from "@/types/quote";

function rowToForm(quote: QuoteRow): QuoteFormState {
  return {
    customerName: quote.customer_name ?? "",
    service: quote.service,
    description: quote.description ?? "",
    location: quote.location ?? "",
    quantity: quote.quantity,
    unitPrice: quote.unit_price,
    currency: "AED",
    vatOption: quote.vat_rate > 0 ? "5" : "none",
    notes: quote.notes ?? "",
  };
}

export function QuoteDetailView({
  quote: initialQuote,
  business,
  showBranding,
}: {
  quote: QuoteRow;
  business: BusinessProfile;
  showBranding: boolean;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [form, setForm] = useState<QuoteFormState>(rowToForm(initialQuote));
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = calculateTotals(form);

  async function handleSave() {
    const parsed = quoteFormSchema.safeParse({
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
    });
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof QuoteFormState, string>> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[issue.path[0] as keyof QuoteFormState] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        customer_name: form.customerName || null,
        service: form.service,
        description: form.description || null,
        location: form.location || null,
        quantity: form.quantity,
        unit_price: form.unitPrice,
        vat_rate: totals.vatRate,
        subtotal: totals.subtotal,
        vat_amount: totals.vatAmount,
        total: totals.total,
        notes: form.notes || null,
      })
      .eq("id", quote.id);

    setSaving(false);
    if (updateError) {
      setError(friendlyError("save"));
      return;
    }
    setQuote((prev) => ({
      ...prev,
      customer_name: form.customerName || null,
      service: form.service,
      description: form.description || null,
      location: form.location || null,
      quantity: form.quantity,
      unit_price: form.unitPrice,
      notes: form.notes || null,
      vat_rate: totals.vatRate,
      subtotal: totals.subtotal,
      vat_amount: totals.vatAmount,
      total: totals.total,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleStatusChange(status: QuoteStatus) {
    const supabase = createClient();
    setQuote((prev) => ({ ...prev, status }));
    await supabase.from("quotes").update({ status }).eq("id", quote.id);
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadQuotePdf({
        quoteNumber: quote.quote_number,
        date: new Date(quote.created_at),
        business,
        quote: form,
        totals,
        showBranding,
      });
    } catch {
      setError(friendlyError("pdf"));
    } finally {
      setDownloading(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    setError(null);
    const supabase = createClient();
    try {
      const { data: newNumber, error: rpcError } = await supabase.rpc("generate_quote_number", {
        p_user_id: quote.user_id,
      });
      if (rpcError || !newNumber) throw rpcError ?? new Error("no number");

      const { data: inserted, error: insertError } = await supabase
        .from("quotes")
        .insert({
          user_id: quote.user_id,
          quote_number: newNumber,
          customer_name: form.customerName || null,
          original_message: quote.original_message,
          ai_reply: quote.ai_reply,
          service: form.service,
          description: form.description || null,
          location: form.location || null,
          quantity: form.quantity,
          unit_price: form.unitPrice,
          vat_rate: totals.vatRate,
          subtotal: totals.subtotal,
          vat_amount: totals.vatAmount,
          total: totals.total,
          notes: form.notes || null,
          status: "draft",
        })
        .select()
        .single();

      if (insertError || !inserted) {
        if (insertError?.message?.includes("free_plan_quote_limit_reached")) {
          setError("You've used your 3 free quotes this month. Upgrade to Pro to create more quotations.");
          setDuplicating(false);
          return;
        }
        throw insertError ?? new Error("insert failed");
      }
      router.push(`/quotes/${inserted.id}`);
    } catch {
      setError("We couldn't duplicate this quote. Please try again.");
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("quotes").delete().eq("id", quote.id);
    if (deleteError) {
      setError("We couldn't delete this quote. Please try again.");
      setDeleting(false);
      setConfirmingDelete(false);
      return;
    }
    router.push("/quotes");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/quotes" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Quotes
        </Link>
        <div className="flex items-center gap-2">
          <Select
            id="status"
            aria-label="Quote status"
            value={quote.status}
            onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
            className="!py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
          </Select>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Changes saved.</Alert>}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardBody className="space-y-5">
            <QuoteForm form={form} onChange={setForm} errors={errors} />

            <div className="flex flex-col gap-2.5 border-t border-border pt-5 sm:flex-row">
              <Button type="button" onClick={handleSave} loading={saving} className="sm:flex-1">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleDownload} loading={downloading} className="sm:flex-1">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </Button>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button type="button" variant="ghost" onClick={handleDuplicate} loading={duplicating} className="sm:flex-1">
                <Copy className="h-4 w-4" aria-hidden="true" />
                Duplicate
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                loading={deleting}
                className={cn("sm:flex-1", confirmingDelete && "bg-red-50 text-red-600 hover:bg-red-100")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {confirmingDelete ? "Confirm Delete" : "Delete"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="lg:sticky lg:top-20">
          <QuotePreview
            business={business}
            quote={form}
            totals={totals}
            quoteNumber={quote.quote_number}
            showBranding={showBranding}
          />
        </div>
      </div>
    </div>
  );
}
