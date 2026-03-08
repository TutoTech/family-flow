/**
 * Hook de gestion du plan familial (gratuit ou premium).
 * Récupère le plan actuel, gère les limites de membres,
 * et fournit les fonctions de paiement et de vérification.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type FamilyPlan = "free" | "family";

/** Limites du plan gratuit : 1 parent, 1 enfant */
const FREE_LIMITS = { maxParents: 1, maxChildren: 1 };
/** Limites du plan famille : 2 parents, enfants illimités */
const FAMILY_LIMITS = { maxParents: 2, maxChildren: 99 };

export function useFamilyPlan() {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<FamilyPlan>("free");
  const [loading, setLoading] = useState(true);

  /** Récupère le plan de la famille depuis la base de données */
  const fetchPlan = useCallback(async () => {
    if (!profile?.family_id) {
      setPlan("free");
      setLoading(false);
      return;
    }

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

  /** Limites actuelles selon le plan */
  const limits = plan === "family" ? FAMILY_LIMITS : FREE_LIMITS;

  /** Vérifie le paiement via Stripe et met à jour le plan si nécessaire */
  const verifyPayment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment");
      if (!error && data?.plan) {
        setPlan(data.plan as FamilyPlan);
        // Re-récupère depuis la BDD pour confirmer la mise à jour
        await fetchPlan();
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchPlan]);

  /** Lance le processus de paiement Stripe (ouvre un nouvel onglet) */
  const startPayment = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-payment");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  }, []);

  return { plan, loading, limits, startPayment, verifyPayment, refetch: fetchPlan };
}
