/**
 * Tableau de bord de l'enfant.
 * Affiche les statistiques personnelles (wallet, points, série, tâches, pénalités),
 * la progression de niveau, les badges, les tâches du jour,
 * les objectifs d'épargne, la boutique de récompenses et l'historique.
 */

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, CheckCircle2, AlertTriangle, Shield, Gift, Target, History } from "lucide-react";
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
import ChildRulesList from "./ChildRulesList";
import LevelProgressCard from "./LevelProgressCard";
import ChildLedgerCard from "./ChildLedgerCard";
import BadgesDisplay from "./BadgesDisplay";
import BadgeCelebration from "./BadgeCelebration";
import LevelCelebration from "./LevelCelebration";
import { useChildStats } from "@/hooks/useRewards";

interface Props { name: string; }

export default function ChildDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const { plan } = useFamilyPlan();
  const isPaid = plan === "family";
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("tasks");

  /*
   * Chips de navigation : chaque section est codée par un token sémantique
   * (les couleurs suivent donc automatiquement le skin actif).
   * tâches → success, pénalités → destructive, règles → secondary,
   * récompenses → brass, épargne → info, historique → neutre.
   */
  const TABS = useMemo(() => [
    { id: "tasks", label: t("childDashboard.tabs.tasks"), icon: CheckCircle2, emoji: "📝",
      colorClass: "text-success bg-success/10 hover:bg-success/20 border border-success/25",
      activeClass: "bg-success text-success-foreground shadow-md shadow-success/20 border-transparent ring-2 ring-success/50 ring-offset-2 ring-offset-background" },
    { id: "penalties", label: t("childDashboard.tabs.penalties"), icon: AlertTriangle, emoji: "🚨",
      colorClass: "text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/25",
      activeClass: "bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 border-transparent ring-2 ring-destructive/50 ring-offset-2 ring-offset-background" },
    { id: "rules", label: t("childDashboard.tabs.rules"), icon: Shield, emoji: "📜",
      colorClass: "text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/25",
      activeClass: "bg-secondary text-secondary-foreground shadow-md shadow-secondary/20 border-transparent ring-2 ring-secondary/50 ring-offset-2 ring-offset-background" },
    { id: "rewards", label: t("childDashboard.tabs.rewards"), icon: Gift, emoji: "🎁",
      colorClass: "text-brass bg-brass/10 hover:bg-brass/20 border border-brass/25",
      activeClass: "bg-brass text-brass-foreground shadow-md shadow-brass/20 border-transparent ring-2 ring-brass/50 ring-offset-2 ring-offset-background" },
    { id: "savings", label: t("childDashboard.tabs.savings"), icon: Target, emoji: "🎯",
      colorClass: "text-info bg-info/10 hover:bg-info/20 border border-info/25",
      activeClass: "bg-info text-info-foreground shadow-md shadow-info/20 border-transparent ring-2 ring-info/50 ring-offset-2 ring-offset-background" },
    { id: "history", label: t("childDashboard.tabs.history"), icon: History, emoji: "🕰️",
      colorClass: "text-muted-foreground bg-muted/60 hover:bg-muted border border-border",
      activeClass: "bg-foreground text-background shadow-md border-transparent ring-2 ring-ring/40 ring-offset-2 ring-offset-background" },
  ], [t]);

  // Détermine l'ID de l'enfant affiché (impersoné ou réel)
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { data: stats } = useChildStats(isImpersonating ? viewUserId : undefined);

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

        {/* Livret : solde du portefeuille + dernières écritures */}
        <ChildLedgerCard balance={stats?.wallet_balance ?? 0} />

        {/* Cartes de statistiques rapides */}
        <div className="grid grid-cols-2 gap-3">
          {/* Points */}
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Star className="h-5 w-5 text-primary mb-1" />
              <div className="text-xl font-bold text-primary font-data tabular-nums">{stats?.current_points ?? 0}</div>
              <p className="text-xs font-medium text-muted-foreground">{t("common.points")}</p>
            </CardContent>
          </Card>

          {/* Série de jours consécutifs */}
          <Card className="shadow-card bg-accent/10 border-accent/20">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Flame className="h-5 w-5 text-accent-foreground mb-1" />
              <div className="text-xl font-bold text-accent-foreground font-data tabular-nums">{stats?.streak_days ?? 0}</div>
              <p className="text-xs font-medium text-muted-foreground">{t("dashboard.streak")}</p>
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

            {/* Barre de navigation horizontale (Onglets) */}
            {/* Marges négatives et padding pour que box-shadow et transform ne soient pas coupés */}
            <div className="w-full overflow-x-auto hide-scrollbar mt-2 -mx-4 px-4 py-3">
              <div className="flex items-center gap-3 min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                        isActive 
                          ? `${tab.activeClass} scale-105` 
                          : `${tab.colorClass} opacity-90 hover:opacity-100 hover:scale-[1.02]`
                      }`}
                    >
                      <span className="text-lg">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenu conditionnel selon l'onglet actif */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
              {activeTab === "tasks" && <ChildTaskList />}
              
              {activeTab === "penalties" && <ChildPenaltyHistory />}
              
              {activeTab === "rules" && <ChildRulesList />}
              
              {activeTab === "rewards" && <ChildRewardShop />}
              
              {activeTab === "savings" && (
                isPaid ? <SavingsGoalCard /> : (
                  <PremiumGate featureLabel={t("savingsGoals.title")}><SavingsGoalCard /></PremiumGate>
                )
              )}

              {activeTab === "history" && <ActivityHistory />}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
