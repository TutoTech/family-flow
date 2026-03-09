/**
 * Carte des objectifs d'épargne.
 * Affiche la progression de chaque objectif par rapport au solde
 * du portefeuille, permet de réclamer un objectif atteint
 * et de supprimer ou créer de nouveaux objectifs.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Plus, Trash2, CheckCircle2, Target } from "lucide-react";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useChildStats } from "@/hooks/useRewards";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useToast } from "@/hooks/use-toast";
import CreateSavingsGoalDialog from "./CreateSavingsGoalDialog";

export default function SavingsGoalCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { goals, isLoading, updateGoal, deleteGoal } = useSavingsGoals();
  const { data: stats } = useChildStats(isImpersonating ? viewUserId : undefined);
  const { symbol } = useCurrency();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const walletBalance = stats?.wallet_balance ?? 0;

  const handleComplete = async (goalId: string) => {
    try {
      await updateGoal.mutateAsync({ id: goalId, is_completed: true, completed_at: new Date().toISOString() });
      toast({ title: "🎉", description: t("savingsGoals.completed") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal.mutateAsync(goalId);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);

  return (
    <>
      <Card id="section-savings" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            {t("savingsGoals.title")}
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("savingsGoals.add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <div className="text-center py-6">
              <Target className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("savingsGoals.empty")}</p>
              <Button size="sm" variant="link" onClick={() => setCreateOpen(true)} className="mt-2">
                {t("savingsGoals.addFirst")}
              </Button>
            </div>
          )}

          {activeGoals.map((goal) => {
            const progress = Math.min((walletBalance / goal.target_amount) * 100, 100);
            const canAfford = walletBalance >= goal.target_amount;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{goal.icon}</span>
                    <span className="font-semibold text-sm text-foreground">{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {canAfford && !isImpersonating && (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1 text-xs"
                        onClick={() => handleComplete(goal.id)}
                        disabled={updateGoal.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("savingsGoals.claim")}
                      </Button>
                    )}
                    {!isImpersonating && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {walletBalance.toFixed(2)}{symbol} / {goal.target_amount.toFixed(2)}{symbol}
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>

                {!canAfford && (
                  <p className="text-xs text-muted-foreground">
                    {t("savingsGoals.remaining", { amount: (goal.target_amount - walletBalance).toFixed(2), symbol })}
                  </p>
                )}
              </div>
            );
          })}

          {completedGoals.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("savingsGoals.completedSection")}
              </p>
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-muted"
                >
                  <span className="text-lg">{goal.icon}</span>
                  <span className="text-sm text-muted-foreground line-through flex-1">{goal.title}</span>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {goal.target_amount.toFixed(2)}{symbol}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSavingsGoalDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
