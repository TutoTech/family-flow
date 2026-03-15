/**
 * Hooks de gestion des récompenses et des statistiques enfant.
 * - useChildStats : statistiques d'un enfant (points, wallet, série).
 * - useFamilyRewards : liste des récompenses actives de la famille.
 * - useMyRedemptions : historique des demandes de récompenses de l'enfant connecté.
 * - usePendingRedemptions : demandes en attente d'approbation (côté parent).
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Récupère les statistiques d'un enfant (points, wallet, série, pénalités du jour) */
export function useChildStats(childId?: string) {
  const { user, role } = useAuth();
  // Utilise le childId passé en paramètre, ou l'id de l'utilisateur courant si c'est un enfant
  const id = childId ?? (role === "child" ? user?.id : undefined);

  return useQuery({
    queryKey: ["child-stats", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_stats")
        .select("*")
        .eq("child_id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/** Liste les récompenses actives de la famille, triées par coût croissant */
export function useFamilyRewards() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["rewards", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("family_id", familyId!)
        .eq("is_active", true)
        .order("cost_points", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });
}

/** Historique des 20 dernières demandes de récompenses de l'enfant connecté */
export function useMyRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["redemptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(title, icon, cost_points, cost_money)")
        .eq("child_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

/** Demandes de récompenses en attente d'approbation par un parent */
export function usePendingRedemptions() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["pending-redemptions", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(title, icon, cost_points, cost_money, family_id)")
        .eq("status", "requested")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Filtre côté client par famille (sécurité supplémentaire, RLS gère déjà)
      return data?.filter((r: any) => r.reward?.family_id === familyId) ?? [];
    },
    enabled: !!familyId,
  });
}
