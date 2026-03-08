/**
 * Hook de statistiques hebdomadaires.
 * Calcule les tâches complétées, pénalités et points gagnés
 * jour par jour et semaine par semaine, sur les N dernières semaines.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

/** Statistiques d'une journée */
export interface DailyStats {
  date: string;
  label: string;
  tasksCompleted: number;
  penalties: number;
  pointsEarned: number;
}

/** Vue d'ensemble d'une semaine */
export interface WeeklyOverview {
  weekLabel: string;
  tasksCompleted: number;
  penalties: number;
  pointsEarned: number;
}

/**
 * @param weeksBack - Nombre de semaines à remonter (défaut : 4)
 * @param childId - Filtre optionnel sur un enfant spécifique
 */
export function useWeeklyStats(weeksBack = 4, childId?: string | null) {
  const { profile } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.family_id) return;

    const fetchStats = async () => {
      setLoading(true);
      const now = new Date();
      // Calcul de la plage de dates couverte
      const startDate = startOfWeek(subWeeks(now, weeksBack - 1), { weekStartsOn: 1 });
      const endDate = endOfWeek(now, { weekStartsOn: 1 });

      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // Récupère les tâches complétées/validées sur la période
      let tasksQuery = supabase
        .from("task_instances")
        .select("scheduled_for_date, status, task_template_id")
        .eq("family_id", profile.family_id!)
        .in("status", ["validated", "done", "awaiting_validation"])
        .gte("scheduled_for_date", startStr)
        .lte("scheduled_for_date", endStr);

      if (childId) {
        tasksQuery = tasksQuery.eq("assigned_to_user_id", childId);
      }

      const { data: tasks } = await tasksQuery;

      // Construit une map template_id → points pour le calcul
      const { data: templates } = await supabase
        .from("task_templates")
        .select("id, points_reward")
        .eq("family_id", profile.family_id!);

      const pointsMap = new Map<string, number>();
      templates?.forEach((t) => pointsMap.set(t.id, t.points_reward));

      // Récupère les pénalités sur la période
      let penaltiesQuery = supabase
        .from("penalties_log")
        .select("created_at")
        .eq("family_id", profile.family_id!)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (childId) {
        penaltiesQuery = penaltiesQuery.eq("child_id", childId);
      }

      const { data: penalties } = await penaltiesQuery;

      // Construction des statistiques jour par jour
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const daily: DailyStats[] = allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasks?.filter((t) => t.scheduled_for_date === dateStr) || [];
        const dayPenalties = penalties?.filter((p) => p.created_at.startsWith(dateStr)) || [];
        // Seules les tâches validées comptent pour les points
        const points = dayTasks.reduce((sum, t) => {
          if (t.status === "validated") return sum + (pointsMap.get(t.task_template_id) || 0);
          return sum;
        }, 0);

        return {
          date: dateStr,
          label: format(day, "EEE dd", { locale: fr }),
          tasksCompleted: dayTasks.length,
          penalties: dayPenalties.length,
          pointsEarned: points,
        };
      });

      setDailyStats(daily);

      // Agrégation par semaine
      const weekly: WeeklyOverview[] = [];
      for (let i = 0; i < weeksBack; i++) {
        const wStart = startOfWeek(subWeeks(now, weeksBack - 1 - i), { weekStartsOn: 1 });
        const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
        const wStartStr = format(wStart, "yyyy-MM-dd");
        const wEndStr = format(wEnd, "yyyy-MM-dd");

        const weekDays = daily.filter((d) => d.date >= wStartStr && d.date <= wEndStr);
        weekly.push({
          weekLabel: `Sem. ${format(wStart, "dd/MM")}`,
          tasksCompleted: weekDays.reduce((s, d) => s + d.tasksCompleted, 0),
          penalties: weekDays.reduce((s, d) => s + d.penalties, 0),
          pointsEarned: weekDays.reduce((s, d) => s + d.pointsEarned, 0),
        });
      }

      setWeeklyStats(weekly);
      setLoading(false);
    };

    fetchStats();
  }, [profile?.family_id, weeksBack, childId]);

  return { dailyStats, weeklyStats, loading };
}
