import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, CheckCircle2, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FamilyCard from "./FamilyCard";
import ChildTaskList from "./ChildTaskList";

interface Props {
  name: string;
}

export default function ChildDashboard({ name }: Props) {
  const { profile } = useAuth();

  return (
    <DashboardLayout title="Mon espace">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Salut, {name} ⭐
          </h2>
          <p className="text-muted-foreground mt-1">
            {profile?.family_id ? "Voici tes tâches et tes progrès" : "Rejoins un foyer pour commencer"}
          </p>
        </div>

        {!profile?.family_id && <FamilyCard />}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Points</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Série</CardTitle>
              <Flame className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">0 jours</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tâches</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0/0</div>
              <p className="text-xs text-muted-foreground">terminées</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Récompenses</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">disponibles</p>
            </CardContent>
          </Card>
        </div>

        {profile?.family_id && <ChildTaskList />}
      </div>
    </DashboardLayout>
  );
}
