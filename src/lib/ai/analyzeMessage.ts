import type { AiAnalyzeResult } from "@/types/quote";

export interface AnalyzeMessageResult {
  ok: boolean;
  data: AiAnalyzeResult | null;
  error?: string;
  usedFallback: boolean;
}

/**
 * Client-side helper for POST /api/ai/analyze. Always resolves (never
 * throws) so callers can render a friendly message instead of an
 * unhandled promise rejection — network failures, timeouts, and AI
 * provider errors are all normalized to the same shape.
 */
export async function analyzeMessage(message: string): Promise<AnalyzeMessageResult> {
  try {
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      return { ok: false, data: null, error: "Something went wrong while generating your reply. Please try again.", usedFallback: false };
    }

    if (json.ok) {
      return { ok: true, data: json.data as AiAnalyzeResult, usedFallback: false };
    }

    if (json.fallback) {
      return { ok: false, data: json.fallback as AiAnalyzeResult, error: json.error, usedFallback: true };
    }

    return { ok: false, data: null, error: json.error ?? "Something went wrong while generating your reply. Please try again.", usedFallback: false };
  } catch {
    return {
      ok: false,
      data: null,
      error: "You appear to be offline. Please check your connection and try again.",
      usedFallback: false,
    };
  }
}
