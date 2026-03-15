import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost_points: number;
  cost_money: number | null;
  icon: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
}

const ICON_OPTIONS = [
  "🎁", "🎮", "🍕", "🎬", "📱", "⚽", "🏖️", "🎵", "📚", "🧸", "🍦", "🎨",
  "🎧", "🎤", "🎸", "🎹", "🏀", "🎾", "🛹", "🚲", "🎂", "🧁", "🍩", "🍿",
  "👑", "💎", "👗", "💄", "⏰", "🕹️", "🎯", "🎪", "🎭", "🏊", "🎿", "🛍️",
  "🐶", "🐱", "🦄", "🐴", "📷", "✈️", "🚀", "💻", "⌚", "🎒",
];

export default function EditRewardDialog({ open, onOpenChange, reward }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costPoints, setCostPoints] = useState("10");
  const [costMoney, setCostMoney] = useState("");
  const [icon, setIcon] = useState("🎁");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reward) {
      setTitle(reward.title);
      setDescription(reward.description ?? "");
      setCostPoints(String(reward.cost_points));
      setCostMoney(reward.cost_money ? String(reward.cost_money) : "");
      setIcon(reward.icon ?? "🎁");
    }
  }, [reward]);

  const handleSave = async () => {
    if (!title.trim() || !reward) return;
    const points = parseInt(costPoints) || 0;
    const money = costMoney ? parseFloat(costMoney) : null;
    
    // Au moins un cout doit etre specifie
    if (points <= 0 && (!money || money <= 0)) {
      toast({ title: t("common.error"), description: t("rewards.needAtLeastOneCost"), variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from("rewards").update({
        title: title.trim(),
        description: description.trim() || null,
        cost_points: points,
        cost_money: money,
        icon: icon || "🎁",
      }).eq("id", reward.id);
      if (error) throw error;

      toast({ title: t("rewards.rewardUpdated") });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rewards.editTitle")}</DialogTitle>
          <DialogDescription>{t("rewards.editSubtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("rewards.icon")}</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-xl w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                    icon === emoji ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-reward-title">{t("rewards.name")}</Label>
            <Input id="edit-reward-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-reward-desc">{t("createTask.description")}</Label>
            <Input id="edit-reward-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reward-cost-points">{t("rewards.costPoints")}</Label>
              <Input id="edit-reward-cost-points" type="number" min="0" value={costPoints} onChange={(e) => setCostPoints(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reward-cost-money">{t("rewards.costMoney")}</Label>
              <Input id="edit-reward-cost-money" type="number" min="0" step="0.01" value={costMoney} onChange={(e) => setCostMoney(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t("rewards.costHint")}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} disabled={!title.trim() || loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
