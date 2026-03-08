import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type FamilyPlan = "free" | "family";

const FREE_LIMITS = { maxParents: 1, maxChildren: 1 };
const FAMILY_LIMITS = { maxParents: 2, maxChildren: 99 };

export function useFamilyPlan() {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<FamilyPlan>("free");
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!profile?.family_id) {
      setPlan("free");
      setLoading(false);
      return;
    }

    // Use rpc or raw select to get the plan column that may not be in generated types yet
    const { data } = await supabase
      .from("families")
      .select("*")
      .eq("id", profile.family_id)
      .single();

    const familyPlan = data?.plan;
    setPlan(familyPlan === "family" ? "family" : "free");
    setLoading(false);
  }, [profile?.family_id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const limits = plan === "family" ? FAMILY_LIMITS : FREE_LIMITS;

  const verifyPayment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment");
      if (!error && data?.plan) {
        setPlan(data.plan as FamilyPlan);
        // Re-fetch from DB to confirm
        await fetchPlan();
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchPlan]);

  const startPayment = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-payment");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  }, []);

  return { plan, loading, limits, startPayment, verifyPayment, refetch: fetchPlan };
}
