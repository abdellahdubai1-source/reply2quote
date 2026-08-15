import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reply2Quote — Turn Customer Messages Into Professional Quotes",
    template: "%s — Reply2Quote",
  },
  description:
    "AI-powered quotation software for UAE service businesses. Turn customer messages into professional replies and ready-to-send quotations in seconds.",
  keywords: [
    "quotation software UAE",
    "AI quotes",
    "WhatsApp quotation",
    "quote generator Dubai",
    "small business quoting tool",
  ],
  authors: [{ name: "Reply2Quote" }],
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: siteUrl,
    siteName: "Reply2Quote",
    title: "Reply2Quote — Turn Customer Messages Into Professional Quotes",
    description:
      "Paste a customer message. Get a professional reply and a ready-to-send quotation instantly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reply2Quote — Turn Customer Messages Into Professional Quotes",
    description:
      "Paste a customer message. Get a professional reply and a ready-to-send quotation instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
