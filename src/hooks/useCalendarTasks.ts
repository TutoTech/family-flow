import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function useCalendarTasks(currentMonth: Date) {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const tasksQuery = useQuery({
    queryKey: ["calendar-tasks", familyId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_instances")
        .select(`
          id, scheduled_for_date, status, due_at, assigned_to_user_id,
          task_template:task_templates(title, icon, points_reward)
        `)
        .eq("family_id", familyId!)
        .gte("scheduled_for_date", start)
        .lte("scheduled_for_date", end)
        .order("due_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  const childrenQuery = useQuery({
    queryKey: ["family-children-calendar", familyId],
    queryFn: async () => {
      const { data: members } = await supabase
        .from("profiles")
        .select("user_id, name")
        .eq("family_id", familyId!);

      if (!members) return [];

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", members.map((m) => m.user_id));

      const childIds = new Set(roles?.filter((r) => r.role === "child").map((r) => r.user_id) ?? []);
      return members.filter((m) => childIds.has(m.user_id));
    },
    enabled: !!familyId,
  });

  return {
    tasks: tasksQuery.data ?? [],
    children: childrenQuery.data ?? [],
    isLoading: tasksQuery.isLoading || childrenQuery.isLoading,
  };
}
