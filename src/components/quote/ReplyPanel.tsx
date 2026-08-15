"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { ReplyTone } from "@/types/quote";

const TONES: { id: ReplyTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "short", label: "Short" },
];

interface ReplyPanelProps {
  replies: Record<ReplyTone, string>;
  tone: ReplyTone;
  onToneChange: (tone: ReplyTone) => void;
  onReplyChange: (tone: ReplyTone, text: string) => void;
}

export function ReplyPanel({ replies, tone, onToneChange, onReplyChange }: ReplyPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(replies[tone]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — user can still select & copy manually.
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">AI Reply</span>
        <div
          role="tablist"
          aria-label="Reply tone"
          className="inline-flex rounded-lg border border-border bg-neutral-50 p-1"
        >
          {TONES.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tone === t.id}
              onClick={() => onToneChange(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tone === t.id ? "bg-white text-ink shadow-soft" : "text-ink-faint hover:text-ink-soft"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        id="ai-reply"
        aria-label="AI generated reply"
        rows={5}
        value={replies[tone]}
        onChange={(e) => onReplyChange(tone, e.target.value)}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={handleCopy} className="sm:flex-1">
          {copied ? <Check className="h-4 w-4 text-brand-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy Reply"}
        </Button>
        <a
          href={buildWhatsAppLink(replies[tone])}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:flex-1"
        >
          <Button type="button" variant="secondary" fullWidth>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Open WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
