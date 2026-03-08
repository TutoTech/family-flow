import { useTranslation } from "react-i18next";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import FamilyCard from "./FamilyCard";
import ParentTaskList from "./ParentTaskList";
import ParentRewardList from "./ParentRewardList";
import ParentPenaltyList from "./ParentPenaltyList";
import ActivityHistory from "./ActivityHistory";
import StatsCharts from "./StatsCharts";

interface Props { name: string; }

export default function ParentDashboard({ name }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <DashboardLayout title={t("dashboard.parentTitle")}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {t("dashboard.hello", { name })}
          </h2>
          <p className="text-muted-foreground mt-1">
            {profile?.family_id ? t("dashboard.familySummary") : t("dashboard.createOrJoin")}
          </p>
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