/**
 * Hooks de gestion des tâches quotidiennes.
 * - useTodayTasks : récupère, complète, valide et réinitialise les tâches du jour.
 * - useFamilyChildren : liste les enfants d'une famille.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "./useProfileSwitch";
import { useEffect } from "react";

export function useTodayTasks() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  // Génère les instances de tâches du jour au chargement (via fonction RPC)
  // On attend la fin du RPC avant de rafraîchir la liste pour éviter un race condition
  useEffect(() => {
    if (familyId) {
      supabase
        .rpc("generate_daily_task_instances", { _family_id: familyId })
        .then(() => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }));
    }
  }, [familyId, queryClient]);

  /** Requête des tâches du jour avec les détails du template et les photos de preuve */
  const tasksQuery = useQuery({
    queryKey: ["today-tasks", familyId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("task_instances")
        .select(`
          *,
          task_template:task_templates(title, description, icon, points_reward, requires_photo, is_obligatory, display_order, bg_color, child_bg_color),
          evidence:task_evidence_photos(id, storage_key)
        `)
        .eq("family_id", familyId!)
        .eq("scheduled_for_date", today);

      if (error) throw error;
      
      // Tri côté client : d'abord par task_instance.display_order,
      // puis par task_template.display_order, et enfin par heure d'échéance (due_at).
      // Comme la colonne display_order de task_stances vaut 0 par défaut, les éléments non ordonnés
      // manuellement garderont leur ordre de template. S'ils sont réorganisés (0, 1, 2...), cela primera.
      const sortedData = [...(data || [])].sort((a, b) => {
        const instOrderA = a.display_order ?? 0;
        const instOrderB = b.display_order ?? 0;

        if (instOrderA !== instOrderB) {
          return instOrderA - instOrderB;
        }

        const tmplOrderA = a.task_template?.display_order ?? 0;
        const tmplOrderB = b.task_template?.display_order ?? 0;
        
        if (tmplOrderA !== tmplOrderB) {
          return tmplOrderA - tmplOrderB;
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

  /** Mutation pour clôturer manuellement une tâche ("Pas fait") et appliquer la pénalité associée.
   *  Si la pénalité automatique n'est pas activée sur le template, on applique par défaut
   *  une pénalité équivalente aux points de récompense (afin que "Pas fait" ait toujours un effet).
   *  Le retrait des points/argent et la notification sont gérés automatiquement par les triggers
   *  Postgres sur penalties_log + child_stats. */
  const markNotDone = useMutation({
    mutationFn: async (instanceId: string) => {
      if (!familyId || !user?.id) throw new Error("Family or user not found");

      // 1. Récupérer l'instance et sa configuration de pénalité
      const { data: instance, error: instanceError } = await supabase
        .from("task_instances")
        .select(`
          id,
          assigned_to_user_id,
          task_template:task_templates(title, points_reward, overdue_penalty_enabled, overdue_penalty_points)
        `)
        .eq("id", instanceId)
        .single();

      if (instanceError) throw instanceError;

      // 2. Mettre à jour le statut de la tâche
      const { error: updateError } = await supabase
        .from("task_instances")
        .update({
          status: "not_done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", instanceId);

      if (updateError) throw updateError;

      // 3. Déterminer le montant de la pénalité (avec fallback sur points_reward)
      const template = instance.task_template as any;
      const penaltyPoints =
        template?.overdue_penalty_enabled && template?.overdue_penalty_points > 0
          ? template.overdue_penalty_points
          : Math.max(1, template?.points_reward ?? 1);

      // 4. Calculer le retrait monétaire à partir du taux famille
      const { data: settings } = await supabase
        .from("family_settings")
        .select("points_to_money_rate")
        .eq("family_id", familyId)
        .single();
      const rate = settings?.points_to_money_rate ?? 0.1;
      const walletDeduction = Number((penaltyPoints * rate).toFixed(2));

      // 5. Vérifier qu'une pénalité n'a pas déjà été enregistrée pour cette instance (idempotence)
      const { data: existing } = await supabase
        .from("penalties_log")
        .select("id")
        .eq("child_id", instance.assigned_to_user_id)
        .eq("family_id", familyId)
        .eq("custom_title", template.title)
        .gte("created_at", new Date(Date.now() - 60_000).toISOString())
        .maybeSingle();

      if (existing) return; // déjà loggée dans la dernière minute

      // 6. Insérer la pénalité — les triggers Postgres se chargent de la notification
      //    et du retrait des points/argent côté child_stats.
      const { error: penaltyError } = await supabase.from("penalties_log").insert({
        child_id: instance.assigned_to_user_id,
        family_id: familyId,
        logged_by_parent_id: user.id,
        points_amount: penaltyPoints,
        wallet_amount: walletDeduction,
        custom_title: template.title,
      });

      if (penaltyError) throw penaltyError;

      // 7. Le trigger handle_penalty_logged ne déduit que pour les pénalités liées à une rule.
      //    Pour les pénalités custom (sans rule_id), on déduit manuellement child_stats.
      const { data: stats } = await supabase
        .from("child_stats")
        .select("current_points, wallet_balance")
        .eq("child_id", instance.assigned_to_user_id)
        .single();

      if (stats) {
        await supabase
          .from("child_stats")
          .update({
            current_points: Math.max(0, stats.current_points - penaltyPoints),
            wallet_balance: Math.max(0, Number(stats.wallet_balance || 0) - walletDeduction),
          })
          .eq("child_id", instance.assigned_to_user_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["child-stats"] }); // pour mettre à jour les points si perte
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["child-penalties"] });
      queryClient.invalidateQueries({ queryKey: ["recent-penalties"] });
      queryClient.invalidateQueries({ queryKey: ["activity-history"] });
    },
  });

  const updateChildTaskColor = useMutation({
    mutationFn: async ({ templateId, color }: { templateId: string; color: string }) => {
      const { error } = await supabase.rpc("update_child_task_color", {
        p_task_template_id: templateId,
        p_color: color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  /** Réorganise dynamiquement une liste d'instances de tâches du jour */
  const reorderDailyTasks = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      // Exécute les promesses de mise à jour en parallèle
      const promises = updates.map((update) => 
        supabase
          .from("task_instances")
          .update({ display_order: update.display_order })
          .eq("id", update.id)
      );
      
      const results = await Promise.all(promises);
      const firstError = results.find((r) => r.error);
      if (firstError) throw firstError.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
    },
  });

  return { 
    tasks: tasksQuery.data ?? [], 
    isLoading: tasksQuery.isLoading, 
    completeTask, validateTask, resetTask, skipTask, markNotDone, updateChildTaskColor, reorderDailyTasks
  };
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
