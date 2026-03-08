import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ActiveProfile {
  userId: string;
  name: string;
  role: "parent" | "child";
  avatarUrl?: string | null;
}

interface ProfileSwitchContextType {
  activeProfile: ActiveProfile | null;
  isImpersonating: boolean;
  switchTo: (profile: ActiveProfile) => void;
  switchBack: () => void;
}

const ProfileSwitchContext = createContext<ProfileSwitchContextType | undefined>(undefined);

export function ProfileSwitchProvider({ children }: { children: ReactNode }) {
  const { user, profile, role } = useAuth();
  const [impersonated, setImpersonated] = useState<ActiveProfile | null>(null);

  const realProfile: ActiveProfile | null = user
    ? { userId: user.id, name: profile?.name ?? "", role: role ?? "parent", avatarUrl: profile?.avatar_url }
    : null;

  const activeProfile = impersonated ?? realProfile;
  const isImpersonating = !!impersonated;

  const switchTo = useCallback((p: ActiveProfile) => {
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

export function useProfileSwitch() {
  const context = useContext(ProfileSwitchContext);
  if (!context) throw new Error("useProfileSwitch must be used within ProfileSwitchProvider");
  return context;
}
