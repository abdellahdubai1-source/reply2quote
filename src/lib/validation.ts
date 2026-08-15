import { z } from "zod";

/** Request body for POST /api/ai/analyze */
export const aiAnalyzeRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Please paste the customer's message first.")
    .max(4000, "That message is too long — please shorten it."),
});
export type AiAnalyzeRequest = z.infer<typeof aiAnalyzeRequestSchema>;

/** Structured shape we ask the AI to return. Every extracted field is
 *  a string so the model can safely leave things blank rather than
 *  guess — we never coerce a blank into an invented value. */
export const extractedFieldsSchema = z.object({
  customerName: z.string().max(120).default(""),
  service: z.string().max(160).default(""),
  description: z.string().max(600).default(""),
  location: z.string().max(160).default(""),
  quantity: z.string().max(60).default(""),
  requestedDate: z.string().max(80).default(""),
});

export const repliesSchema = z.object({
  professional: z.string().max(1200).default(""),
  friendly: z.string().max(1200).default(""),
  short: z.string().max(600).default(""),
});

export const aiAnalyzeResponseSchema = z.object({
  extracted: extractedFieldsSchema,
  replies: repliesSchema,
});
export type AiAnalyzeResponse = z.infer<typeof aiAnalyzeResponseSchema>;

/** Quote builder form validation. Price is always business-owner
 *  controlled — the AI is never allowed to set it. */
export const quoteFormSchema = z.object({
  customerName: z.string().max(120).optional().default(""),
  service: z.string().trim().min(1, "Please describe the service.").max(160),
  description: z.string().max(1000).optional().default(""),
  location: z.string().max(160).optional().default(""),
  quantity: z
    .number({ invalid_type_error: "Enter a valid quantity." })
    .positive("Quantity must be greater than 0.")
    .max(100000, "That quantity looks too large."),
  unitPrice: z
    .number({ invalid_type_error: "Enter a valid price." })
    .min(0, "Price cannot be negative.")
    .max(10_000_000, "That price looks too large."),
  vatOption: z.enum(["none", "5"]),
  notes: z.string().max(1000).optional().default(""),
});
export type QuoteFormInput = z.infer<typeof quoteFormSchema>;

/** Business profile form validation. */
export const businessProfileSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required.").max(160),
  phone: z.string().max(40).optional().default(""),
  whatsapp: z.string().max(40).optional().default(""),
  email: z.string().email("Enter a valid email.").or(z.literal("")).optional().default(""),
  address: z.string().max(300).optional().default(""),
  trn: z.string().max(40).optional().default(""),
  vatRegistered: z.boolean().default(false),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const authEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
