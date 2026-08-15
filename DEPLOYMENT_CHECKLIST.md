# Reply2Quote deployment checklist

## Required before production

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the Supabase SQL Editor.
3. Add these Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)
   - `OPENAI_BASE_URL` (optional)
   - `NEXT_PUBLIC_SITE_URL`
4. Enable email auth in Supabase. Enable Google only if you configure its OAuth credentials.
5. Run CI / `npm run typecheck && npm run lint && npm run build`.
6. Test on mobile: message → AI reply → edit extracted details → price → VAT → PDF → WhatsApp.
7. Test two separate accounts to confirm RLS isolation.

## Billing

The Pro plan UI exists, but payment checkout is intentionally not connected. Do not advertise paid checkout as live until a payment provider and trusted webhook update `profiles.plan` to `pro`.

The database now prevents authenticated users from editing their own `plan` value and enforces the Free plan's 3-quotation monthly allowance with a server-side usage counter.
