/**
 * Hook de gestion du mode vacances.
 * Lit l'état depuis family_settings et fournit une mutation
 * pour activer/désactiver via les fonctions RPC atomiques.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useVacationMode() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  /** Lecture de l'état vacation_mode depuis family_settings */
  const vacationQuery = useQuery({
    queryKey: ["vacation-mode", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_settings")
        .select("vacation_mode")
        .eq("family_id", familyId!)
        .single();
      if (error) throw error;
      return data.vacation_mode as boolean;
    },
    enabled: !!familyId,
  });

  /** Mutation pour basculer le mode vacances */
  const toggleVacationMode = useMutation({
    mutationFn: async (activate: boolean) => {
      const rpcName = activate ? "activate_vacation_mode" : "deactivate_vacation_mode";
      const { error } = await supabase.rpc(rpcName, { _family_id: familyId! });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation-mode"] });
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  return {
    isVacationMode: vacationQuery.data ?? false,
    isLoading: vacationQuery.isLoading,
    toggleVacationMode,
  };
}
