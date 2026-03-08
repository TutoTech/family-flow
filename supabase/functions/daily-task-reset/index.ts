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

    // Get all families
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

    return new Response(
      JSON.stringify({ success: true, families_processed: generated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
