import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FamilyCalendar from "@/components/dashboard/FamilyCalendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function FamilyCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DashboardLayout title={t("calendar.title")}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Button>
        <FamilyCalendar />
      </div>
    </DashboardLayout>
  );
}
