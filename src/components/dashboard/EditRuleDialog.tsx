import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";

interface Rule {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  points_penalty: number;
  wallet_penalty: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: Rule | null;
}

const ICONS = [
  "🚫", "📵", "🗣️", "🧹", "🔇", "⚠️", "🛑", "💤",
  "👊", "🤥", "😤", "🚪", "📺", "🎮", "💢", "🙅",
  "⏰", "🍬", "🗑️", "😡", "🔊", "💥", "🤬", "👎",
];

export default function EditRuleDialog({ open, onOpenChange, rule }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { symbol: currencySymbol } = useCurrency();
  const queryClient = useQueryClient();

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🚫");
  const [pointsPenalty, setPointsPenalty] = useState("5");
  const [walletPenalty, setWalletPenalty] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setLabel(rule.label);
      setDescription(rule.description ?? "");
      setIcon(rule.icon ?? "🚫");
      setPointsPenalty(String(rule.points_penalty));
      setWalletPenalty(String(rule.wallet_penalty));
    }
  }, [rule]);

  const handleSave = async () => {
    if (!label.trim() || !rule) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("house_rules").update({
        label: label.trim(),
        description: description.trim() || null,
        icon,
        points_penalty: parseInt(pointsPenalty) || 0,
        wallet_penalty: parseFloat(walletPenalty) || 0,
      }).eq("id", rule.id);
      if (error) throw error;

      toast({ title: t("penalties.ruleUpdated") });
      queryClient.invalidateQueries({ queryKey: ["house-rules"] });
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
          <DialogTitle>{t("penalties.editRuleTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("penalties.ruleIcon")}</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`text-2xl p-1 rounded-lg transition-colors ${icon === i ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="edit-rule-label">{t("penalties.ruleName")}</Label>
            <Input id="edit-rule-label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-rule-desc">{t("penalties.ruleDescription")}</Label>
            <Textarea id="edit-rule-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-pts-pen">{t("penalties.pointsPenalty")}</Label>
              <Input id="edit-pts-pen" type="number" min="0" value={pointsPenalty} onChange={(e) => setPointsPenalty(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-wallet-pen">{t("penalties.walletPenalty")} ({currencySymbol})</Label>
              <Input id="edit-wallet-pen" type="number" min="0" step="0.1" value={walletPenalty} onChange={(e) => setWalletPenalty(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={!label.trim() || loading} className="w-full">
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
