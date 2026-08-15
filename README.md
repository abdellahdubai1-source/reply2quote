# Reply2Quote

AI-powered quotation software for UAE service businesses. Paste a customer's
WhatsApp message, get a professional reply and a ready-to-send quotation PDF
— in under a minute.

**Core workflow:** Customer Message → AI Reply → Quote → PDF → WhatsApp

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** — Postgres database, Auth (email + Google), Storage (logos)
- **OpenAI-compatible API** for message analysis + reply generation (server-side only)
- **jsPDF + jspdf-autotable** for the quotation PDF, generated entirely client-side
- **Zod** for input/output validation

No CRM, no staff accounts, no invoicing system — deliberately. See
"Product philosophy" below.

## Project structure

```
src/
  app/
    (marketing)/          Public landing page + pricing (shared navbar/footer)
    (app)/                 Protected app shell (dashboard, quotes, profile, billing)
    new/                    The core workflow — works for guests AND signed-in users
    login/, signup/         Auth pages
    auth/callback/          OAuth + email-confirmation + password-reset callback
    api/ai/analyze/         Server-side AI endpoint (never exposes API keys)
    api/billing/checkout/   Stub endpoint, ready for Stripe
  components/
    landing/                Homepage sections
    quote/                  The AI → reply → quote workflow (used by /new)
    quotes/                 Quote history, quote detail, shared row components
    profile/                Business profile form (incl. logo upload)
    billing/                Upgrade button
    auth/                   Login/signup forms, Google button
    app/                    Authenticated app nav + logout
    ui/                     Small design-system primitives (Button, Input, Card, ...)
  lib/
    supabase/               Browser / server / middleware Supabase clients
    pdf/generateQuotePdf.ts The PDF generator
    hooks/                  useUser, useBusinessProfile (guest vs signed-in)
    validation.ts           All Zod schemas
    whatsapp.ts             wa.me link builders
    quoteNumber.ts          Guest (localStorage) quote numbering
    rateLimit.ts            In-memory rate limiter for the AI endpoint
  types/                    Domain types + hand-written DB row types
supabase/migrations/0001_init.sql   Full schema, RLS policies, quote-number function
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of
   `supabase/migrations/0001_init.sql`. This creates the `profiles` and
   `quotes` tables, Row Level Security policies (so users can only ever see
   their own data), the `generate_quote_number()` function, and a public
   `logos` storage bucket for business logos.
3. Under **Authentication → Providers**, email/password is on by default.
   To enable "Continue with Google", turn on the Google provider and add
   your OAuth client ID/secret (see Supabase's Google OAuth guide) — set the
   redirect URL to `https://<your-domain>/auth/callback`.
4. Under **Settings → API**, copy your Project URL and anon public key.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to get it | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Not currently used by any route, kept for future admin tasks. Keep secret. |
| `OPENAI_API_KEY` | platform.openai.com (or any OpenAI-compatible provider) | Yes, for AI replies. Without it, `/new` still works — the app falls back to a manual-fill flow with a friendly notice instead of crashing. |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` | Optional, has a default |
| `OPENAI_BASE_URL` | Only if using an OpenAI-compatible proxy | Optional |
| `NEXT_PUBLIC_SITE_URL` | Your deployed domain (or `http://localhost:3000` locally) | Yes, used for SEO metadata + auth redirects |

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. Deploy to Vercel

Push to a Git repo, import it in Vercel, add the same environment variables
in **Project Settings → Environment Variables**, and deploy. No extra
Vercel configuration is required — this is a standard Next.js App Router
project.

## How the product rule is enforced in code

**"AI never sets the price."** The AI endpoint (`/api/ai/analyze`) is
instructed to never mention or invent a price, and its Zod-validated
response schema has no price field at all — there's no code path for a
price to reach the UI except what the business owner types into the Quote
Builder.

**"Try it before you sign up."** `/new` has no auth wall (see
`src/lib/supabase/middleware.ts` — only `/dashboard`, `/quotes`, `/profile`,
`/billing` require a session). A guest's business details for the PDF are
kept in `localStorage` (`useBusinessProfile` hook) until they create an
account, at which point the same hook reads/writes the `profiles` table
instead.

**"Every business only sees its own data."** Every user-owned table has Row Level
Security enabled with `auth.uid() = user_id` policies (see the migration).
The `quotes/[id]` page also double-checks `user_id` server-side and 404s
rather than leaking existence of another user's quote. Subscription state is
server-controlled: authenticated clients cannot write `profiles.plan` directly.

**"Free means 3 quotations per month."** Guest usage is tracked locally for
the try-before-signup flow. Authenticated usage is enforced again in Postgres
using a monthly usage row + insert trigger, so deleting a quote does not restore
allowance and direct API calls cannot bypass the limit.

## AI configuration notes

- The endpoint uses the OpenAI Chat Completions API with
  `response_format: { type: "json_object" }` and a strict system prompt
  that forbids inventing customer names, dates, or prices.
- The JSON response is validated with Zod (`aiAnalyzeResponseSchema`)
  before it's ever trusted — a malformed or missing field never reaches
  the UI as-is.
- If the AI call fails, times out, or `OPENAI_API_KEY` isn't set, the
  route returns a `fallback` payload so the owner can keep working
  manually instead of hitting a dead end.
- A simple in-memory rate limiter guards the endpoint (see
  `src/lib/rateLimit.ts`, which also documents how to swap in a shared
  store like Upstash Redis if you scale across many serverless instances).

## Billing / Stripe

Two plans are defined in `src/lib/plans.ts` (Free, Pro — AED 29/month).
`profiles.plan` in the database already supports `'free' | 'pro'`.
`POST /api/billing/checkout` is a stub that intentionally does **not**
fake a successful upgrade — it explains that payments aren't connected yet.
See the comment at the top of that file for the exact steps to wire up
Stripe Checkout + a webhook that flips `profiles.plan` to `'pro'`.

## A note on how this project was built

The original generated handoff was produced in a sandbox without npm registry
access. A CI workflow is included at `.github/workflows/ci.yml` so the first
GitHub push can compile-verify the project in a normal networked environment.
Run `npm install && npm run typecheck && npm run lint && npm run build` locally
when registry access is available, and do not promote a deployment until those
checks pass.

## Testing checklist

Manually walk through this before considering a deploy done — it mirrors
the core journey the product is built around:

1. Homepage loads, hero textarea works.
2. Paste a customer message → Generate → AI extracts fields + drafts 3 reply tones.
3. Edit extracted fields and the reply text.
4. Enter a price in the Quote Builder → totals update live.
5. Switch VAT to 5% → VAT + total recalculate correctly.
6. Quote preview matches what ends up in the PDF.
7. Download PDF — check spacing, no overlapping text, logo (if set) renders.
8. Share on WhatsApp — opens with a prepared message (PDF is not silently
   claimed to be attached — the UI explains you attach it yourself).
9. Create an account, confirm email if required.
10. Fill in Business Profile, upload a logo.
11. Generate + save a quote as a signed-in user → appears in Quote History.
12. Open the quote, edit it, save, duplicate it, delete the duplicate.
13. Log in from a second (test) account and confirm you cannot see the first
    account's quotes (RLS).
14. Resize to a phone width — no horizontal scroll, tap targets are large,
    "Preview Quote" toggle works on the Quote Builder step.
15. Refresh while logged in on `/dashboard` — session persists.
16. `npm run build` succeeds with no errors.

## What's intentionally not in V1

Per the product brief: no full CRM, no staff accounts, no inventory/
accounting/invoicing/receipts, no customer portal, no advanced analytics,
no Arabic UI, no multi-currency, no template marketplace, no full WhatsApp
Business API integration. The schema and structure don't block adding
these later — they're just not built now.
