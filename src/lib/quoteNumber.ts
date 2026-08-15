const GUEST_COUNTER_KEY = "reply2quote_guest_quote_counter";

/**
 * Signed-in users get a durable, gap-free quote number from the
 * `generate_quote_number` Postgres function (see supabase/migrations).
 * Guests trying the product before signing up still need a quote
 * number for the PDF, so we keep a lightweight per-browser counter in
 * localStorage. It resets if they clear storage or switch devices —
 * that's an acceptable tradeoff for a number that only matters once
 * they save the quote for real (which requires an account).
 */
export function nextGuestQuoteNumber(): string {
  if (typeof window === "undefined") return "RQ-1001";
  try {
    const raw = window.localStorage.getItem(GUEST_COUNTER_KEY);
    const last = raw ? parseInt(raw, 10) : 1000;
    const next = (Number.isFinite(last) ? last : 1000) + 1;
    window.localStorage.setItem(GUEST_COUNTER_KEY, String(next));
    return `RQ-${next}`;
  } catch {
    // localStorage unavailable (private browsing, etc). Fall back to a
    // timestamp-based number so the PDF still has something sensible.
    return `RQ-${1000 + (Date.now() % 900)}`;
  }
}
