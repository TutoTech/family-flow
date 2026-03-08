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
  is_active: boolean;
  created_at: string;
}

export function useTaskTemplates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  const templatesQuery = useQuery({
    queryKey: ["task-templates", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .eq("family_id", familyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: !!familyId,
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("task_templates")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

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

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    updateTemplate,
    deleteTemplate,
    toggleActive,
  };
}
