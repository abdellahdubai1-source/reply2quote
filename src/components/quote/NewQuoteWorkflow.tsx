"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { MessageStep } from "@/components/quote/MessageStep";
import { ExtractedFieldsPanel } from "@/components/quote/ExtractedFieldsPanel";
import { ReplyPanel } from "@/components/quote/ReplyPanel";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { BusinessQuickSetup } from "@/components/quote/BusinessQuickSetup";
import { QuoteActions } from "@/components/quote/QuoteActions";
import { useBusinessProfile } from "@/lib/hooks/useBusinessProfile";
import { createClient } from "@/lib/supabase/client";
import { calculateTotals, cn, friendlyError } from "@/lib/utils";
import { quoteFormSchema } from "@/lib/validation";
import { nextGuestQuoteNumber } from "@/lib/quoteNumber";
import {
  FREE_PLAN_MONTHLY_QUOTE_LIMIT,
  GUEST_QUOTE_USAGE_KEY,
  PENDING_MESSAGE_KEY,
} from "@/lib/constants";
import {
  EMPTY_EXTRACTED_FIELDS,
  EMPTY_QUOTE_FORM,
  type AiAnalyzeResult,
  type BusinessProfile,
  type ExtractedFields,
  type QuoteFormState,
  type ReplyTone,
} from "@/types/quote";

const DEFAULT_REPLIES: Record<ReplyTone, string> = { professional: "", friendly: "", short: "" };

const sectionNumberClasses = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white";

export function NewQuoteWorkflow() {
  const { profile, plan, isComplete, isAuthed, user, loading: profileLoading, saveGuestProfile, refetch } =
    useBusinessProfile();

  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);
  const [autoRun, setAutoRun] = useState(false);

  const [originalMessage, setOriginalMessage] = useState("");
  const [aiResult, setAiResult] = useState<AiAnalyzeResult | null>(null);
  const [extracted, setExtracted] = useState<ExtractedFields>(EMPTY_EXTRACTED_FIELDS);
  const [replies, setReplies] = useState<Record<ReplyTone, string>>(DEFAULT_REPLIES);
  const [tone, setTone] = useState<ReplyTone>("professional");

  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(EMPTY_QUOTE_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof QuoteFormState, string>>>({});
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const replyRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Pick up a message handed off from the homepage hero, if any.
  useEffect(() => {
    try {
      const pending = window.sessionStorage.getItem(PENDING_MESSAGE_KEY);
      if (pending) {
        setInitialMessage(pending);
        setAutoRun(true);
        window.sessionStorage.removeItem(PENDING_MESSAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable — the page still works, just without prefill.
    }
  }, []);

  useEffect(() => {
    if (aiResult) replyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [aiResult]);

  useEffect(() => {
    if (showBusinessSetup) businessRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showBusinessSetup]);

  useEffect(() => {
    if (quoteNumber) actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [quoteNumber]);

  const totals = useMemo(() => calculateTotals(quoteForm), [quoteForm]);

  function extractedQuantity(value: string, fallback: number): number {
    if (!value.trim()) return fallback;
    const match = value.match(/\d+(?:\.\d+)?/);
    if (!match) return fallback;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function syncExtractedToQuote(next: ExtractedFields) {
    setExtracted(next);
    setQuoteForm((prev) => ({
      ...prev,
      customerName: next.customerName,
      service: next.service,
      description: next.description,
      location: next.location,
      quantity: extractedQuantity(next.quantity, prev.quantity),
    }));
  }

  function handleAiResult(result: AiAnalyzeResult, message: string) {
    setOriginalMessage(message);
    setAiResult(result);
    setReplies(result.replies);
    setTone("professional");
    syncExtractedToQuote(result.extracted);
    // Reset any previously generated quote — a new message starts fresh.
    setQuoteNumber(null);
    setLimitError(null);
  }

  function currentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getGuestUsageCount(): number {
    try {
      const raw = window.localStorage.getItem(GUEST_QUOTE_USAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as { month?: string; count?: number };
      return parsed.month === currentMonthKey() && Number.isFinite(parsed.count) ? Number(parsed.count) : 0;
    } catch {
      return 0;
    }
  }

  function incrementGuestUsage() {
    try {
      window.localStorage.setItem(
        GUEST_QUOTE_USAGE_KEY,
        JSON.stringify({ month: currentMonthKey(), count: getGuestUsageCount() + 1 })
      );
    } catch {
      // Storage can be unavailable in private browsing. The workflow still
      // works; authenticated users remain enforced by database usage.
    }
  }

  async function hasFreeQuoteAllowance(): Promise<boolean> {
    if (plan === "pro") return true;

    if (!isAuthed || !user) {
      return getGuestUsageCount() < FREE_PLAN_MONTHLY_QUOTE_LIMIT;
    }

    const monthStart = `${new Date().toISOString().slice(0, 7)}-01`;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quote_usage")
      .select("quote_count")
      .eq("user_id", user.id)
      .eq("month_start", monthStart)
      .maybeSingle();

    // If usage cannot be checked due to a transient backend problem, do not
    // strand a customer-facing workflow. The database insert trigger remains
    // the authoritative limit check.
    if (error) return true;
    return (data?.quote_count ?? 0) < FREE_PLAN_MONTHLY_QUOTE_LIMIT;
  }

  async function persistQuote(): Promise<{ number?: string; warning?: string; limitReached?: boolean }> {
    if (!isAuthed || !user) {
      return { number: nextGuestQuoteNumber() };
    }

    const supabase = createClient();
    try {
      const { data: generatedNumber, error: rpcError } = await supabase.rpc("generate_quote_number", {
        p_user_id: user.id,
      });
      if (rpcError || !generatedNumber) throw rpcError ?? new Error("No quote number returned");

      const { error: insertError } = await supabase.from("quotes").insert({
        user_id: user.id,
        quote_number: generatedNumber,
        customer_name: quoteForm.customerName || null,
        original_message: originalMessage || null,
        ai_reply: replies[tone] || null,
        service: quoteForm.service,
        description: quoteForm.description || null,
        location: quoteForm.location || null,
        quantity: quoteForm.quantity,
        unit_price: quoteForm.unitPrice,
        vat_rate: totals.vatRate,
        subtotal: totals.subtotal,
        vat_amount: totals.vatAmount,
        total: totals.total,
        notes: quoteForm.notes || null,
        status: "draft",
      });
      if (insertError) {
        if (insertError.message?.includes("free_plan_quote_limit_reached")) {
          return { limitReached: true };
        }
        throw insertError;
      }

      return { number: generatedNumber as string };
    } catch {
      return { number: nextGuestQuoteNumber(), warning: friendlyError("save") };
    }
  }

  /** Validates the quote form. Returns true if valid (and clears
   *  errors), false otherwise (and populates/scrolls to errors). */
  function validateQuoteForm(): boolean {
    const parsed = quoteFormSchema.safeParse({
      ...quoteForm,
      quantity: Number(quoteForm.quantity),
      unitPrice: Number(quoteForm.unitPrice),
    });

    if (!parsed.success) {
      const errors: Partial<Record<keyof QuoteFormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof QuoteFormState;
        errors[key] = issue.message;
      }
      setFormErrors(errors);
      quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }
    setFormErrors({});
    return true;
  }

  /** Actually creates the quote (DB row for signed-in users, local
   *  number for guests) and reveals the PDF/WhatsApp actions. Split
   *  out from handleGenerateQuote so it can be re-run right after the
   *  business quick-setup form saves, without depending on hook state
   *  that hasn't re-rendered yet. */
  async function runGenerate() {
    setGenerating(true);
    setSaveWarning(null);
    setLimitError(null);

    const allowed = await hasFreeQuoteAllowance();
    if (!allowed) {
      setLimitError(
        `You've used your ${FREE_PLAN_MONTHLY_QUOTE_LIMIT} free quotes this month. Upgrade to Pro for unlimited quotations.`
      );
      setGenerating(false);
      return;
    }

    const { number, warning, limitReached } = await persistQuote();
    if (limitReached || !number) {
      setLimitError(
        `You've used your ${FREE_PLAN_MONTHLY_QUOTE_LIMIT} free quotes this month. Upgrade to Pro for unlimited quotations.`
      );
      setGenerating(false);
      return;
    }

    setQuoteNumber(number);
    if (!isAuthed) incrementGuestUsage();
    if (warning) setSaveWarning(warning);
    setGenerating(false);
  }

  async function handleGenerateQuote() {
    if (!validateQuoteForm()) return;

    if (!isComplete) {
      setPendingGenerate(true);
      setShowBusinessSetup(true);
      return;
    }

    await runGenerate();
  }

  async function handleMarkedSent() {
    if (!isAuthed || !user || !quoteNumber) return;
    const supabase = createClient();
    await supabase
      .from("quotes")
      .update({ status: "sent" })
      .eq("user_id", user.id)
      .eq("quote_number", quoteNumber);
  }

  async function handleSaveBusiness(next: BusinessProfile) {
    setSavingBusiness(true);
    if (isAuthed && user) {
      const supabase = createClient();
      await supabase.from("profiles").upsert({
        user_id: user.id,
        business_name: next.businessName,
        phone: next.phone,
        whatsapp: next.whatsapp,
        email: next.email,
      });
      await refetch();
    } else {
      saveGuestProfile(next);
    }
    setSavingBusiness(false);
    setShowBusinessSetup(false);

    if (pendingGenerate) {
      setPendingGenerate(false);
      // `next` is already known-complete (BusinessQuickSetup requires a
      // business name before calling onSave), so it's safe to generate
      // immediately rather than waiting on the profile hook to re-render.
      await runGenerate();
    }
  }

  const showQuoteSection = !!aiResult;

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center gap-3">
            <span className={sectionNumberClasses}>1</span>
            <h2 className="text-base font-semibold text-ink">Paste the customer's message</h2>
          </div>
          <MessageStep initialMessage={initialMessage} autoRun={autoRun} onResult={handleAiResult} />
        </CardBody>
      </Card>

      {showQuoteSection && (
        <Card ref={replyRef} className="animate-fade-in">
          <CardBody className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={sectionNumberClasses}>2</span>
              <h2 className="text-base font-semibold text-ink">Review details &amp; reply</h2>
            </div>
            <ExtractedFieldsPanel fields={extracted} onChange={syncExtractedToQuote} />
            <div className="border-t border-border pt-5">
              <ReplyPanel
                replies={replies}
                tone={tone}
                onToneChange={setTone}
                onReplyChange={(t, text) => setReplies((prev) => ({ ...prev, [t]: text }))}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {showQuoteSection && (
        <div ref={quoteRef} className="animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <span className={sectionNumberClasses}>3</span>
            <h2 className="text-base font-semibold text-ink">Set your price &amp; generate the quote</h2>
          </div>

          <div className="mb-4 flex rounded-lg border border-border bg-neutral-50 p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("edit")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                mobileView === "edit" ? "bg-white text-ink shadow-soft" : "text-ink-faint"
              )}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                mobileView === "preview" ? "bg-white text-ink shadow-soft" : "text-ink-faint"
              )}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Preview Quote
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className={cn(mobileView === "preview" && "hidden lg:block")}>
              <CardBody>
                <QuoteForm form={quoteForm} onChange={setQuoteForm} errors={formErrors} />
                <Button
                  type="button"
                  size="lg"
                  fullWidth
                  loading={generating || profileLoading}
                  disabled={profileLoading}
                  onClick={handleGenerateQuote}
                  className="mt-6"
                >
                  Generate Quote
                </Button>
              </CardBody>
            </Card>

            <div className={cn("lg:sticky lg:top-20", mobileView === "edit" && "hidden lg:block")}>
              <QuotePreview
                business={profile}
                quote={quoteForm}
                totals={totals}
                quoteNumber={quoteNumber ?? "RQ-DRAFT"}
                showBranding={plan !== "pro"}
              />
            </div>
          </div>
        </div>
      )}

      {showBusinessSetup && (
        <div ref={businessRef} className="animate-fade-in">
          <BusinessQuickSetup initial={profile} isAuthed={isAuthed} saving={savingBusiness} onSave={handleSaveBusiness} />
        </div>
      )}

      {showQuoteSection && limitError && (
        <Alert tone="error">
          {limitError}{" "}
          <a href="/pricing" className="font-medium underline underline-offset-2">
            View Pro plan
          </a>
        </Alert>
      )}

      {quoteNumber && (
        <div ref={actionsRef} className="animate-fade-in space-y-3">
          {saveWarning && <Alert tone="error">{saveWarning}</Alert>}
          <QuoteActions
            quoteNumber={quoteNumber}
            business={profile}
            quote={quoteForm}
            totals={totals}
            showBranding={plan !== "pro"}
            isAuthed={isAuthed}
            onMarkedSent={handleMarkedSent}
          />
        </div>
      )}
    </div>
  );
}
