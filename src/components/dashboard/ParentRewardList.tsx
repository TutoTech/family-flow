import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRewards, usePendingRedemptions } from "@/hooks/useRewards";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Gift, CheckCircle2, XCircle, Star } from "lucide-react";
import CreateRewardDialog from "./CreateRewardDialog";

export default function ParentRewardList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isImpersonating } = useProfileSwitch();
  const { data: rewards = [], isLoading } = useFamilyRewards();
  const { data: pendingRedemptions = [] } = usePendingRedemptions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const handleRedemption = async (redemptionId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("reward_redemptions")
        .update({
          status: approved ? "approved" : "rejected",
          approved_by_parent_id: user!.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", redemptionId);
      if (error) throw error;

      toast({ title: approved ? t("rewards.rewardApproved") : t("rewards.requestRejected") });
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["child-stats"] });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Card id="section-rewards" className="shadow-card overflow-hidden">
        <CardHeader className="flex flex-col gap-3 pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate">{t("rewards.title")}</span>
          </CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1 text-xs px-2 w-full" disabled={isImpersonating}>
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {t("common.add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRedemptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("rewards.pendingRequests")}</p>
              {pendingRedemptions.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <span className="text-xl">{r.reward?.icon ?? "🎁"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{r.reward?.title}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {r.reward?.cost_points} {t("common.pts")}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleRedemption(r.id, true)} disabled={isImpersonating}>
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRedemption(r.id, false)} disabled={isImpersonating}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("rewards.noRewards")}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <span className="text-xl">{reward.icon ?? "🎁"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{reward.title}</span>
                    {reward.description && <p className="text-xs text-muted-foreground truncate">{reward.description}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    <Star className="h-3 w-3 mr-1" />
                    {reward.cost_points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRewardDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
