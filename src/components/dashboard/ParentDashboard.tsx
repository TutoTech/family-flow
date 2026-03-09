/**
 * Tableau de bord du parent.
 * Affiche un résumé de la famille, les statistiques (premium),
 * les tâches du jour, les récompenses, les pénalités et l'historique.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import { Button } from "@/components/ui/button";
import { CalendarDays, Lock } from "lucide-react";
import FamilyCard from "./FamilyCard";
import ParentTaskList from "./ParentTaskList";
import ParentRewardList from "./ParentRewardList";
import ParentPenaltyList from "./ParentPenaltyList";
import ActivityHistory from "./ActivityHistory";
import StatsCharts from "./StatsCharts";
import UpgradeBanner from "./UpgradeBanner";
import { PremiumGate } from "./PremiumBadge";

interface Props { name: string; }

export default function ParentDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { plan } = useFamilyPlan();
  const navigate = useNavigate();
  const location = useLocation();
  const isPaid = plan === "family";

  // Scroll to section if hash is present in URL
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [location.hash]);

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
          {/* Bouton calendrier : verrouillé pour les plans gratuits */}
          {profile?.family_id && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => isPaid ? navigate("/calendar") : null}
              disabled={!isPaid}
            >
              {!isPaid && <Lock className="h-3 w-3" />}
              <CalendarDays className="h-4 w-4" />
              {t("calendar.title")}
            </Button>
          )}
        </div>

        {/* Carte famille (créer/rejoindre ou afficher les membres) */}
        <FamilyCard />

        {/* Bannière d'upgrade vers le plan premium */}
        <UpgradeBanner />

        {profile?.family_id && (
          <>
            {/* Statistiques : accessibles directement en premium, sinon derrière un PremiumGate */}
            {isPaid ? <StatsCharts /> : (
              <PremiumGate featureLabel={t("stats.title")}><StatsCharts /></PremiumGate>
            )}

            {/* Listes de gestion : tâches, récompenses, pénalités */}
            <ParentTaskList />
            <ParentRewardList />
            <ParentPenaltyList />

            {/* Historique d'activité récent */}
            <ActivityHistory />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
