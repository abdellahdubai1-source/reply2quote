"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LoadingLine } from "@/components/ui/Spinner";
import { analyzeMessage } from "@/lib/ai/analyzeMessage";
import type { AiAnalyzeResult } from "@/types/quote";

const EXAMPLE_MESSAGE = "Hi, I need AC cleaning for my 2-bedroom apartment in Dubai Marina. How much?";

interface MessageStepProps {
  initialMessage?: string;
  autoRun?: boolean;
  onResult: (result: AiAnalyzeResult, originalMessage: string) => void;
  disabled?: boolean;
}

export function MessageStep({ initialMessage, autoRun, onResult, disabled }: MessageStepProps) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [phase, setPhase] = useState<"idle" | "understanding" | "preparing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const hasAutoRun = useRef(false);

  async function runAnalysis(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setError("Please paste the customer's message first.");
      setPhase("error");
      return;
    }

    setError(null);
    setPhase("understanding");
    const phaseTimer = setTimeout(() => setPhase("preparing"), 1000);

    const result = await analyzeMessage(trimmed);
    clearTimeout(phaseTimer);

    if (result.data) {
      onResult(result.data, trimmed);
      if (!result.ok && result.error) {
        setError(result.error);
        setPhase("error");
      } else {
        setPhase("idle");
      }
    } else {
      setError(result.error ?? "Something went wrong while generating your reply. Please try again.");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (autoRun && initialMessage && !hasAutoRun.current) {
      hasAutoRun.current = true;
      runAnalysis(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, initialMessage]);

  const isLoading = phase === "understanding" || phase === "preparing";

  return (
    <div className="space-y-4">
      <Textarea
        id="customer-message"
        label="Customer message"
        placeholder={EXAMPLE_MESSAGE}
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading || disabled}
        hint="Paste exactly what the customer sent you on WhatsApp or elsewhere."
      />

      {phase === "error" && error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isLoading ? (
          <LoadingLine text={phase === "understanding" ? "Understanding customer request…" : "Preparing your professional reply…"} />
        ) : (
          <span />
        )}
        <Button
          type="button"
          size="lg"
          loading={isLoading}
          disabled={disabled}
          onClick={() => runAnalysis(message)}
          className="w-full sm:w-auto"
        >
          {!isLoading && <Sparkles className="h-4 w-4" aria-hidden="true" />}
          Generate Reply &amp; Quote
        </Button>
      </div>
    </div>
  );
}
