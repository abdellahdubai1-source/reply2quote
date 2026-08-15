/** Strips everything except digits from a phone number so it can be
 *  used in a wa.me link. Returns "" if nothing usable was found. */
export function sanitizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  // If the local UAE format (05XXXXXXXX) was entered without a country
  // code, assume UAE (+971) — the overwhelming majority of this
  // product's users.
  if (digits.startsWith("0") && digits.length === 10) {
    return `971${digits.slice(1)}`;
  }
  return digits;
}

/** Builds a wa.me deep link with a prefilled message. If a customer
 *  phone number is available it opens a chat directly with them;
 *  otherwise it opens WhatsApp's compose screen so the owner can pick
 *  a contact themselves. */
export function buildWhatsAppLink(message: string, phone?: string): string {
  const text = encodeURIComponent(message);
  const cleanPhone = phone ? sanitizePhoneForWhatsApp(phone) : "";
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Builds the WhatsApp message summarizing a quote. A PDF cannot be
 *  auto-attached from the browser to a wa.me link, so this message is
 *  written to stand on its own — the business owner downloads the PDF
 *  separately and attaches it in WhatsApp themselves. We're explicit
 *  about that in the UI rather than implying it happens automatically. */
export function buildQuoteWhatsAppMessage(params: {
  businessName: string;
  quoteNumber: string;
  customerName?: string;
  service: string;
  total: string;
}): string {
  const { businessName, quoteNumber, customerName, service, total } = params;
  const greetingName = customerName ? `Hi ${customerName},` : "Hi,";
  return [
    `${greetingName} thank you for your enquiry with ${businessName || "us"}.`,
    ``,
    `Quotation ${quoteNumber}`,
    `Service: ${service}`,
    `Total: ${total}`,
    ``,
    `The full quotation PDF is attached separately. Let us know if you'd like to proceed!`,
  ].join("\n");
}
