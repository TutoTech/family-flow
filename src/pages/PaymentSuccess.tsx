import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { verifyPayment } = useFamilyPlan();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    verifyPayment().then(() => setVerified(true));
  }, [verifyPayment]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          {t("payment.successTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("payment.successDescription")}
        </p>
        <Button onClick={() => navigate("/dashboard")} className="w-full">
          {t("payment.goToDashboard")}
        </Button>
      </div>
    </div>
  );
}
