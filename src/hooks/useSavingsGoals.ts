import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";

export interface SavingsGoal {
  id: string;
  child_id: string;
  family_id: string;
  title: string;
  icon: string;
  target_amount: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useSavingsGoals() {
  const { user, profile } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;

  const goalsQuery = useQuery({
    queryKey: ["savings-goals", familyId, viewUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("family_id", familyId!)
        .eq("child_id", viewUserId!)
        .order("is_completed", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!familyId && !!viewUserId,
  });

  const createGoal = useMutation({
    mutationFn: async ({ title, icon, targetAmount }: { title: string; icon: string; targetAmount: number }) => {
      const { error } = await supabase.from("savings_goals").insert({
        child_id: user!.id,
        family_id: familyId!,
        title,
        icon,
        target_amount: targetAmount,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savings-goals"] }),
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; icon?: string; target_amount?: number; is_completed?: boolean; completed_at?: string | null }) => {
      const { error } = await supabase
        .from("savings_goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savings-goals"] }),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savings-goals"] }),
  });

  return { goals: goalsQuery.data ?? [], isLoading: goalsQuery.isLoading, createGoal, updateGoal, deleteGoal };
}
