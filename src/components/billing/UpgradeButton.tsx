"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setMessage(json.error ?? "Online payments aren't connected yet.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" onClick={handleClick} loading={loading}>
        Go Pro
      </Button>
      {message && (
        <Alert tone="info" className="mt-3">
          {message}
        </Alert>
      )}
    </div>
  );
}
