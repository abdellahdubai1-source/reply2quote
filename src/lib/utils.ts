import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QuoteFormState, QuoteTotals, VatOption } from "@/types/quote";

/** Merge Tailwind classes safely (handles conflicting utility classes). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function vatRateFromOption(option: VatOption): number {
  return option === "5" ? 5 : 0;
}

/** Single source of truth for quote math — used by the live preview,
 *  the PDF generator, and (indirectly) whatever gets saved to the DB.
 *  Keeping this pure and in one place is what guarantees the preview,
 *  PDF, and saved record can never disagree with each other. */
export function calculateTotals(form: Pick<QuoteFormState, "quantity" | "unitPrice" | "vatOption">): QuoteTotals {
  const quantity = Number.isFinite(form.quantity) ? form.quantity : 0;
  const unitPrice = Number.isFinite(form.unitPrice) ? form.unitPrice : 0;
  const subtotal = round2(quantity * unitPrice);
  const vatRate = vatRateFromOption(form.vatOption);
  const vatAmount = round2(subtotal * (vatRate / 100));
  const total = round2(subtotal + vatAmount);
  return { subtotal, vatRate, vatAmount, total };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency = "AED"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${currency} ${safe.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Friendly, non-technical error messages for the UI. Never surface
 *  raw stack traces or provider error codes to a business owner. */
export function friendlyError(context: "ai" | "pdf" | "save" | "auth" | "network" | "generic"): string {
  switch (context) {
    case "ai":
      return "Something went wrong while generating your reply. Please try again.";
    case "pdf":
      return "We couldn't create the PDF just now. Please try again in a moment.";
    case "save":
      return "We couldn't save your quote. Please check your connection and try again.";
    case "auth":
      return "Your session has expired. Please sign in again.";
    case "network":
      return "You appear to be offline. Please check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
