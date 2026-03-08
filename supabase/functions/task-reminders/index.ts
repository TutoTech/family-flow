import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all family settings with their reminder delay
    const { data: familySettings } = await supabase
      .from("family_settings")
      .select("family_id, tts_delay_minutes");

    if (!familySettings || familySettings.length === 0) {
      return new Response(JSON.stringify({ reminders_sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    let totalSent = 0;

    for (const fs of familySettings) {
      const delayMinutes = fs.tts_delay_minutes || 5;

      // Window: tasks due between now and now + delayMinutes
      const windowEnd = new Date(now.getTime() + delayMinutes * 60 * 1000);
      const today = now.toISOString().split("T")[0];

      // Find pending tasks due within the reminder window
      const { data: tasks } = await supabase
        .from("task_instances")
        .select("id, assigned_to_user_id, task_template_id, due_at")
        .eq("family_id", fs.family_id)
        .eq("scheduled_for_date", today)
        .eq("status", "pending")
        .gte("due_at", now.toISOString())
        .lte("due_at", windowEnd.toISOString());

      if (!tasks || tasks.length === 0) continue;

      // Check which tasks already have a reminder notification today
      const taskIds = tasks.map((t) => t.id);
      const { data: existingNotifs } = await supabase
        .from("notifications")
        .select("metadata")
        .eq("type", "task_reminder")
        .gte("created_at", today + "T00:00:00Z");

      const alreadyReminded = new Set(
        (existingNotifs || [])
          .map((n: any) => n.metadata?.task_instance_id)
          .filter(Boolean)
      );

      // Get task titles
      const templateIds = [...new Set(tasks.map((t) => t.task_template_id))];
      const { data: templates } = await supabase
        .from("task_templates")
        .select("id, title")
        .in("id", templateIds);

      const titleMap = new Map(
        (templates || []).map((t) => [t.id, t.title])
      );

      for (const task of tasks) {
        if (alreadyReminded.has(task.id)) continue;

        const taskTitle = titleMap.get(task.task_template_id) || "une tâche";
        const dueTime = new Date(task.due_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        });

        await supabase.from("notifications").insert({
          user_id: task.assigned_to_user_id,
          title: "⏰ Rappel de tâche",
          body: `N'oublie pas : "${taskTitle}" est à faire avant ${dueTime} !`,
          type: "task_reminder",
          metadata: { task_instance_id: task.id },
        });

        totalSent++;
      }
    }

    return new Response(JSON.stringify({ reminders_sent: totalSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Task reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
