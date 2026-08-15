"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { BusinessProfile } from "@/types/quote";

interface BusinessQuickSetupProps {
  initial: BusinessProfile;
  isAuthed: boolean;
  saving?: boolean;
  onSave: (profile: BusinessProfile) => void | Promise<void>;
}

/**
 * The minimal business details needed to put a real business name and
 * contact info on a quotation PDF. Shown inline, once, right before
 * the first PDF is generated — not a long registration form up front.
 * Guests get this saved to their browser only; signed-in users get it
 * saved to their account profile (full profile page can add the rest
 * later: logo, address, TRN).
 */
export function BusinessQuickSetup({ initial, isAuthed, saving, onSave }: BusinessQuickSetupProps) {
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [email, setEmail] = useState(initial.email);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!businessName.trim()) {
      setError("Business name is required so it can appear on your quotation.");
      return;
    }
    setError(null);
    await onSave({ ...initial, businessName: businessName.trim(), phone, whatsapp, email });
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-brand-700" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-ink">Quick business setup</h3>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Add your business details so they appear on the quotation. This takes 10 seconds
        {!isAuthed && " — you can create a free account later to save it for next time"}.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          id="qs-businessName"
          label="Business Name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Bright Clean Services"
        />
        <Input
          id="qs-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+971 5X XXX XXXX"
        />
        <Input
          id="qs-whatsapp"
          label="WhatsApp"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+971 5X XXX XXXX"
        />
        <Input
          id="qs-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
        />
      </div>

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}

      <Button type="button" onClick={handleSave} loading={saving} className="mt-4">
        Save &amp; Continue
      </Button>
    </div>
  );
}
