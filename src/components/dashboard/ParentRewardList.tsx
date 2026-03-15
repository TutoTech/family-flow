import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRewards, usePendingRedemptions } from "@/hooks/useRewards";
import { useCurrency } from "@/hooks/useCurrency";
import { useFamilyChildren } from "@/hooks/usePenalties";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Gift, CheckCircle2, XCircle, Star, MoreVertical, Pencil, Trash2, Award, Banknote } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CreateRewardDialog from "./CreateRewardDialog";
import EditRewardDialog from "./EditRewardDialog";
import { ManualAdjustmentDialog } from "./ManualAdjustmentDialog";

export default function ParentRewardList() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { isImpersonating } = useProfileSwitch();
  const { data: rewards = [], isLoading } = useFamilyRewards();
  const { data: pendingRedemptions = [] } = usePendingRedemptions();
  const { data: children = [] } = useFamilyChildren();
  const { symbol: currencySymbol } = useCurrency();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editReward, setEditReward] = useState<any>(null);
  const [deleteReward, setDeleteReward] = useState<any>(null);
  const [bonusOpen, setBonusOpen] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteReward) return;
    try {
      const { error } = await supabase
        .from("rewards")
        .update({ is_active: false })
        .eq("id", deleteReward.id);
      if (error) throw error;

      toast({ title: t("rewards.rewardDeleted") });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setDeleteReward(null);
    }
  };

  return (
    <>
      <Card id="section-rewards" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <Gift className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="break-words whitespace-normal leading-tight">{t("rewards.title")}</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => setBonusOpen(true)} className="gap-1 hidden sm:flex" disabled={isImpersonating}>
              <Award className="h-4 w-4" />{t("adjustments.addBonusButton")}
            </Button>
            <Button size="icon" variant="outline" onClick={() => setBonusOpen(true)} className="flex sm:hidden" disabled={isImpersonating} title={t("adjustments.addBonusButton")}>
              <Award className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1" disabled={isImpersonating}>
              <Plus className="h-4 w-4" />{t("common.add")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRedemptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("rewards.pendingRequests")}</p>
              {pendingRedemptions.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{r.reward?.icon ?? "🎁"}</span>
                      <span className="text-sm font-medium text-foreground break-words whitespace-normal leading-tight">{r.reward?.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {r.reward?.cost_points > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {r.reward?.cost_points} {t("common.pts")}
                        </span>
                      )}
                      {r.reward?.cost_money > 0 && (
                        <span className="flex items-center gap-1">
                          <Banknote className="h-3 w-3" />
                          {r.reward?.cost_money.toFixed(2)}{currencySymbol}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleRedemption(r.id, true)} disabled={isImpersonating}>
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRedemption(r.id, false)} disabled={isImpersonating}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
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
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{reward.icon ?? "🎁"}</span>
                      <span className="text-sm font-medium text-foreground break-words whitespace-normal leading-tight">{reward.title}</span>
                    </div>
                    {reward.description && <p className="text-xs text-muted-foreground break-words whitespace-normal mt-0.5 leading-tight">{reward.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {reward.cost_points > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {reward.cost_points}
                      </Badge>
                    )}
                    {reward.cost_money && reward.cost_money > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Banknote className="h-3 w-3 mr-1" />
                        {reward.cost_money.toFixed(2)}{currencySymbol}
                      </Badge>
                    )}
                  </div>
                  {!isImpersonating && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditReward(reward)}>
                          <Pencil className="h-4 w-4 mr-2" />{t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteReward(reward)}>
                          <Trash2 className="h-4 w-4 mr-2" />{t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRewardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRewardDialog
        open={!!editReward}
        onOpenChange={(open) => !open && setEditReward(null)}
        reward={editReward}
      />

      <ManualAdjustmentDialog
        open={bonusOpen}
        onOpenChange={setBonusOpen}
        childrenList={children}
        mode="add"
        familyId={profile?.family_id || ""}
        parentId={user?.id || ""}
      />

      <AlertDialog open={!!deleteReward} onOpenChange={(open) => !open && setDeleteReward(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("rewards.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("rewards.deleteConfirmDesc", { title: deleteReward?.title })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
