import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSavingsGoals, SavingsGoal } from "@/hooks/useSavingsGoals";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";

const ICON_OPTIONS = [
  "🎮", "📱", "🎧", "👟", "🎨", "📚", "🚲", "🎯", "🧸", "🎁", "💎", "🏖️",
  "🎸", "🎹", "🎻", "🎬", "🎤", "🏀", "⚽", "🎾", "🏊", "🛹", "🎿", "🧩",
  "🤖", "🦄", "🐶", "🐱", "🎂", "🍕", "🍦", "🧁", "👑", "💄", "👗", "🕹️",
  "📷", "🔭", "🧪", "✈️", "🚀", "🏠", "💻", "⌚", "🛍️", "💰",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
}

export default function EditSavingsGoalDialog({ open, onOpenChange, goal }: Props) {
  const { t } = useTranslation();
  const { updateGoal } = useSavingsGoals();
  const { symbol } = useCurrency();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal && open) {
      setTitle(goal.title);
      setIcon(goal.icon || "🎯");
      setTargetAmount(goal.target_amount.toString());
    }
  }, [goal, open]);

  const handleUpdate = async () => {
    if (!title.trim() || !targetAmount || !goal) return;
    setLoading(true);
    try {
      await updateGoal.mutateAsync({ 
        id: goal.id, 
        title: title.trim(), 
        icon, 
        target_amount: parseFloat(targetAmount) 
      });
      toast({ title: "✅", description: t("savingsGoals.updated") || t("savingsGoals.created") });
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
          <DialogTitle>{t("savingsGoals.editTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("savingsGoals.goalName")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("savingsGoals.goalNamePlaceholder")}
            />
          </div>

          <div>
            <Label>{t("savingsGoals.chooseIcon")}</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                    icon === ic ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t("savingsGoals.targetAmount")} ({symbol})</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="10.00"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleUpdate} disabled={loading || !title.trim() || !targetAmount}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
