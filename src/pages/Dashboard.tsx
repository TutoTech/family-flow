import { useAuth } from "@/hooks/useAuth";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import ChildDashboard from "@/components/dashboard/ChildDashboard";

export default function Dashboard() {
  const { role, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (role === "child") {
    return <ChildDashboard name={profile?.name ?? "Enfant"} />;
  }

  return <ParentDashboard name={profile?.name ?? "Parent"} />;
}
