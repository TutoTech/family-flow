/**
 * Hook de gestion des modèles de tâches (task templates).
 * Permet de lister, modifier, supprimer et activer/désactiver
 * les modèles de tâches récurrentes d'une famille.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  points_reward: number;
  due_time: string;
  recurrence_type: string;
  assigned_to_user_id: string;
  requires_photo: boolean;
  overdue_penalty_enabled: boolean;
  overdue_penalty_points: number;
  is_obligatory: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export function useTaskTemplates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  /** Liste tous les modèles de tâches de la famille */
  const templatesQuery = useQuery({
    queryKey: ["task-templates", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .eq("family_id", familyId!)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: !!familyId,
  });

  /** Met à jour un modèle de tâche existant */
  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("task_templates")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  /** Supprime un modèle de tâche et ses instances associées */
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("task_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  /** Active ou désactive un modèle de tâche (sans le supprimer) */
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("task_templates")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
    },
  });

  /** Réorganise dynamiquement une liste de modèles de tâches */
  const reorderTemplates = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      // Exécute les promesses de mise à jour en parallèle
      const promises = updates.map((update) => 
        supabase
          .from("task_templates")
          .update({ display_order: update.display_order })
          .eq("id", update.id)
      );
      
      const results = await Promise.all(promises);
      const firstError = results.find((r) => r.error);
      if (firstError) throw firstError.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    updateTemplate,
    deleteTemplate,
    toggleActive,
    reorderTemplates,
  };
}
