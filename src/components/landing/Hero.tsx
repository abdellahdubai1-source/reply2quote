"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PENDING_MESSAGE_KEY } from "@/lib/constants";

const EXAMPLE_MESSAGE =
  "Hi, I need AC cleaning for my 2-bedroom apartment in Dubai Marina. How much?";

export function Hero() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const value = message.trim();
    try {
      if (value) {
        window.sessionStorage.setItem(PENDING_MESSAGE_KEY, value);
      }
    } catch {
      // sessionStorage unavailable — /new still works, just without prefill.
    }
    router.push("/new");
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container flex flex-col items-center pb-16 pt-14 text-center sm:pb-20 sm:pt-20">
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl">
          Turn Customer Messages Into Professional Quotes in Seconds.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-ink-soft">
          Paste a customer message. Get a professional reply and a ready-to-send quotation
          instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-2xl text-left">
          <Textarea
            id="hero-message"
            aria-label="Customer message"
            placeholder={EXAMPLE_MESSAGE}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-base shadow-card"
          />
          <div className="mt-4 flex flex-col items-center gap-3">
            <Button type="submit" size="lg" fullWidth loading={submitting} className="sm:w-auto sm:px-10">
              Generate Reply &amp; Quote
              {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <p className="flex items-center gap-1.5 text-sm text-ink-faint">
              <ShieldCheck className="h-4 w-4 text-brand-700" aria-hidden="true" />
              No credit card required &bull; Built for UAE businesses
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
