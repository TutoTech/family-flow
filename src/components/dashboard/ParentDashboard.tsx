/**
 * Tableau de bord du parent.
 * Affiche un résumé de la famille, les statistiques (premium),
 * les tâches du jour, les récompenses, les pénalités et l'historique.
 */

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import { useVacationMode } from "@/hooks/useVacationMode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Lock, CheckCircle2, AlertTriangle, Gift, ShieldAlert, History, BarChart3, Palmtree } from "lucide-react";
import FamilyCard from "./FamilyCard";
import ParentTaskList from "./ParentTaskList";
import ParentRewardList from "./ParentRewardList";
import ParentPenaltyList from "./ParentPenaltyList";
import ParentRuleList from "./ParentRuleList";
import ActivityHistory from "./ActivityHistory";
// Chargé à la demande : embarque recharts (lourd), inutile tant que
// l'utilisateur n'ouvre pas l'onglet statistiques.
const StatsCharts = lazy(() => import("./StatsCharts"));
import UpgradeBanner from "./UpgradeBanner";
import { PremiumGate } from "./PremiumBadge";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

interface Props { name: string; }

export default function ParentDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { plan } = useFamilyPlan();
  const { isVacationMode, toggleVacationMode } = useVacationMode();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isPaid = plan === "family";
  const [activeTab, setActiveTab] = useState("tasks");

  const TABS = useMemo(() => [
    { id: "tasks", label: t("dashboard.tabs.tasks"), icon: CheckCircle2 },
    { id: "penalties", label: t("dashboard.tabs.penalties"), icon: AlertTriangle },
    { id: "rewards", label: t("dashboard.tabs.rewards"), icon: Gift },
    { id: "rules", label: t("dashboard.tabs.rules"), icon: ShieldAlert },
    { id: "history", label: t("dashboard.tabs.history"), icon: History },
    { id: "stats", label: t("dashboard.tabs.stats"), icon: BarChart3 },
    { id: "calendar", label: t("dashboard.tabs.calendar"), icon: CalendarDays },
  ], [t]);

  // Scroll to section if coming from notification click
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const sectionId = state.scrollTo;
      // Clear the state to prevent re-scrolling
      navigate(location.pathname, { replace: true, state: {} });
      
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 500); // Délai pour laisser le rendu se terminer
    }
  }, [location.state, navigate, location.pathname]);

  const handleVacationToggle = async () => {
    const newState = !isVacationMode;
    try {
      await toggleVacationMode.mutateAsync(newState);
      toast({
        title: newState ? t("vacationMode.activated") : t("vacationMode.deactivated"),
        description: newState ? t("vacationMode.activatedDesc") : t("vacationMode.deactivatedDesc"),
      });
    } catch (err) {
      toast({ title: t("common.error"), description: getErrorMessage(err), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title={t("dashboard.parentTitle")}>
      <div className="space-y-6">
        {/* En-tête avec salutation et bouton calendrier */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {t("dashboard.hello", { name })}
            </h2>
            <p className="text-muted-foreground mt-1">
              {profile?.family_id ? t("dashboard.familySummary") : t("dashboard.createOrJoin")}
            </p>
          </div>
        </div>

        {/* Carte famille (créer/rejoindre ou afficher les membres) */}
        <FamilyCard />

        {/* Bannière d'upgrade vers le plan premium */}
        <UpgradeBanner />

        {profile?.family_id && (
          <>
            {/* Bannière Mode Vacances */}
            <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
              isVacationMode
                ? "border-warning/50 bg-warning/10"
                : "border-border bg-card"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isVacationMode ? "🏖️" : "🌴"}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {t("vacationMode.title")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isVacationMode ? t("vacationMode.bannerActive") : t("vacationMode.bannerInactive")}
                  </p>
                </div>
              </div>
              <Switch
                checked={isVacationMode}
                onCheckedChange={handleVacationToggle}
                disabled={toggleVacationMode.isPending}
              />
            </div>

            {/* Barre de navigation horizontale (Onglets) */}
            <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
              <div className="flex items-center gap-2 min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  if (tab.id === "calendar" && !isPaid) {
                    return (
                      <Button
                        key={tab.id}
                        variant="outline"
                        className="gap-2 rounded-full whitespace-nowrap opacity-50 bg-muted/50"
                        disabled
                      >
                        <Lock className="h-4 w-4" />
                        {tab.label}
                      </Button>
                    );
                  }

                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "default" : "outline"}
                      className={`gap-2 rounded-full whitespace-nowrap ${isActive ? "shadow-md" : "bg-background"}`}
                      onClick={() => {
                        if (tab.id === "calendar") {
                          navigate("/calendar");
                        } else {
                          setActiveTab(tab.id);
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Contenu conditionnel selon l'onglet actif */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === "tasks" && <ParentTaskList />}
              
              {activeTab === "penalties" && <ParentPenaltyList />}
              
              {activeTab === "rewards" && <ParentRewardList />}
              
              {activeTab === "rules" && <ParentRuleList />}
              
              {activeTab === "history" && <ActivityHistory />}
              
              {activeTab === "stats" && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  }
                >
                  {isPaid ? <StatsCharts /> : (
                    <PremiumGate featureLabel={t("dashboard.tabs.stats")}><StatsCharts /></PremiumGate>
                  )}
                </Suspense>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

