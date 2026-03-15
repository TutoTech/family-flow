/**
 * Edge Function : réinitialisation du mot de passe d'un enfant par un parent.
 * Seul un parent appartenant à la même famille peut changer le mot de passe de son enfant.
 * Utilise la clé Service Role pour appeler l'API admin Supabase Auth.
 */

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
    // Client admin (Service Role) pour les opérations privilégiées
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Client anon pour valider le JWT de l'appelant
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // 1. Vérifier l'authentification de l'appelant via son token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("En-tête Authorization manquant");
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: authError,
    } = await supabaseAnon.auth.getUser(token);

    if (authError || !caller) {
      throw new Error("Non authentifié");
    }

    // 2. Vérifier que l'appelant est bien un parent
    const { data: callerRole, error: callerRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (callerRoleError || callerRole?.role !== "parent") {
      throw new Error("Seuls les parents peuvent réinitialiser le mot de passe d'un enfant");
    }

    // 3. Récupérer la famille du parent
    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from("profiles")
      .select("family_id")
      .eq("user_id", caller.id)
      .single();

    if (callerProfileError || !callerProfile?.family_id) {
      throw new Error("Le parent n'appartient à aucune famille");
    }

    // 4. Lire le corps de la requête
    const { child_user_id, new_password } = await req.json();

    if (!child_user_id || typeof child_user_id !== "string") {
      throw new Error("child_user_id est requis");
    }
    if (!new_password || typeof new_password !== "string") {
      throw new Error("new_password est requis");
    }
    if (new_password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    // 5. Vérifier que l'enfant appartient à la même famille
    const { data: childProfile, error: childProfileError } = await supabaseAdmin
      .from("profiles")
      .select("family_id, name")
      .eq("user_id", child_user_id)
      .single();

    if (childProfileError || !childProfile) {
      throw new Error("Enfant introuvable");
    }

    if (childProfile.family_id !== callerProfile.family_id) {
      throw new Error("Cet enfant n'appartient pas à votre famille");
    }

    // 6. Vérifier que l'utilisateur cible est bien un enfant
    const { data: childRole, error: childRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", child_user_id)
      .single();

    if (childRoleError || childRole?.role !== "child") {
      throw new Error("L'utilisateur cible n'est pas un enfant");
    }

    // 7. Mettre à jour le mot de passe via l'API admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      child_user_id,
      { password: new_password }
    );

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour : ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Mot de passe mis à jour pour ${childProfile.name}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
