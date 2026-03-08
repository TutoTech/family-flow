/**
 * Page principale du tableau de bord.
 * Affiche le dashboard parent ou enfant selon le rôle effectif
 * (tenant compte de l'éventuelle impersonation par un parent).
 */

import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import ChildDashboard from "@/components/dashboard/ChildDashboard";

export default function Dashboard() {
  const { role, profile, loading } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();

  // Active l'abonnement aux notifications push
  usePushSubscription();

  // Écran de chargement pendant la récupération de la session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Détermine le rôle et le nom à afficher (impersoné ou réel)
  const effectiveRole = isImpersonating ? activeProfile?.role : role;
  const effectiveName = isImpersonating ? activeProfile?.name : profile?.name;

  if (effectiveRole === "child") {
    return <ChildDashboard name={effectiveName ?? "Enfant"} />;
  }

  return <ParentDashboard name={effectiveName ?? "Parent"} />;
}
