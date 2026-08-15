"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createClient } from "@/lib/supabase/client";
import { businessProfileSchema } from "@/lib/validation";
import { friendlyError } from "@/lib/utils";
import type { ProfileRow } from "@/types/database";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function BusinessProfileForm({ userId, initial }: { userId: string; initial: ProfileRow | null }) {
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";

  const [businessName, setBusinessName] = useState(initial?.business_name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [trn, setTrn] = useState(initial?.trn ?? "");
  const [vatRegistered, setVatRegistered] = useState(initial?.vat_registered ?? false);
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for your logo.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo must be smaller than 2MB.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      setError("We couldn't upload your logo. Please try a different image.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = businessProfileSchema.safeParse({
      businessName,
      phone,
      whatsapp,
      email,
      address,
      trn,
      vatRegistered,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: saveError } = await supabase.from("profiles").upsert({
      user_id: userId,
      business_name: businessName,
      phone,
      whatsapp,
      email,
      address,
      trn,
      vat_registered: vatRegistered,
      logo_url: logoUrl || null,
    });

    setSaving(false);
    if (saveError) {
      setError(friendlyError("save"));
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardBody>
        {justReset && (
          <Alert tone="success" className="mb-5">
            Password updated. You can also update your business details below.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Business Logo</span>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-neutral-50">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Business logo" className="h-full w-full object-contain" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-ink-faint" aria-hidden="true" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                >
                  {logoUrl ? "Change" : "Upload"}
                </Button>
                {logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl("")}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                aria-label="Upload business logo"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-brand-700" aria-hidden="true" />}
            </div>
          </div>

          <Input
            id="pf-businessName"
            label="Business Name"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            error={errors.businessName}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="pf-phone"
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
            <Input
              id="pf-whatsapp"
              label="WhatsApp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              error={errors.whatsapp}
            />
          </div>

          <Input
            id="pf-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Textarea
            id="pf-address"
            label="Address"
            hint="Optional"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <Input
              id="pf-trn"
              label="TRN"
              hint="Optional — Tax Registration Number"
              value={trn}
              onChange={(e) => setTrn(e.target.value)}
            />
            <div className="flex items-center gap-3 pb-2.5">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={vatRegistered}
                  onChange={(e) => setVatRegistered(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-600"
                />
                VAT Registered
              </label>
            </div>
          </div>

          {error && <Alert tone="error">{error}</Alert>}
          {saved && <Alert tone="success">Business details saved.</Alert>}

          <Button type="submit" loading={saving}>
            Save Business Details
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
