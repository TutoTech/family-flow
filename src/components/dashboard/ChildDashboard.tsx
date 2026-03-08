import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, CheckCircle2, Gift, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FamilyCard from "./FamilyCard";
import ChildTaskList from "./ChildTaskList";
import ChildRewardShop from "./ChildRewardShop";
import ActivityHistory from "./ActivityHistory";
import { useChildStats } from "@/hooks/useRewards";
import { useChildPenalties } from "@/hooks/usePenalties";
import { useTodayTasks } from "@/hooks/useTasks";

interface Props {
  name: string;
}

export default function ChildDashboard({ name }: Props) {
  const { user, profile } = useAuth();
  const { data: stats } = useChildStats();
  const { tasks } = useTodayTasks();

  const myTasks = tasks.filter((t) => t.assigned_to_user_id === user?.id);
  const completedTasks = myTasks.filter((t) => ["validated", "awaiting_validation", "done"].includes(t.status));

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
              <div className="text-2xl font-bold text-primary">{stats?.current_points ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Série</CardTitle>
              <Flame className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">{stats?.streak_days ?? 0} jours</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tâches</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedTasks.length}/{myTasks.length}</div>
              <p className="text-xs text-muted-foreground">terminées</p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pénalités</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.daily_penalties ?? 0}</div>
              <p className="text-xs text-muted-foreground">aujourd'hui</p>
            </CardContent>
          </Card>
        </div>

        {profile?.family_id && (
          <>
            <ChildTaskList />
            <ChildRewardShop />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
