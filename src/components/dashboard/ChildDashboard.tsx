import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, CheckCircle2, Gift } from "lucide-react";

interface Props {
  name: string;
}

export default function ChildDashboard({ name }: Props) {
  return (
    <DashboardLayout title="Mon espace">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Salut, {name} ⭐
          </h2>
          <p className="text-muted-foreground mt-1">Voici tes tâches et tes progrès</p>
        </div>

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

        <Card className="border-dashed border-2 border-secondary/30 bg-secondary/5">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-secondary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Pas de tâches pour le moment</h3>
            <p className="text-muted-foreground text-sm">
              Tes parents vont bientôt ajouter des missions !
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
