import DashboardLayout from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import FamilyCard from "./FamilyCard";
import ParentTaskList from "./ParentTaskList";
import ParentRewardList from "./ParentRewardList";

interface Props {
  name: string;
}

export default function ParentDashboard({ name }: Props) {
  const { profile } = useAuth();

  return (
    <DashboardLayout title="Tableau de bord Parent">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Bonjour, {name} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            {profile?.family_id
              ? "Voici le résumé de votre foyer"
              : "Commencez par créer ou rejoindre un foyer"}
          </p>
        </div>

        <FamilyCard />

        {profile?.family_id && (
          <>
            <ParentTaskList />
            <ParentRewardList />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
