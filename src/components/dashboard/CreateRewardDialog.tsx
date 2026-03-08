import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRewardDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("10");
  const [icon, setIcon] = useState("🎁");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !profile?.family_id) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("rewards").insert({
        title: title.trim(),
        description: description.trim() || null,
        cost_points: parseInt(cost) || 10,
        icon: icon || "🎁",
        family_id: profile.family_id,
      });
      if (error) throw error;

      toast({ title: t("rewards.rewardCreated"), description: t("rewards.rewardCreatedDesc", { title }) });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      setTitle(""); setDescription(""); setCost("10"); setIcon("🎁");
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const ICON_OPTIONS = [
    "🎁", "🎮", "🍕", "🎬", "📱", "⚽", "🏖️", "🎵", "📚", "🧸", "🍦", "🎨",
    "🎧", "🎤", "🎸", "🎹", "🏀", "🎾", "🛹", "🚲", "🎂", "🧁", "🍩", "🍿",
    "👑", "💎", "👗", "💄", "⏰", "🕹️", "🎯", "🎪", "🎭", "🏊", "🎿", "🛍️",
    "🐶", "🐱", "🦄", "🐴", "📷", "✈️", "🚀", "💻", "⌚", "🎒",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rewards.createTitle")}</DialogTitle>
          <DialogDescription>{t("rewards.createSubtitle")}</DialogDescription>
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
            <Label htmlFor="reward-title">{t("rewards.name")}</Label>
            <Input id="reward-title" placeholder={t("rewards.namePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-desc">{t("createTask.description")}</Label>
            <Input id="reward-desc" placeholder={t("createTask.descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-cost">{t("rewards.costPoints")}</Label>
            <Input id="reward-cost" type="number" min="1" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleCreate} disabled={!title.trim() || loading}>
            {loading ? t("common.creating") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
