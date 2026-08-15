import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessProfileForm } from "@/components/profile/BusinessProfileForm";

export const metadata: Metadata = {
  title: "Business Profile",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Business Profile</h1>
        <p className="mt-1 text-sm text-ink-soft">
          These details appear on every quotation PDF you generate.
        </p>
      </div>

      <Suspense fallback={null}>
        <BusinessProfileForm userId={user.id} initial={profile} />
      </Suspense>
    </div>
  );
}
