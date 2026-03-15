import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRewards, useMyRedemptions, useChildStats } from "@/hooks/useRewards";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Star, ShoppingCart, Clock, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { useFamilySettings } from "@/hooks/useFamilySettings";

export default function ChildRewardShop() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { data: rewards = [], isLoading } = useFamilyRewards();
  const { data: stats } = useChildStats(viewUserId ?? undefined);
  const { data: redemptions = [] } = useMyRedemptions();
  const { settings } = useFamilySettings();
  const currencySymbol = settings?.currency === "USD" ? "$" : "€";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentPoints = stats?.current_points ?? 0;

  const handleRedeem = async (rewardId: string, title: string, cost: number) => {
    if (currentPoints < cost) {
      toast({ title: t("rewards.notEnoughPoints"), description: t("rewards.notEnoughDesc", { cost, title }), variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("reward_redemptions").insert({
        child_id: viewUserId!,
        reward_id: rewardId,
      });
      if (error) throw error;

      toast({ title: t("rewards.requestSent"), description: t("rewards.requestSentDesc", { title }) });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const STATUS_MAP: Record<string, { label: string; icon: typeof Clock }> = {
    requested: { label: t("rewards.requested"), icon: Clock },
    approved: { label: t("rewards.approved"), icon: CheckCircle2 },
    rejected: { label: t("rewards.rejected"), icon: XCircle },
    delivered: { label: t("rewards.delivered"), icon: Gift },
  };

  return (
    <div className="space-y-4">
      <Card id="section-rewards" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <ShoppingCart className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="break-words whitespace-normal leading-tight">{t("rewards.shop")}</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            <Star className="h-3 w-3 mr-1" />
            {currentPoints} {t("common.pts")}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("rewards.noRewardsAvailable")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const canAfford = currentPoints >= reward.cost_points;
                return (
                  <div key={reward.id} className={`flex items-center gap-3 p-3 rounded-lg border ${canAfford ? "bg-card border-primary/20" : "bg-muted/30 opacity-70"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0">{reward.icon ?? "🎁"}</span>
                        <span className="font-medium text-sm text-foreground break-words whitespace-normal leading-tight">{reward.title}</span>
                      </div>
                      {reward.description && <p className="text-xs text-muted-foreground break-words whitespace-normal mt-0.5 leading-tight">{reward.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                        {reward.cost_points > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {reward.cost_points} {t("common.pts")}
                          </span>
                        )}
                        {reward.cost_money && reward.cost_money > 0 && (
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3 w-3" />
                            {reward.cost_money.toFixed(2)}{currencySymbol}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={canAfford ? "default" : "outline"}
                      disabled={!canAfford}
                      onClick={() => handleRedeem(reward.id, reward.title, reward.cost_points)}
                      className="flex-shrink-0"
                    >
                      {t("rewards.exchange")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {redemptions.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t("rewards.recentRequests")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {redemptions.map((r: any) => {
              const st = STATUS_MAP[r.status] ?? STATUS_MAP.requested;
              return (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0">{r.reward?.icon ?? "🎁"}</span>
                  <span className="flex-1 break-words whitespace-normal text-foreground leading-tight">{r.reward?.title}</span>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{st.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
