"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { GUEST_BUSINESS_KEY } from "@/lib/constants";
import { EMPTY_BUSINESS_PROFILE, type BusinessProfile } from "@/types/quote";

function readGuestProfile(): BusinessProfile {
  if (typeof window === "undefined") return EMPTY_BUSINESS_PROFILE;
  try {
    const raw = window.localStorage.getItem(GUEST_BUSINESS_KEY);
    if (!raw) return EMPTY_BUSINESS_PROFILE;
    return { ...EMPTY_BUSINESS_PROFILE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_BUSINESS_PROFILE;
  }
}

/**
 * Resolves the "effective" business profile used to brand a quote PDF:
 * - Signed-in users: read/write the `profiles` table in Supabase.
 * - Guests: read/write a local-only copy in localStorage so they can
 *   try the full workflow, including PDF download, before creating an
 *   account (per product rule: don't force signup before the user has
 *   experienced the core value).
 */
export function useBusinessProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_BUSINESS_PROFILE);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (user) {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        const next: BusinessProfile = {
          businessName: data.business_name ?? "",
          logoUrl: data.logo_url ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          trn: data.trn ?? "",
          vatRegistered: data.vat_registered ?? false,
        };
        setProfile(next);
        setIsComplete(!!next.businessName);
        setPlan(data.plan ?? "free");
      } else {
        setProfile(EMPTY_BUSINESS_PROFILE);
        setIsComplete(false);
        setPlan("free");
      }
    } else {
      const guest = readGuestProfile();
      setProfile(guest);
      setIsComplete(!!guest.businessName);
      setPlan("free");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!userLoading) load();
  }, [userLoading, load]);

  const saveGuestProfile = useCallback((next: BusinessProfile) => {
    setProfile(next);
    setIsComplete(!!next.businessName);
    try {
      window.localStorage.setItem(GUEST_BUSINESS_KEY, JSON.stringify(next));
    } catch {
      // Private browsing / storage disabled — profile still works for
      // this session via component state.
    }
  }, []);

  return {
    profile,
    plan,
    isComplete,
    loading: loading || userLoading,
    isAuthed: !!user,
    user,
    refetch: load,
    saveGuestProfile,
  };
}
