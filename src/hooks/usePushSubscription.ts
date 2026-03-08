import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VAPID_PUBLIC_KEY_STORAGE = "vapid_public_key";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const { user } = useAuth();

  const subscribe = useCallback(async () => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw-push.js");

      // Fetch VAPID public key from edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/push-vapid-key`
      );
      if (!resp.ok) return;
      const { publicKey } = await resp.json();
      if (!publicKey) return;

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // Save to device_tokens
      const subJson = subscription.toJSON();
      const pushToken = JSON.stringify(subJson);

      await supabase.from("device_tokens").upsert(
        {
          user_id: user.id,
          push_token: pushToken,
          platform: "web",
        },
        { onConflict: "user_id,platform" }
      );
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  }, [user]);

  useEffect(() => {
    subscribe();
  }, [subscribe]);

  return { subscribe };
}
