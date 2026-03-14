/**
 * Hook d'historique d'activité.
 * Agrège les tâches validées, les récompenses échangées
 * et les pénalités du dernier mois dans un flux chronologique unifié.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActivityItem {
  id: string;
  type: "task_validated" | "reward_redeemed" | "reward_approved" | "reward_rejected" | "penalty";
  title: string;
  icon: string;
  points: number;
  childName?: string;
  childId?: string;
  timestamp: string;
}

export function useActivityHistory(limit = 50) {
  const { profile, role, user } = useAuth();
  const familyId = profile?.family_id;
  const isParent = role === "parent";

  return useQuery({
    queryKey: ["activity-history", familyId, user?.id, role],
    queryFn: async (): Promise<ActivityItem[]> => {
      const activities: ActivityItem[] = [];
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const cutoff = oneMonthAgo.toISOString();

      // 1. Tâches validées dans le dernier mois
      const taskQuery = supabase
        .from("task_instances")
        .select("id, status, validated_at, assigned_to_user_id, task_template:task_templates(title, icon, points_reward)")
        .eq("family_id", familyId!)
        .eq("status", "validated")
        .gte("validated_at", cutoff)
        .order("validated_at", { ascending: false })
        .limit(limit);

      // Les enfants ne voient que leurs propres activités
      if (!isParent) taskQuery.eq("assigned_to_user_id", user!.id);

      const { data: tasks } = await taskQuery;
      tasks?.forEach((t: any) => {
        activities.push({
          id: `task-${t.id}`,
          type: "task_validated",
          title: t.task_template?.title ?? "Tâche",
          icon: t.task_template?.icon ?? "✅",
          points: t.task_template?.points_reward ?? 0,
          childId: t.assigned_to_user_id,
          timestamp: t.validated_at,
        });
      });

      // 2. Récompenses approuvées ou rejetées
      const rewardQuery = supabase
        .from("reward_redemptions")
        .select("id, status, updated_at, child_id, reward:rewards(title, icon, cost_points)")
        .in("status", ["approved", "rejected"])
        .gte("updated_at", cutoff)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (!isParent) rewardQuery.eq("child_id", user!.id);

      const { data: redemptions } = await rewardQuery;
      redemptions?.forEach((r: any) => {
        activities.push({
          id: `reward-${r.id}`,
          type: r.status === "approved" ? "reward_approved" : "reward_rejected",
          title: r.reward?.title ?? "Récompense",
          icon: r.reward?.icon ?? "🎁",
          points: -(r.reward?.cost_points ?? 0),
          childId: r.child_id,
          timestamp: r.updated_at,
        });
      });

      // 3. Pénalités appliquées
      const penaltyQuery = supabase
        .from("penalties_log")
        .select("id, created_at, child_id, points_amount, custom_title, rule:house_rules(label, icon, points_penalty)")
        .eq("family_id", familyId!)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!isParent) penaltyQuery.eq("child_id", user!.id);

      const { data: penalties } = await penaltyQuery;
      penalties?.forEach((p: any) => {
        activities.push({
          id: `penalty-${p.id}`,
          type: "penalty",
          title: p.rule?.label ?? p.custom_title ?? "Pénalité",
          icon: p.rule?.icon ?? "⚠️",
          points: -(p.rule?.points_penalty ?? p.points_amount ?? 0),
          childId: p.child_id,
          timestamp: p.created_at,
        });
      });

      // Récupère les noms des enfants pour l'affichage parent
      if (isParent && activities.length > 0) {
        const childIds = [...new Set(activities.map((a) => a.childId).filter(Boolean))];
        if (childIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, name")
            .in("user_id", childIds as string[]);
          const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.name]));
          activities.forEach((a) => {
            if (a.childId) a.childName = nameMap[a.childId];
          });
        }
      }

      // Tri final par date décroissante et limitation
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return activities.slice(0, limit);
    },
    enabled: !!familyId && !!user,
  });
}
