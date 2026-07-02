/**
 * Gestion du « skin » de l'application (Maison / Classique).
 *
 * Axe indépendant du mode clair/sombre (géré par next-themes) :
 * le skin est porté par l'attribut `data-skin` sur <html>, posé avant le
 * premier paint par le script inline de index.html, puis piloté ici.
 * Le choix est persisté dans localStorage sous la clé `sr-skin`.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Skin = "maison" | "classique";

const SKIN_STORAGE_KEY = "sr-skin";

interface SkinContextValue {
  skin: Skin;
  setSkin: (skin: Skin) => void;
}

const SkinContext = createContext<SkinContextValue | null>(null);

export function SkinProvider({ children }: { children: ReactNode }) {
  // SPA sans SSR : l'attribut a déjà été posé par le script inline,
  // le DOM est donc la source de vérité au montage.
  const [skin, setSkinState] = useState<Skin>(() =>
    document.documentElement.dataset.skin === "classique" ? "classique" : "maison",
  );

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    document.documentElement.dataset.skin = next;
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, next);
    } catch {
      /* localStorage indisponible (navigation privée) : choix limité à la session */
    }
  }, []);

  return <SkinContext.Provider value={{ skin, setSkin }}>{children}</SkinContext.Provider>;
}

export function useSkin(): SkinContextValue {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error("useSkin doit être utilisé à l'intérieur d'un SkinProvider");
  }
  return context;
}
