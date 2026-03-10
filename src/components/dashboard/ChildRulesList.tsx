import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Star, Wallet, Info } from "lucide-react";
import { useFamilyRules } from "@/hooks/usePenalties";
import { useCurrency } from "@/hooks/useCurrency";

export default function ChildRulesList() {
  const { t } = useTranslation();
  const { data: rules = [], isLoading } = useFamilyRules();
  const { symbol: currencySymbol } = useCurrency();

  // On ne charge l'encart que s'il y a des règles (ou en cours de chargement)
  // pour ne pas alourdir le dashboard enfant si la famille n'utilise pas cette fonctionnalité
  if (!isLoading && rules.length === 0) {
    return null;
  }

  return (
    <Card id="section-rules" className="shadow-card border-destructive/20 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          {t("childDashboard.houseRules")}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {t("childDashboard.houseRulesDesc")}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-destructive" />
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                <span className="text-xl mt-0.5">{rule.icon ?? "🚫"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{rule.label}</p>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                    <Star className="h-3 w-3 mr-1" />-{rule.points_penalty}
                  </Badge>
                  {rule.wallet_penalty > 0 && (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                      <Wallet className="h-3 w-3 mr-1" />-{rule.wallet_penalty}{currencySymbol}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
