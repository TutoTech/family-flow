import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// 6 niveaux classiques avec seuils de points cumulés
export const LEVELS = [
  { level: 1, name: "Débutant", icon: "🌱", minPoints: 0, color: "text-slate-500" },
  { level: 2, name: "Apprenti", icon: "🌿", minPoints: 50, color: "text-green-500" },
  { level: 3, name: "Confirmé", icon: "⭐", minPoints: 150, color: "text-blue-500" },
  { level: 4, name: "Expert", icon: "🌟", minPoints: 400, color: "text-purple-500" },
  { level: 5, name: "Champion", icon: "🏆", minPoints: 800, color: "text-amber-500" },
  { level: 6, name: "Légende", icon: "👑", minPoints: 1500, color: "text-rose-500" },
] as const;

export const BADGES = {
  streak_7: { name: "Semaine parfaite", icon: "🔥", description: "7 jours de série" },
  streak_30: { name: "Mois parfait", icon: "🔥💎", description: "30 jours de série" },
  tasks_10: { name: "Premiers pas", icon: "🎯", description: "10 tâches validées" },
  tasks_50: { name: "En route", icon: "🚀", description: "50 tâches validées" },
  tasks_100: { name: "Centurion", icon: "💯", description: "100 tâches validées" },
  tasks_500: { name: "Machine", icon: "⚡", description: "500 tâches validées" },
  points_100: { name: "Chasseur de points", icon: "💰", description: "100 points cumulés" },
  points_500: { name: "Collectionneur", icon: "💎", description: "500 points cumulés" },
  points_1000: { name: "Millionnaire", icon: "👑", description: "1000 points cumulés" },
  zero_penalty_day: { name: "Journée parfaite", icon: "✨", description: "Une journée sans pénalité" },
} as const;

export type BadgeKey = keyof typeof BADGES;

export function computeLevel(totalPointsEarned: number) {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalPointsEarned >= lvl.minPoints) {
      currentLevel = lvl;
    } else {
      break;
    }
  }
  
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const pointsInCurrentLevel = totalPointsEarned - currentLevel.minPoints;
  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 0;
  const progress = nextLevel ? Math.min(100, (pointsInCurrentLevel / pointsToNextLevel) * 100) : 100;

  return {
    currentLevel,
    nextLevel,
    totalPointsEarned,
    progress,
    pointsToNextLevel: nextLevel ? nextLevel.minPoints - totalPointsEarned : 0,
  };
}

export function useLevelBadges(childId?: string) {
  const { user, role } = useAuth();
  const id = childId ?? (role === "child" ? user?.id : undefined);

  const { data: stats } = useQuery({
    queryKey: ["child-stats-level", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_stats")
        .select("total_points_earned, streak_days")
        .eq("child_id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["child-badges", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_badges")
        .select("badge_key, earned_at")
        .eq("child_id", id!)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as { badge_key: BadgeKey; earned_at: string }[];
    },
    enabled: !!id,
  });

  const totalPoints = (stats as any)?.total_points_earned ?? 0;
  const levelInfo = computeLevel(totalPoints);

  const badges = earnedBadges.map((b) => ({
    ...BADGES[b.badge_key],
    key: b.badge_key,
    earnedAt: b.earned_at,
  }));

  const allBadges = Object.entries(BADGES).map(([key, badge]) => ({
    ...badge,
    key: key as BadgeKey,
    earned: earnedBadges.some((eb) => eb.badge_key === key),
    earnedAt: earnedBadges.find((eb) => eb.badge_key === key)?.earned_at,
  }));

  return {
    levelInfo,
    badges,
    allBadges,
    totalPoints,
  };
}
