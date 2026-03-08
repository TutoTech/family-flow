/**
 * Hook d'abonnement aux notifications push Web.
 * Enregistre le service worker, récupère la clé VAPID depuis le backend,
 * souscrit aux push notifications et sauvegarde le token en base.
 */

import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VAPID_PUBLIC_KEY_STORAGE = "vapid_public_key";

/** Convertit une clé Base64 URL-safe en Uint8Array (format requis par PushManager) */
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
    // Vérifie que l'utilisateur est connecté et que le navigateur supporte les push
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      // Enregistrement du service worker dédié aux push
      const registration = await navigator.serviceWorker.register("/sw-push.js");

      // Récupère la clé publique VAPID depuis la edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/push-vapid-key`
      );
      if (!resp.ok) return;
      const { publicKey } = await resp.json();
      if (!publicKey) return;

      // Vérifie si un abonnement push existe déjà, sinon en crée un
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // Sauvegarde le token push en base (upsert pour éviter les doublons)
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

  // S'abonne automatiquement au montage du composant
  useEffect(() => {
    subscribe();
  }, [subscribe]);

  return { subscribe };
}
