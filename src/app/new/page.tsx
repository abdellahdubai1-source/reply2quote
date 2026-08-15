import type { Metadata } from "next";
import { WorkflowHeader } from "@/components/quote/WorkflowHeader";
import { NewQuoteWorkflow } from "@/components/quote/NewQuoteWorkflow";

export const metadata: Metadata = {
  title: "New Reply & Quote",
  description: "Paste a customer message and generate a professional reply and quotation in seconds.",
  robots: { index: false },
};

export default function NewQuotePage() {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <WorkflowHeader />
      <main className="container max-w-3xl py-8 sm:py-10">
        <NewQuoteWorkflow />
      </main>
    </div>
  );
}
