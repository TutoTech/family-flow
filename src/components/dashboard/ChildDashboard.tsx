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
import { Star, Flame, CheckCircle2, AlertTriangle, Wallet, Shield, Gift, Target, History } from "lucide-react";
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
import BadgesDisplay from "./BadgesDisplay";
import BadgeCelebration from "./BadgeCelebration";
import LevelCelebration from "./LevelCelebration";
import { useChildStats } from "@/hooks/useRewards";
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
  const [activeTab, setActiveTab] = useState("tasks");

  const TABS = useMemo(() => [
    { id: "tasks", label: t("childDashboard.tabs.tasks"), icon: CheckCircle2, emoji: "📝",
      colorClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-500/10 hover:bg-emerald-200/60 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800/50", 
      activeClass: "bg-emerald-500 dark:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-900/50 border-transparent ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-background" },
    { id: "penalties", label: t("childDashboard.tabs.penalties"), icon: AlertTriangle, emoji: "🚨", 
      colorClass: "text-destructive dark:text-red-400 bg-red-100/60 dark:bg-red-500/10 hover:bg-red-200/60 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-800/50", 
      activeClass: "bg-destructive dark:bg-red-600 text-white shadow-md shadow-red-500/20 dark:shadow-red-900/50 border-transparent ring-2 ring-red-400/50 ring-offset-2 ring-offset-background" },
    { id: "rules", label: t("childDashboard.tabs.rules"), icon: Shield, emoji: "📜", 
      colorClass: "text-purple-700 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-500/10 hover:bg-purple-200/60 dark:hover:bg-purple-500/20 border border-purple-200 dark:border-purple-800/50", 
      activeClass: "bg-purple-500 dark:bg-purple-600 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-900/50 border-transparent ring-2 ring-purple-400/50 ring-offset-2 ring-offset-background" },
    { id: "rewards", label: t("childDashboard.tabs.rewards"), icon: Gift, emoji: "🎁", 
      colorClass: "text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 hover:bg-amber-200/60 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800/50", 
      activeClass: "bg-amber-500 dark:bg-amber-600 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-900/50 border-transparent ring-2 ring-amber-400/50 ring-offset-2 ring-offset-background" },
    { id: "savings", label: t("childDashboard.tabs.savings"), icon: Target, emoji: "🎯", 
      colorClass: "text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-500/10 hover:bg-blue-200/60 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-800/50", 
      activeClass: "bg-blue-500 dark:bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/50 border-transparent ring-2 ring-blue-400/50 ring-offset-2 ring-offset-background" },
    { id: "history", label: t("childDashboard.tabs.history"), icon: History, emoji: "🕰️", 
      colorClass: "text-gray-700 dark:text-gray-300 bg-gray-100/60 dark:bg-gray-500/10 hover:bg-gray-200/60 dark:hover:bg-gray-500/20 border border-gray-200 dark:border-gray-700/50", 
      activeClass: "bg-gray-700 dark:bg-gray-600 text-white shadow-md shadow-gray-500/20 dark:shadow-gray-900/50 border-transparent ring-2 ring-gray-400/50 ring-offset-2 ring-offset-background" },
  ], [t]);

  // Détermine l'ID de l'enfant affiché (impersoné ou réel)
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { data: stats } = useChildStats(isImpersonating ? viewUserId : undefined);
  const { symbol: currencySymbol } = useCurrency();

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

        {/* Cartes de statistiques rapides */}
        <div className="grid grid-cols-3 gap-3">
          {/* Solde du portefeuille */}
          <Card className="shadow-card bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Wallet className="h-5 w-5 text-emerald-600 mb-1" />
              <div className="text-xl font-bold text-emerald-600">{(stats?.wallet_balance ?? 0).toFixed(2)}{currencySymbol}</div>
              <p className="text-xs font-medium text-muted-foreground">{t("dashboard.wallet")}</p>
            </CardContent>
          </Card>

          {/* Points */}
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Star className="h-5 w-5 text-primary mb-1" />
              <div className="text-xl font-bold text-primary">{stats?.current_points ?? 0}</div>
              <p className="text-xs font-medium text-muted-foreground">{t("common.points")}</p>
            </CardContent>
          </Card>

          {/* Série de jours consécutifs */}
          <Card className="shadow-card bg-accent/10 border-accent/20">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Flame className="h-5 w-5 text-accent-foreground mb-1" />
              <div className="text-xl font-bold text-accent-foreground">{stats?.streak_days ?? 0}</div>
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
