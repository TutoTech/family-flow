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

    // Récupère les instances de tâches non complétées d'hier avec leur config de pénalité
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

    // Récupère un parent par famille (nécessaire pour logged_by_parent_id)
    const familyIds = Array.from(
      new Set((overdueInstances ?? []).map((i: any) => i.family_id))
    );
    const familyParents = new Map<string, string>();
    if (familyIds.length > 0) {
      const { data: parentRows } = await supabase
        .from("profiles")
        .select("user_id, family_id, user_roles!inner(role)")
        .in("family_id", familyIds)
        .eq("user_roles.role", "parent");
      for (const p of (parentRows ?? []) as any[]) {
        if (!familyParents.has(p.family_id)) {
          familyParents.set(p.family_id, p.user_id);
        }
      }
    }

    // Cache des taux de conversion points -> argent par famille
    const familyRates = new Map<string, number>();

    for (const instance of overdueInstances ?? []) {
      // Marquer en retard si encore "pending"
      if (instance.status === "pending") {
        await supabase
          .from("task_instances")
          .update({ status: "late" })
          .eq("id", instance.id);
      }

      // Appliquer la pénalité automatique si configurée sur le template
      const template = instance.task_template as any;
      if (template?.overdue_penalty_enabled && template?.overdue_penalty_points > 0) {
        const penaltyPoints = template.overdue_penalty_points;
        const familyId = instance.family_id;

        // Idempotence : ne pas créer la pénalité si elle existe déjà pour cette tâche
        const { data: existing } = await supabase
          .from("penalties_log")
          .select("id")
          .eq("family_id", familyId)
          .eq("child_id", instance.assigned_to_user_id)
          .eq("custom_title", template.title)
          .gte("created_at", `${yesterdayStr}T00:00:00Z`)
          .lte("created_at", `${yesterdayStr}T23:59:59Z`)
          .maybeSingle();

        if (existing) continue;

        const parentId = familyParents.get(familyId);
        if (!parentId) continue;

        // Calcule la déduction wallet via le taux de conversion de la famille
        let rate = familyRates.get(familyId);
        if (rate === undefined) {
          const { data: settings } = await supabase
            .from("family_settings")
            .select("points_to_money_rate")
            .eq("family_id", familyId)
            .single();
          rate = settings?.points_to_money_rate ?? 0.1;
          familyRates.set(familyId, rate);
        }
        const walletDeduction = Number((penaltyPoints * rate).toFixed(2));

        // Insertion dans penalties_log : les triggers s'occupent
        // de déduire les points/wallet et de créer la notification.
        const { error: penaltyError } = await supabase.from("penalties_log").insert({
          child_id: instance.assigned_to_user_id,
          family_id: familyId,
          logged_by_parent_id: parentId,
          points_amount: penaltyPoints,
          wallet_amount: walletDeduction,
          custom_title: template.title,
        });

        if (!penaltyError) {
          // Déduction manuelle car le trigger handle_penalty_logged ne traite que rule_id
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
                wallet_balance: Math.max(0, Number(stats.wallet_balance) - walletDeduction),
              })
              .eq("child_id", instance.assigned_to_user_id);
          }
          penaltiesApplied++;
        }
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

    // ── Step 4: Auto-validate awaiting_validation tasks from previous days ──
    const { data: autoValidatedCount, error: autoValError } = await supabase.rpc(
      "auto_validate_pending_tasks"
    );
    if (autoValError) console.error("Auto-validate error:", autoValError);

    return new Response(
      JSON.stringify({
        success: true,
        families_processed: generated,
        penalties_applied: penaltiesApplied,
        overdue_tasks_checked: overdueInstances?.length ?? 0,
        streaks_updated: true,
        auto_validated: autoValidatedCount ?? 0,
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
