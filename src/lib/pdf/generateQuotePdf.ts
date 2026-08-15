import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BusinessProfile, QuoteFormState, QuoteTotals } from "@/types/quote";

export interface QuotePdfInput {
  quoteNumber: string;
  date: Date;
  business: BusinessProfile;
  quote: QuoteFormState;
  totals: QuoteTotals;
  /** Free plan shows a small "Made with Reply2Quote" footer credit;
   *  Pro removes it. Defaults to true (branded) if omitted. */
  showBranding?: boolean;
}

const INK = "#0a0a0a";
const SOFT = "#525252";
const FAINT = "#8a8a8a";
const BRAND = "#047857";
const BORDER = "#e5e7eb";
const PAGE_W = 210;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

type ImageFormat = "PNG" | "JPEG" | "WEBP";

function formatFromMime(mime: string): ImageFormat {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  if (mime.includes("webp")) return "WEBP";
  return "PNG";
}

async function toDataUrl(url: string): Promise<{ dataUrl: string; ratio: number; format: ImageFormat } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const format = formatFromMime(blob.type);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ratio: dims.h > 0 ? dims.w / dims.h : 1, format };
  } catch {
    return null;
  }
}

export async function generateQuotePdf(input: QuotePdfInput): Promise<jsPDF> {
  const { business, quote, totals, quoteNumber, date } = input;
  const showBranding = input.showBranding ?? true;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let cursorY = MARGIN;
  const logo = business.logoUrl ? await toDataUrl(business.logoUrl) : null;
  const headerTop = cursorY;
  let leftX = MARGIN;

  if (logo) {
    const h = 16;
    const w = Math.min(h * logo.ratio, 32);
    try {
      doc.addImage(logo.dataUrl, logo.format, MARGIN, headerTop, w, h, undefined, "FAST");
    } catch {}
    leftX = MARGIN + w + 5;
  }

  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(business.businessName || "Your Business", leftX, headerTop + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(SOFT);
  const contactLines: string[] = [];
  if (business.phone) contactLines.push(`Tel: ${business.phone}`);
  if (business.whatsapp) contactLines.push(`WhatsApp: ${business.whatsapp}`);
  if (business.email) contactLines.push(business.email);
  if (business.address) contactLines.push(business.address);
  if (business.vatRegistered && business.trn) contactLines.push(`TRN: ${business.trn}`);

  let contactY = headerTop + 11;
  for (const line of contactLines) {
    doc.text(line, leftX, contactY);
    contactY += 4.2;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(BRAND);
  doc.text("QUOTATION", PAGE_W - MARGIN, headerTop + 6, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(SOFT);
  doc.text(`Quote No: ${quoteNumber}`, PAGE_W - MARGIN, headerTop + 13, { align: "right" });
  doc.text(`Date: ${formatDate(date)}`, PAGE_W - MARGIN, headerTop + 18, { align: "right" });

  cursorY = Math.max(contactY, headerTop + 22) + 4;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, cursorY, PAGE_W - MARGIN, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(FAINT);
  doc.text("PREPARED FOR", MARGIN, cursorY);
  cursorY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(INK);
  doc.text(quote.customerName?.trim() || "Valued Customer", MARGIN, cursorY);
  cursorY += 4;
  if (quote.location) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(SOFT);
    doc.text(quote.location, MARGIN, cursorY + 2);
    cursorY += 2;
  }
  cursorY += 8;

  const descriptionCell = quote.description?.trim()
    ? `${quote.service}\n${quote.description.trim()}`
    : quote.service || "Service";

  autoTable(doc, {
    startY: cursorY,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: [[descriptionCell, String(quote.quantity), formatCurrency(quote.unitPrice, quote.currency), formatCurrency(quote.quantity * quote.unitPrice, quote.currency)]],
    styles: { font: "helvetica", fontSize: 9.5, textColor: INK, cellPadding: 4, lineColor: BORDER, lineWidth: 0.25, valign: "top" },
    headStyles: { fillColor: [4, 120, 87], textColor: 255, fontStyle: "bold", halign: "left" },
    columnStyles: {
      0: { cellWidth: CONTENT_W - 74 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
    },
    theme: "grid",
  } as Parameters<typeof autoTable>[1]);

  const tableDoc = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  cursorY = (tableDoc.lastAutoTable?.finalY ?? cursorY) + 8;

  const totalsX2 = PAGE_W - MARGIN;
  const totalsX1 = totalsX2 - 70;

  const totalsRow = (label: string, value: string, opts?: { bold?: boolean; accent?: boolean }) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.bold ? 11.5 : 9.5);
    doc.setTextColor(opts?.accent ? BRAND : opts?.bold ? INK : SOFT);
    doc.text(label, totalsX1, cursorY);
    doc.text(value, totalsX2, cursorY, { align: "right" });
    cursorY += opts?.bold ? 7 : 6;
  };

  totalsRow("Subtotal", formatCurrency(totals.subtotal, quote.currency));
  totalsRow(totals.vatRate > 0 ? `VAT (${totals.vatRate}%)` : "VAT", totals.vatRate > 0 ? formatCurrency(totals.vatAmount, quote.currency) : "Not applicable");
  doc.setDrawColor(BORDER);
  doc.line(totalsX1, cursorY - 3, totalsX2, cursorY - 3);
  totalsRow("TOTAL", formatCurrency(totals.total, quote.currency), { bold: true, accent: true });
  cursorY += 4;

  const PAGE_H = doc.internal.pageSize.getHeight();
  const FOOTER_RESERVE = 26;

  if (quote.notes?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const noteLines = doc.splitTextToSize(quote.notes.trim(), CONTENT_W);
    const noteBlockHeight = 5 + noteLines.length * 4.6 + 4;
    if (cursorY + noteBlockHeight > PAGE_H - FOOTER_RESERVE) {
      doc.addPage();
      cursorY = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(FAINT);
    doc.text("NOTES", MARGIN, cursorY);
    cursorY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(SOFT);
    doc.text(noteLines, MARGIN, cursorY);
  }

  const footerY = PAGE_H - 18;
  doc.setDrawColor(BORDER);
  doc.line(MARGIN, footerY - 8, PAGE_W - MARGIN, footerY - 8);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(SOFT);
  doc.text("Thank you for choosing us.", MARGIN, footerY - 2);

  if (showBranding) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(FAINT);
    doc.text("Made with Reply2Quote", PAGE_W - MARGIN, footerY - 2, { align: "right" });
  }

  return doc;
}

export async function downloadQuotePdf(input: QuotePdfInput) {
  const doc = await generateQuotePdf(input);
  doc.save(`${input.quoteNumber}.pdf`);
}
