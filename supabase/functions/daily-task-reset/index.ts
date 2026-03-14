import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Step 1: Apply overdue penalties on yesterday's uncompleted tasks ──
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Fetch uncompleted task instances from yesterday with their template penalty config
    const { data: overdueInstances } = await supabase
      .from("task_instances")
      .select(`
        id,
        assigned_to_user_id,
        family_id,
        status,
        task_template:task_templates(
          title,
          overdue_penalty_enabled,
          overdue_penalty_points
        )
      `)
      .eq("scheduled_for_date", yesterdayStr)
      .in("status", ["pending", "late"]);

    let penaltiesApplied = 0;

    for (const instance of overdueInstances ?? []) {
      // Mark as late if still pending
      if (instance.status === "pending") {
        await supabase
          .from("task_instances")
          .update({ status: "late" })
          .eq("id", instance.id);
      }

      // Apply automatic penalty if configured on the template
      const template = instance.task_template as any;
      if (template?.overdue_penalty_enabled && template?.overdue_penalty_points > 0) {
        const penaltyPoints = template.overdue_penalty_points;

        // Deduct points from child_stats
        const { data: stats } = await supabase
          .from("child_stats")
          .select("current_points")
          .eq("child_id", instance.assigned_to_user_id)
          .single();

        if (stats) {
          await supabase
            .from("child_stats")
            .update({
              current_points: Math.max(0, stats.current_points - penaltyPoints),
            })
            .eq("child_id", instance.assigned_to_user_id);
        }

        // Create a notification for the child
        await supabase.from("notifications").insert({
          user_id: instance.assigned_to_user_id,
          type: "overdue_penalty",
          title: `⚠️ Pénalité automatique`,
          body: `Tu as perdu ${penaltyPoints} points car "${template.title}" n'a pas été faite à temps.`,
          metadata: {
            task_instance_id: instance.id,
            penalty_points: penaltyPoints,
          },
        });

        penaltiesApplied++;
      }
    }

    // ── Step 2: Generate today's task instances for all families ──
    const { data: families, error: fErr } = await supabase
      .from("families")
      .select("id");

    if (fErr) throw fErr;

    let generated = 0;
    for (const family of families ?? []) {
      const { error } = await supabase.rpc("generate_daily_task_instances", {
        _family_id: family.id,
      });
      if (!error) generated++;
    }

    // ── Step 3: Update all streaks based on yesterday's performance ──
    const { error: streakError } = await supabase.rpc("update_all_streaks");
    if (streakError) throw streakError;

    return new Response(
      JSON.stringify({
        success: true,
        families_processed: generated,
        penalties_applied: penaltiesApplied,
        overdue_tasks_checked: overdueInstances?.length ?? 0,
        streaks_updated: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
