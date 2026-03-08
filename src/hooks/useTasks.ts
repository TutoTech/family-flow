import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function useTodayTasks() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const familyId = profile?.family_id;

  // Generate today's instances on load
  useEffect(() => {
    if (familyId) {
      supabase.rpc("generate_daily_task_instances", { _family_id: familyId });
    }
  }, [familyId]);

  const tasksQuery = useQuery({
    queryKey: ["today-tasks", familyId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("task_instances")
        .select(`
          *,
          task_template:task_templates(title, description, icon, points_reward, requires_photo),
          evidence:task_evidence_photos(id, storage_key)
        `)
        .eq("family_id", familyId!)
        .eq("scheduled_for_date", today)
        .order("due_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  const completeTask = useMutation({
    mutationFn: async ({ instanceId, photoFile }: { instanceId: string; photoFile?: File }) => {
      // Upload photo if provided
      if (photoFile) {
        const filePath = `${familyId}/${instanceId}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("task-evidence")
          .upload(filePath, photoFile, { contentType: photoFile.type });
        if (uploadError) throw uploadError;

        await supabase.from("task_evidence_photos").insert({
          task_instance_id: instanceId,
          storage_key: filePath,
          uploaded_by_user_id: user!.id,
          mime_type: photoFile.type,
        });
      }

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

  const resetTask = useMutation({
    mutationFn: async (instanceId: string) => {
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "pending" as any,
          completed_at: null,
          validated_at: null,
          validated_by_user_id: null,
        })
        .eq("id", instanceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-tasks"] }),
  });

  return { tasks: tasksQuery.data ?? [], isLoading: tasksQuery.isLoading, completeTask, validateTask };
}

export function useFamilyChildren() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  return useQuery({
    queryKey: ["family-children", familyId],
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
}
