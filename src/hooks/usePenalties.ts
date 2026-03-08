import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFamilyRules() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["house-rules", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("house_rules")
        .select("*")
        .eq("family_id", familyId!)
        .eq("is_active", true)
        .order("label");
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });
}

export function useFamilyChildren() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["family-children", familyId],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .eq("family_id", familyId!);
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const childIds = new Set(roles?.filter((r) => r.role === "child").map((r) => r.user_id));
      return profiles?.filter((p) => childIds.has(p.user_id)) ?? [];
    },
    enabled: !!familyId,
  });
}

export function useRecentPenalties(limit = 10) {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["recent-penalties", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penalties_log")
        .select("*, rule:house_rules(label, icon, points_penalty, wallet_penalty)")
        .eq("family_id", familyId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });
}

export function useChildPenalties(childId?: string) {
  const { user, role } = useAuth();
  const id = childId ?? (role === "child" ? user?.id : undefined);
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["child-penalties", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penalties_log")
        .select("*, rule:house_rules(label, icon, points_penalty, wallet_penalty)")
        .eq("family_id", familyId!)
        .eq("child_id", id!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!familyId,
  });
}
