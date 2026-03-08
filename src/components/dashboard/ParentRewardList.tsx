import { useState } from "react";
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
  const { user } = useAuth();
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

      toast({ title: approved ? "Récompense approuvée !" : "Demande refusée" });
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["child-stats"] });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Récompenses
          </CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending redemptions */}
          {pendingRedemptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Demandes en attente</p>
              {pendingRedemptions.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <span className="text-xl">{r.reward?.icon ?? "🎁"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{r.reward?.title}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {r.reward?.cost_points} pts
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleRedemption(r.id, true)}>
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRedemption(r.id, false)}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Reward catalog */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune récompense créée</p>
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
