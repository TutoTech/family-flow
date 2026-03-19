import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { child_id, new_password } = await req.json();

    if (!child_id || !new_password) {
      return new Response(
        JSON.stringify({ error: "child_id and new_password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ error: "password_too_short" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client utilisateur pour vérifier l'identité du demandeur
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ── Vérification 1 : le demandeur est bien un parent ──
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (callerRole?.role !== "parent") {
      return new Response(
        JSON.stringify({ error: "Only parents can reset child passwords" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Vérification 2 : l'enfant appartient bien à la même famille ──
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    const { data: childProfile } = await adminClient
      .from("profiles")
      .select("family_id")
      .eq("user_id", child_id)
      .single();

    if (
      !callerProfile?.family_id ||
      !childProfile?.family_id ||
      callerProfile.family_id !== childProfile.family_id
    ) {
      return new Response(
        JSON.stringify({ error: "Child is not in your family" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Vérification 3 : la cible est bien un enfant ──
    const { data: childRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", child_id)
      .single();

    if (childRole?.role !== "child") {
      return new Response(
        JSON.stringify({ error: "Target user is not a child" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Réinitialisation du mot de passe via l'API admin ──
    const { error: updateError } = await adminClient.auth.admin.updateUserById(child_id, {
      password: new_password,
    });

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
