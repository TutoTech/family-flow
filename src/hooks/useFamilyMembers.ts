import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FamilyMember {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: "parent" | "child";
  has_pin: boolean;
}

export function useFamilyMembers() {
  const { profile: currentProfile, user } = useAuth();

  return useQuery({
    queryKey: ["family-members", currentProfile?.family_id],
    queryFn: async () => {
      if (!currentProfile?.family_id) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, pin_code_hash")
        .eq("family_id", currentProfile.family_id)
        .eq("is_active", true);

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profiles.map((p) => p.user_id));

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role as "parent" | "child"]) ?? []);

      return profiles.map((p) => ({
        user_id: p.user_id,
        name: p.name,
        avatar_url: p.avatar_url,
        role: roleMap.get(p.user_id) ?? "child",
        has_pin: !!p.pin_code_hash,
      })) as FamilyMember[];
    },
    enabled: !!currentProfile?.family_id && !!user,
  });
}
