import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Star, Wallet } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useChildPenalties } from "@/hooks/usePenalties";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

export default function ChildPenaltyHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { data: penalties = [], isLoading } = useChildPenalties(viewUserId ?? undefined);
  const { symbol: currencySymbol } = useCurrency();
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  return (
    <Card id="section-penalties" className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          {t("penalties.myPenalties")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : penalties.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("penalties.noPenalties")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {penalties.map((p: any) => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <span className="text-xl mt-0.5">{p.rule?.icon ?? "⚠️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.rule?.label ?? p.custom_title ?? t("penalties.penalty")}</p>
                  {p.comment && <p className="text-xs text-muted-foreground mt-0.5">{p.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: dateFnsLocale })}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                    <Star className="h-3 w-3 mr-1" />-{p.rule?.points_penalty ?? p.points_amount ?? 0}
                  </Badge>
                  {(p.rule?.wallet_penalty > 0 || p.wallet_amount > 0) && (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                      <Wallet className="h-3 w-3 mr-1" />-{p.rule?.wallet_penalty ?? p.wallet_amount}{currencySymbol}
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
