import { FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function EmptyQuotesState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <FileText className="h-6 w-6 text-brand-700" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">No quotes yet</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-soft">
        Turn your first customer message into a professional quotation.
      </p>
      <ButtonLink href="/new" className="mt-5">
        Create First Quote
      </ButtonLink>
    </div>
  );
}
