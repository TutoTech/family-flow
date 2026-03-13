/**
 * Hooks de gestion des tâches quotidiennes.
 * - useTodayTasks : récupère, complète, valide et réinitialise les tâches du jour.
 * - useFamilyChildren : liste les enfants d'une famille.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function useTodayTasks() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  // Génère les instances de tâches du jour au chargement (via fonction RPC)
  useEffect(() => {
    if (familyId) {
      supabase.rpc("generate_daily_task_instances", { _family_id: familyId });
    }
  }, [familyId]);

  /** Requête des tâches du jour avec les détails du template et les photos de preuve */
  const tasksQuery = useQuery({
    queryKey: ["today-tasks", familyId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("task_instances")
        .select(`
          *,
          task_template:task_templates(title, description, icon, points_reward, requires_photo, is_obligatory, display_order),
          evidence:task_evidence_photos(id, storage_key)
        `)
        .eq("family_id", familyId!)
        .eq("scheduled_for_date", today);

      if (error) throw error;
      
      // Tri côté client : d'abord par display_order, puis par heure d'échéance (due_at)
      const sortedData = [...(data || [])].sort((a, b) => {
        const orderA = a.task_template?.display_order ?? 0;
        const orderB = b.task_template?.display_order ?? 0;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // En cas d'égalité sur l'ordre d'affichage, on trie par heure
        const timeA = a.due_at || "";
        const timeB = b.due_at || "";
        return timeA.localeCompare(timeB);
      });

      return sortedData;
    },
    enabled: !!familyId,
  });

  /** Mutation pour marquer une tâche comme terminée (avec upload de photo optionnel) */
  const completeTask = useMutation({
    mutationFn: async ({ instanceId, photoFile }: { instanceId: string; photoFile?: File }) => {
      // Upload de la photo de preuve si fournie
      if (photoFile) {
        const filePath = `${familyId}/${instanceId}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("task-evidence")
          .upload(filePath, photoFile, { contentType: photoFile.type });
        if (uploadError) throw uploadError;

        // Enregistrement des métadonnées de la photo en base
        await supabase.from("task_evidence_photos").insert({
          task_instance_id: instanceId,
          storage_key: filePath,
          uploaded_by_user_id: user!.id,
          mime_type: photoFile.type,
        });
      }

      // Passage du statut à "en attente de validation"
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "awaiting_validation",
          completed_at: new Date().toISOString(),
        })
        .eq("id", instanceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }),
  });

  /** Mutation pour valider ou rejeter une tâche (côté parent) */
  const validateTask = useMutation({
    mutationFn: async ({ instanceId, approved }: { instanceId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: approved ? "validated" : "rejected",
          validated_at: new Date().toISOString(),
          validated_by_user_id: user!.id,
        })
        .eq("id", instanceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }),
  });

  /** Mutation pour réinitialiser une tâche au statut "en attente" */
  const resetTask = useMutation({
    mutationFn: async (instanceId: string) => {
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "pending",
          completed_at: null,
          validated_at: null,
          validated_by_user_id: null,
        })
        .eq("id", instanceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }),
  });

  /** Mutation pour marquer une tâche comme "Pas à faire" (côté enfant) */
  const skipTask = useMutation({
    mutationFn: async (instanceId: string) => {
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "skipped",
          completed_at: new Date().toISOString(),
        })
        .eq("id", instanceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }),
  });

  return { tasks: tasksQuery.data ?? [], isLoading: tasksQuery.isLoading, completeTask, validateTask, resetTask, skipTask };
}

/** Récupère la liste des enfants d'une famille (en croisant profils et rôles) */
export function useFamilyChildren() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["family-children", familyId],
    queryFn: async () => {
      // Récupère tous les membres de la famille
      const { data: members } = await supabase
        .from("profiles")
        .select("user_id, name")
        .eq("family_id", familyId!);

      if (!members) return [];

      // Filtre pour ne garder que les enfants via la table user_roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", members.map((m) => m.user_id));

      const childIds = new Set(roles?.filter((r) => r.role === "child").map((r) => r.user_id) ?? []);
      return members.filter((m) => childIds.has(m.user_id));
    },
    enabled: !!familyId,
  });
}
