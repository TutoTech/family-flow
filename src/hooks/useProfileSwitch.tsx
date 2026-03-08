/**
 * Hook de changement de profil (impersonation).
 * Permet aux parents de visualiser le tableau de bord
 * d'un enfant sans changer de session d'authentification.
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

/** Représente un profil actif (réel ou simulé) */
interface ActiveProfile {
  userId: string;
  name: string;
  role: "parent" | "child";
  avatarUrl?: string | null;
}

interface ProfileSwitchContextType {
  activeProfile: ActiveProfile | null;
  /** Vrai si le parent visualise le dashboard d'un autre membre */
  isImpersonating: boolean;
  /** Basculer vers le profil d'un autre membre */
  switchTo: (profile: ActiveProfile) => void;
  /** Revenir à son propre profil */
  switchBack: () => void;
}

const ProfileSwitchContext = createContext<ProfileSwitchContextType | undefined>(undefined);

export function ProfileSwitchProvider({ children }: { children: ReactNode }) {
  const { user, profile, role } = useAuth();
  const [impersonated, setImpersonated] = useState<ActiveProfile | null>(null);

  // Réinitialise l'impersonation quand l'utilisateur authentifié change
  useEffect(() => {
    setImpersonated(null);
  }, [user?.id]);

  /** Profil réel de l'utilisateur connecté */
  const realProfile: ActiveProfile | null = user
    ? { userId: user.id, name: profile?.name ?? "", role: role ?? "parent", avatarUrl: profile?.avatar_url }
    : null;

  /** Profil effectif : impersoné s'il y en a un, sinon le profil réel */
  const activeProfile = impersonated ?? realProfile;
  const isImpersonating = !!impersonated;

  const switchTo = useCallback((p: ActiveProfile) => {
    // Si on sélectionne son propre profil, on annule l'impersonation
    if (p.userId === user?.id) {
      setImpersonated(null);
    } else {
      setImpersonated(p);
    }
  }, [user?.id]);

  const switchBack = useCallback(() => {
    setImpersonated(null);
  }, []);

  return (
    <ProfileSwitchContext.Provider value={{ activeProfile, isImpersonating, switchTo, switchBack }}>
      {children}
    </ProfileSwitchContext.Provider>
  );
}

/** Hook pour accéder au système de changement de profil */
export function useProfileSwitch() {
  const context = useContext(ProfileSwitchContext);
  if (!context) throw new Error("useProfileSwitch must be used within ProfileSwitchProvider");
  return context;
}
