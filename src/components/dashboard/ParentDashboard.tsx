import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import FamilyCard from "./FamilyCard";
import ParentTaskList from "./ParentTaskList";
import ParentRewardList from "./ParentRewardList";
import ParentPenaltyList from "./ParentPenaltyList";
import ActivityHistory from "./ActivityHistory";
import StatsCharts from "./StatsCharts";
import UpgradeBanner from "./UpgradeBanner";

interface Props { name: string; }

export default function ParentDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout title={t("dashboard.parentTitle")}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {t("dashboard.hello", { name })}
            </h2>
            <p className="text-muted-foreground mt-1">
              {profile?.family_id ? t("dashboard.familySummary") : t("dashboard.createOrJoin")}
            </p>
          </div>
          {profile?.family_id && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/calendar")}>
              <CalendarDays className="h-4 w-4" />
              {t("calendar.title")}
            </Button>
          )}
        </div>
        <FamilyCard />
        {profile?.family_id && (
          <>
            <StatsCharts />
            <ParentTaskList />
            <ParentRewardList />
            <ParentPenaltyList />
            <ActivityHistory />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}