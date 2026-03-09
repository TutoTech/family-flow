/**
 * Tableau de bord de l'enfant.
 * Affiche les statistiques personnelles (wallet, points, série, tâches, pénalités),
 * la progression de niveau, les badges, les tâches du jour,
 * les objectifs d'épargne, la boutique de récompenses et l'historique.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, CheckCircle2, Gift, AlertTriangle, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import FamilyCard from "./FamilyCard";
import ChildTaskList from "./ChildTaskList";
import ChildRewardShop from "./ChildRewardShop";
import ActivityHistory from "./ActivityHistory";
import SavingsGoalCard from "./SavingsGoalCard";
import { PremiumGate } from "./PremiumBadge";
import ChildPenaltyHistory from "./ChildPenaltyHistory";
import LevelProgressCard from "./LevelProgressCard";
import BadgesDisplay from "./BadgesDisplay";
import BadgeCelebration from "./BadgeCelebration";
import LevelCelebration from "./LevelCelebration";
import { useChildStats } from "@/hooks/useRewards";
import { useTodayTasks } from "@/hooks/useTasks";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { name: string; }

export default function ChildDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const { plan } = useFamilyPlan();
  const isPaid = plan === "family";
  const navigate = useNavigate();
  const location = useLocation();

  // Détermine l'ID de l'enfant affiché (impersoné ou réel)
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { data: stats } = useChildStats(isImpersonating ? viewUserId : undefined);
  const { symbol: currencySymbol } = useCurrency();
  const { tasks } = useTodayTasks();

  // Scroll to section if coming from notification click
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const sectionId = state.scrollTo;
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 500);
    }
  }, [location.state, navigate, location.pathname]);

  // Filtre les tâches assignées à cet enfant
  const myTasks = tasks.filter((t) => t.assigned_to_user_id === viewUserId);
  const completedTasks = myTasks.filter((t) => ["validated", "awaiting_validation", "done"].includes(t.status));

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <DashboardLayout title={t("dashboard.childTitle")}>
      <div className="space-y-6">
        {/* Salutation personnalisée */}
        <div>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {t("dashboard.hiChild", { name })}
          </h2>
          <p className="text-muted-foreground mt-1">
            {profile?.family_id ? t("dashboard.childProgress") : t("dashboard.joinFamily")}
          </p>
        </div>

        {/* Carte de famille si l'enfant n'a pas encore rejoint de foyer */}
        {!profile?.family_id && <FamilyCard />}

        {/* Cartes de statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Solde du portefeuille */}
          <Card className="shadow-card bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.wallet")}</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-600">{(stats?.wallet_balance ?? 0).toFixed(2)}{currencySymbol}</div></CardContent>
          </Card>

          {/* Points actuels */}
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("common.points")}</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{stats?.current_points ?? 0}</div></CardContent>
          </Card>

          {/* Série de jours consécutifs */}
          <Card className="shadow-card bg-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.streak")}</CardTitle>
              <Flame className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-accent-foreground">{t("dashboard.streakDays", { count: stats?.streak_days ?? 0 })}</div></CardContent>
          </Card>

          {/* Tâches complétées aujourd'hui */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.tasks")}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedTasks.length}/{myTasks.length}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.completed")}</p>
            </CardContent>
          </Card>

          {/* Pénalités du jour */}
          <Card className="shadow-card bg-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.penalties")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.daily_penalties ?? 0}</div>
              <p className="text-xs text-muted-foreground">{t("common.today")}</p>
            </CardContent>
          </Card>
        </div>

        {profile?.family_id && (
          <>
            {/* Animations de célébration (badges et niveaux) */}
            <BadgeCelebration />
            <LevelCelebration />

            {/* Progression de niveau et badges */}
            <div className="grid md:grid-cols-2 gap-4">
              <LevelProgressCard />
              <BadgesDisplay />
            </div>

            {/* Liste des tâches du jour */}
            <ChildTaskList />

            {/* Objectifs d'épargne : premium uniquement */}
            {isPaid ? <SavingsGoalCard /> : (
              <PremiumGate featureLabel={t("savingsGoals.title")}><SavingsGoalCard /></PremiumGate>
            )}

            {/* Boutique de récompenses et historique */}
            <ChildRewardShop />
            <ChildPenaltyHistory />
            <ActivityHistory />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
