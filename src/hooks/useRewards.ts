import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useChildStats(childId?: string) {
  const { user, role } = useAuth();
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

export function useMyRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["redemptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(title, icon, cost_points)")
        .eq("child_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function usePendingRedemptions() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["pending-redemptions", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(title, icon, cost_points, family_id)")
        .eq("status", "requested")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Filter by family (RLS handles it but be safe)
      return data?.filter((r: any) => r.reward?.family_id === familyId) ?? [];
    },
    enabled: !!familyId,
  });
}
