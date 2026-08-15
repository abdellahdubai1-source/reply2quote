import { NextResponse, type NextRequest } from "next/server";
import { aiAnalyzeRequestSchema, aiAnalyzeResponseSchema, type AiAnalyzeResponse } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an assistant for UAE small service businesses (cleaning, AC service, maintenance, garages, salons, decorators, agencies, freelancers, home services). You read a raw customer enquiry message (often from WhatsApp) and do two things:

1. Extract structured job details. Only include information that is explicitly present or very strongly implied in the message. If something is not mentioned, return an empty string for it — NEVER invent or guess a customer name, price, exact date, or details that are not present. "Tomorrow", "this weekend", "ASAP" etc. are fine to keep as-is for requestedDate; do not convert to a calendar date.
2. Draft three short reply variants (professional, friendly, short) a business owner could send back to the customer. The replies must:
   - Thank the customer and acknowledge their specific request (service + property/location if known).
   - NEVER mention or invent a price — pricing is added later by the business owner. Say something like "please find our quotation below" instead.
   - Be ready to send with minimal editing.
   - "professional" is polished and businesslike (2-3 sentences).
   - "friendly" is warmer and more casual while still professional (2-3 sentences).
   - "short" is one brief sentence, ideal for a quick WhatsApp reply.

Respond with ONLY a JSON object matching exactly this shape, no extra commentary:
{
  "extracted": {
    "customerName": string,
    "service": string,
    "description": string,
    "location": string,
    "quantity": string,
    "requestedDate": string
  },
  "replies": {
    "professional": string,
    "friendly": string,
    "short": string
  }
}`;

function buildFallback(message: string): AiAnalyzeResponse {
  const trimmed = message.trim();
  const snippet = trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
  return {
    extracted: {
      customerName: "",
      service: "",
      description: snippet,
      location: "",
      quantity: "",
      requestedDate: "",
    },
    replies: {
      professional:
        "Hi, thank you for reaching out to us. We'd be happy to help with your request — please find our quotation below.",
      friendly: "Hey! Thanks for the message 🙂 We can definitely help with that — quotation coming right up.",
      short: "Thanks for your message — quotation below.",
    },
  };
}

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const clientKey = getClientKey(req);
  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate_limited",
        error: "You're generating replies a little too fast. Please wait a moment and try again.",
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds ?? 30) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_input", error: "Please paste a customer message and try again." },
      { status: 400 }
    );
  }

  const parsedInput = aiAnalyzeRequestSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_input",
        error: parsedInput.error.errors[0]?.message ?? "Please paste a customer message and try again.",
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No AI configured yet — don't hard-fail the whole workflow, let the
    // owner keep working with a manual fallback so /new is still usable
    // while the app is being set up.
    return NextResponse.json(
      {
        ok: false,
        code: "config_error",
        error: "AI replies aren't set up yet. You can still fill in the details and reply manually.",
        fallback: buildFallback(parsedInput.data.message),
      },
      { status: 200 }
    );
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: parsedInput.data.message },
        ],
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "upstream_error",
          error: "Something went wrong while generating your reply. Please try again.",
          fallback: buildFallback(parsedInput.data.message),
        },
        { status: 200 }
      );
    }

    const payload = await upstream.json();
    const content: unknown = payload?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error("Missing content in AI response");
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(content);
    } catch {
      throw new Error("AI response was not valid JSON");
    }

    const parsedOutput = aiAnalyzeResponseSchema.safeParse(rawJson);
    if (!parsedOutput.success) {
      throw new Error("AI response failed schema validation");
    }

    return NextResponse.json({ ok: true, data: parsedOutput.data }, { status: 200 });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        ok: false,
        code: timedOut ? "timeout" : "parse_error",
        error: "Something went wrong while generating your reply. Please try again.",
        fallback: buildFallback(parsedInput.data.message),
      },
      { status: 200 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}

// Ensure this route never gets statically optimized/cached.
export const dynamic = "force-dynamic";

// Re-export for type-safety in the client fetcher.
export type { AiAnalyzeResponse };
