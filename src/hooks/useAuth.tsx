/**
 * Hook d'authentification principal.
 * Gère la session utilisateur, le profil, le rôle (parent/enfant),
 * ainsi que les actions : inscription, connexion, déconnexion, réinitialisation du mot de passe.
 */

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "parent" | "child";

/** Structure du contexte d'authentification exposé aux composants */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { name: string; family_id: string | null; avatar_url: string | null } | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Récupère le profil et le rôle de l'utilisateur en parallèle
   * depuis les tables `profiles` et `user_roles`.
   */
  const fetchProfileAndRole = async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("name, family_id, avatar_url").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    if (roleRes.data) {
      setRole(roleRes.data.role as AppRole);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Écoute les changements d'état d'authentification (connexion, déconnexion, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfileAndRole(session.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          // Réinitialise les données quand l'utilisateur se déconnecte
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Récupère la session existante au montage du composant
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndRole(session.user.id);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /** Inscription d'un nouvel utilisateur avec email, mot de passe, nom et rôle */
  const signUp = async (email: string, password: string, name: string, selectedRole: AppRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name, role: selectedRole },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erreur lors de l'inscription");
  };

  /** Connexion avec email et mot de passe */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  /** Déconnexion de l'utilisateur */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /** Envoie un email de réinitialisation du mot de passe */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook pour accéder au contexte d'authentification depuis n'importe quel composant */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
