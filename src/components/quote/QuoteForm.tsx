"use client";

import { Input, Select, Textarea } from "@/components/ui/Field";
import type { QuoteFormState, VatOption } from "@/types/quote";

interface QuoteFormProps {
  form: QuoteFormState;
  onChange: (form: QuoteFormState) => void;
  errors?: Partial<Record<keyof QuoteFormState, string>>;
}

export function QuoteForm({ form, onChange, errors }: QuoteFormProps) {
  function set<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="space-y-4">
      <Input
        id="q-customerName"
        label="Customer Name"
        placeholder="Optional if unknown"
        value={form.customerName}
        onChange={(e) => set("customerName", e.target.value)}
      />

      <Input
        id="q-service"
        label="Service"
        required
        placeholder="e.g. AC Cleaning"
        value={form.service}
        onChange={(e) => set("service", e.target.value)}
        error={errors?.service}
      />

      <Textarea
        id="q-description"
        label="Description"
        rows={3}
        placeholder="Property, scope of work, any details worth including on the quote"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
      />

      <Input
        id="q-location"
        label="Location"
        placeholder="e.g. Dubai Marina, Dubai"
        value={form.location}
        onChange={(e) => set("location", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="q-quantity"
          label="Quantity"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={form.quantity}
          onChange={(e) => set("quantity", e.target.valueAsNumber || 0)}
          error={errors?.quantity}
        />
        <Input
          id="q-unitPrice"
          label="Price (AED)"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={form.unitPrice}
          onChange={(e) => set("unitPrice", e.target.valueAsNumber || 0)}
          error={errors?.unitPrice}
        />
      </div>

      <Select
        id="q-vat"
        label="VAT"
        value={form.vatOption}
        onChange={(e) => set("vatOption", e.target.value as VatOption)}
      >
        <option value="none">No VAT</option>
        <option value="5">5%</option>
      </Select>

      <Textarea
        id="q-notes"
        label="Notes"
        rows={2}
        placeholder="Optional — payment terms, validity, anything else"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
      />
    </div>
  );
}
