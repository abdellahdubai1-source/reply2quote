"use client";

import { Input } from "@/components/ui/Field";
import type { ExtractedFields } from "@/types/quote";

interface ExtractedFieldsPanelProps {
  fields: ExtractedFields;
  onChange: (fields: ExtractedFields) => void;
}

/** Editable AI-extracted job details. Every field can be blank — the
 *  AI is instructed to never invent missing information, so blanks
 *  here are expected and the business owner just fills them in. */
export function ExtractedFieldsPanel({ fields, onChange }: ExtractedFieldsPanelProps) {
  function set<K extends keyof ExtractedFields>(key: K, value: string) {
    onChange({ ...fields, [key]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        id="ex-customerName"
        label="Customer Name"
        placeholder="Optional if unknown"
        value={fields.customerName}
        onChange={(e) => set("customerName", e.target.value)}
      />
      <Input
        id="ex-service"
        label="Service"
        placeholder="e.g. AC Cleaning"
        value={fields.service}
        onChange={(e) => set("service", e.target.value)}
      />
      <Input
        id="ex-description"
        label="Property / Service Type"
        placeholder="e.g. 2 Bedroom Apartment"
        value={fields.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <Input
        id="ex-location"
        label="Location"
        placeholder="e.g. Dubai Marina"
        value={fields.location}
        onChange={(e) => set("location", e.target.value)}
      />
      <Input
        id="ex-quantity"
        label="Quantity"
        placeholder="Optional"
        value={fields.quantity}
        onChange={(e) => set("quantity", e.target.value)}
      />
      <Input
        id="ex-requestedDate"
        label="Requested Date"
        placeholder="Optional"
        value={fields.requestedDate}
        onChange={(e) => set("requestedDate", e.target.value)}
      />
    </div>
  );
}
