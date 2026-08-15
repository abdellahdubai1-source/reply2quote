// Core domain types shared across the AI workflow, quote builder,
// preview, and PDF generator. Keep this the single source of truth
// for the "one message -> one reply -> one quotation" object.

export type ReplyTone = "professional" | "friendly" | "short";
export type VatOption = "none" | "5";

/** Structured fields the AI extracts from a raw customer message.
 *  Every field is optional / editable — the AI must never invent
 *  missing critical information as fact. */
export interface ExtractedFields {
  customerName: string;
  service: string;
  description: string;
  location: string;
  quantity: string;
  requestedDate: string;
}

export interface AiAnalyzeResult {
  extracted: ExtractedFields;
  replies: Record<ReplyTone, string>;
}

/** The editable quote form — the single object that drives the
 *  live preview and the PDF. */
export interface QuoteFormState {
  customerName: string;
  service: string;
  description: string;
  location: string;
  quantity: number;
  unitPrice: number;
  currency: "AED";
  vatOption: VatOption;
  notes: string;
}

export interface QuoteTotals {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export interface BusinessProfile {
  businessName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  trn: string;
  vatRegistered: boolean;
}

export const EMPTY_EXTRACTED_FIELDS: ExtractedFields = {
  customerName: "",
  service: "",
  description: "",
  location: "",
  quantity: "",
  requestedDate: "",
};

export const EMPTY_QUOTE_FORM: QuoteFormState = {
  customerName: "",
  service: "",
  description: "",
  location: "",
  quantity: 1,
  unitPrice: 0,
  currency: "AED",
  vatOption: "none",
  notes: "",
};

export const EMPTY_BUSINESS_PROFILE: BusinessProfile = {
  businessName: "",
  logoUrl: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  trn: "",
  vatRegistered: false,
};
