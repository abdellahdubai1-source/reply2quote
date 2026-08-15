/** sessionStorage key used to hand off the hero textarea message to
 *  the /new workflow page without a long query string. */
export const PENDING_MESSAGE_KEY = "reply2quote_pending_message";

/** localStorage key for a guest's (not-yet-signed-up) business details,
 *  used to populate the PDF header before they have an account. */
export const GUEST_BUSINESS_KEY = "reply2quote_guest_business";

export const FREE_PLAN_MONTHLY_QUOTE_LIMIT = 3;

/** Guest quote usage is stored locally so the public try-before-signup flow
 * respects the same Free plan limit. This is a product guardrail, not a
 * security boundary; authenticated usage is enforced against Supabase rows. */
export const GUEST_QUOTE_USAGE_KEY = "reply2quote_guest_quote_usage";

export const INDUSTRY_TAGS = [
  "Cleaning",
  "Maintenance",
  "AC Services",
  "Freelancers",
  "Garages",
  "Decorators",
  "Agencies",
  "Salons",
  "Home Services",
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Paste Message",
    description: "Paste the customer's WhatsApp or enquiry message.",
  },
  {
    step: 2,
    title: "AI Creates Reply",
    description: "AI understands the request and prepares a professional response.",
  },
  {
    step: 3,
    title: "Set Price",
    description: "Review the service details and enter or edit your price.",
  },
  {
    step: 4,
    title: "Send Quote",
    description: "Generate the quotation and share it with the customer.",
  },
] as const;
