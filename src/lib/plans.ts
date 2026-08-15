// Centralized plan definitions. Keeping copy + limits here means the
// pricing page, billing page, and any future usage-gating logic all
// read from one place — plans can be renamed, re-priced, or a new
// tier added later without touching multiple components.

export interface PlanDefinition {
  id: "free" | "pro";
  name: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: "AED 0",
    description: "Try the full workflow, no card required.",
    features: [
      "3 quotes per month",
      "AI replies",
      "Basic quotation PDF",
      "Reply2Quote branding",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "AED 29",
    priceSuffix: "/month",
    description: "For businesses quoting customers every day.",
    features: [
      "Unlimited quotations",
      "Unlimited AI replies (fair-use limits apply)",
      "Business logo on quotes",
      "Remove Reply2Quote branding",
      "Full quote history",
      "Saved business details",
      "Professional PDF templates",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
];
