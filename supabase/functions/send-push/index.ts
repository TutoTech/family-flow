import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push using the web-push library
import webpush from "npm:web-push@3.6.7";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, type, metadata } = await req.json();

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const rawEmail = Deno.env.get("VAPID_EMAIL") || "noreply@stoprepeat.app";
    const vapidEmail = rawEmail.startsWith("mailto:") ? rawEmail : `mailto:${rawEmail}`;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    // Get device tokens for the user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("push_token")
      .eq("user_id", user_id)
      .eq("platform", "web");

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ title, body, type, metadata });

    let sent = 0;
    for (const token of tokens) {
      try {
        const subscription = JSON.parse(token.push_token);
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err) {
        console.error("Push failed for token:", err);
        // Remove invalid tokens
        if ((err as any).statusCode === 410 || (err as any).statusCode === 404) {
          await supabase.from("device_tokens").delete().eq("push_token", token.push_token);
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
