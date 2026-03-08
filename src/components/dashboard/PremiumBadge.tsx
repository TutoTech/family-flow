/**
 * Composant PremiumGate.
 * Bloque l'accès à une fonctionnalité premium en affichant
 * un placeholder avec icône cadenas et message explicatif.
 * Affiche le contenu enfant si le plan est "family".
 */

import { useTranslation } from "react-i18next";
import { Lock, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";

interface PremiumGateProps {
  children: React.ReactNode;
  featureLabel: string;
}

export function PremiumGate({ children, featureLabel }: PremiumGateProps) {
  const { plan } = useFamilyPlan();
  const { t } = useTranslation();

  if (plan === "family") return <>{children}</>;

  return (
    <Card className="relative border-dashed border-primary/30 bg-primary/5 overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("payment.premiumFeature")}</span>
          </div>
          <p className="text-sm text-muted-foreground">{featureLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("payment.featureRequiresPremium")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
