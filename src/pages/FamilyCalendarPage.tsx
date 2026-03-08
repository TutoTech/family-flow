/**
 * Page du calendrier familial.
 * Affiche le calendrier mensuel des tâches (fonctionnalité premium).
 * Redirige vers la bannière d'upgrade si le plan est gratuit.
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FamilyCalendar from "@/components/dashboard/FamilyCalendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";

export default function FamilyCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plan, loading } = useFamilyPlan();
  const isPaid = plan === "family";

  return (
    <DashboardLayout title={t("calendar.title")}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Button>
        {!loading && !isPaid ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">{t("payment.featureRequiresPremium")}</p>
            <UpgradeBanner />
          </div>
        ) : (
          <FamilyCalendar />
        )}
      </div>
    </DashboardLayout>
  );
}
