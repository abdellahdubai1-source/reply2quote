import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhoItsFor } from "@/components/landing/WhoItsFor";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  title: "Reply2Quote — Turn Customer Messages Into Professional Quotes",
  description:
    "AI-powered quotation software for UAE service businesses. Turn customer messages into professional replies and ready-to-send quotations in seconds.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhoItsFor />
      <PricingSection />
      <FinalCta />
    </>
  );
}
