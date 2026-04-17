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
    const { name, family_invite_code, password } = await req.json();

    if (!name || !family_invite_code || !password) {
      return new Response(
        JSON.stringify({ error: "name, family_invite_code and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "password_too_short" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client admin (service role) pour créer des utilisateurs et contourner les RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ── Étape 1 : Valider le code famille ──
    const { data: family, error: familyError } = await adminClient
      .from("families")
      .select("id, name, plan")
      .eq("invite_code", family_invite_code.toLowerCase().trim())
      .single();

    if (familyError || !family) {
      return new Response(
        JSON.stringify({ error: "invalid_invite_code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Étape 2 : Vérifier les limites du plan ──
    const { data: existingMembers } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("family_id", family.id);

    const memberIds = (existingMembers ?? []).map((m) => m.user_id);

    if (memberIds.length > 0) {
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", memberIds);

      const childCount = (roles ?? []).filter((r) => r.role === "child").length;

      if (family.plan === "free" && childCount >= 1) {
        return new Response(
          JSON.stringify({ error: "plan_limit_reached" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Étape 3 : Vérifier l'unicité du prénom dans la famille ──
    const { data: existingChild } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("family_id", family.id)
      .ilike("name", name.trim());

    if (existingChild && existingChild.length > 0) {
      return new Response(
        JSON.stringify({ error: "name_already_taken" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Étape 4 : Générer un email synthétique unique ──
    const syntheticEmail = `${crypto.randomUUID()}@child.stoprepeat.app`;

    // ── Étape 5 : Créer le compte auth (email confirmé d'office, pas d'email envoyé) ──
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: "child" },
    });

    if (createError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: createError?.message ?? "user_creation_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Étape 6 : Associer l'enfant à la famille ──
    // On attend que le trigger handle_new_user() ait créé le profil (polling).
    let profileExists = false;
    let attempts = 0;
    while (!profileExists && attempts < 10) {
      await new Promise((r) => setTimeout(r, 200));
      const { data: p } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("user_id", newUser.user.id)
        .maybeSingle();
      profileExists = !!p;
      attempts++;
    }

    if (!profileExists) {
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "profile_not_created_by_trigger" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: updatedRows, error: profileError } = await adminClient
      .from("profiles")
      .update({ family_id: family.id })
      .eq("user_id", newUser.user.id)
      .select("user_id");

    if (profileError || !updatedRows || updatedRows.length === 0) {
      // Rollback : supprimer l'utilisateur créé pour éviter un compte orphelin
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({
          error: "profile_update_failed",
          details: profileError?.message ?? "no_rows_updated",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, auth_email: syntheticEmail, family_name: family.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
