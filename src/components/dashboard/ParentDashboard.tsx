import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, Trophy, AlertTriangle, Users } from "lucide-react";

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

        {!profile?.family_id && (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Créez votre foyer</h3>
              <p className="text-muted-foreground text-sm">
                La gestion des foyers sera disponible dans l'étape suivante.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tâches du jour</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">en attente</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Récompenses</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">demandées</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pénalités</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">aujourd'hui</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Membres</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">dans le foyer</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
