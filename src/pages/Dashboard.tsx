import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import ChildDashboard from "@/components/dashboard/ChildDashboard";

export default function Dashboard() {
  const { role, profile, loading } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  usePushSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Use the active (possibly impersonated) profile to determine which dashboard to show
  const effectiveRole = isImpersonating ? activeProfile?.role : role;
  const effectiveName = isImpersonating ? activeProfile?.name : profile?.name;

  if (effectiveRole === "child") {
    return <ChildDashboard name={effectiveName ?? "Enfant"} />;
  }

  return <ParentDashboard name={effectiveName ?? "Parent"} />;
}
