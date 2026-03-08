import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    // Parse and validate code
    const body = await req.json();
    const code = (body.code || "").trim().toUpperCase();

    if (!code || code.length < 6 || code.length > 40) {
      return new Response(JSON.stringify({ error: "invalid_code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Look up the activation code (service role bypasses RLS)
    const { data: activation, error: lookupError } = await supabaseAdmin
      .from("activation_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (lookupError || !activation) {
      return new Response(JSON.stringify({ error: "code_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (activation.is_used) {
      return new Response(JSON.stringify({ error: "code_already_used" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    // Get user's family
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.family_id) {
      return new Response(JSON.stringify({ error: "no_family" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Mark code as used
    const { error: updateCodeError } = await supabaseAdmin
      .from("activation_codes")
      .update({
        is_used: true,
        used_by_user_id: user.id,
        used_at: new Date().toISOString(),
      })
      .eq("id", activation.id)
      .eq("is_used", false); // Extra safety: only update if still unused (prevent race condition)

    if (updateCodeError) throw updateCodeError;

    // Upgrade family plan
    await supabaseAdmin
      .from("families")
      .update({ plan: activation.plan || "family" })
      .eq("id", profile.family_id);

    return new Response(JSON.stringify({ success: true, plan: activation.plan || "family" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
