import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export default function UpgradeBanner() {
  const { t } = useTranslation();
  const { plan, loading } = useFamilyPlan();
  const [upgrading, setUpgrading] = useState(false);
  const { startPayment } = useFamilyPlan();

  if (loading || plan === "family") return null;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await startPayment();
    } catch {
      // toast handled elsewhere
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">{t("payment.currentPlan")}: {t("payment.freePlan")}</p>
          <p className="text-xs text-muted-foreground">{t("payment.limitReachedDesc")}</p>
        </div>
      </div>
      <Button size="sm" onClick={handleUpgrade} disabled={upgrading}>
        {upgrading ? t("payment.upgrading") : t("payment.upgradeNow")}
      </Button>
    </div>
  );
}
