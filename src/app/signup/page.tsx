import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Start Free",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your free account"
      subtitle="Save your business details and quote history. No credit card required."
      footer={
        <>
          Just trying it out?{" "}
          <Link href="/new" className="font-medium text-brand-700 hover:underline">
            Skip signup
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
