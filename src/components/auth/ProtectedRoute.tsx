/**
 * Route protégée : redirige vers /login si l'utilisateur n'est pas connecté,
 * ou vers /dashboard si son rôle ne correspond pas au rôle requis.
 */

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  /** Rôle optionnel requis pour accéder à la route */
  requiredRole?: "parent" | "child";
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, role, loading } = useAuth();

  // Affiche un spinner pendant le chargement de la session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirige vers la page de connexion si non authentifié
  if (!user) return <Navigate to="/login" replace />;

  // Redirige vers le dashboard si le rôle ne correspond pas
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
