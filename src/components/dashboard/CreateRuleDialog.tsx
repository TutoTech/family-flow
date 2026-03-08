import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICONS = ["🚫", "📵", "🗣️", "🧹", "🔇", "⚠️", "🛑", "💤"];

export default function CreateRuleDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🚫");
  const [pointsPenalty, setPointsPenalty] = useState("5");
  const [walletPenalty, setWalletPenalty] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!label.trim() || !profile?.family_id) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("house_rules").insert({
        family_id: profile.family_id,
        label: label.trim(),
        description: description.trim() || null,
        icon,
        points_penalty: parseInt(pointsPenalty) || 0,
        wallet_penalty: parseFloat(walletPenalty) || 0,
      });
      if (error) throw error;
      toast({ title: t("penalties.ruleCreated") });
      queryClient.invalidateQueries({ queryKey: ["house-rules"] });
      onOpenChange(false);
      setLabel(""); setDescription(""); setIcon("🚫"); setPointsPenalty("5"); setWalletPenalty("0");
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
          <DialogTitle>{t("penalties.createRuleTitle")}</DialogTitle>
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
            <Label htmlFor="rule-label">{t("penalties.ruleName")}</Label>
            <Input id="rule-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("penalties.ruleNamePlaceholder")} />
          </div>
          <div>
            <Label htmlFor="rule-desc">{t("penalties.ruleDescription")}</Label>
            <Textarea id="rule-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("penalties.ruleDescPlaceholder")} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pts-pen">{t("penalties.pointsPenalty")}</Label>
              <Input id="pts-pen" type="number" min="0" value={pointsPenalty} onChange={(e) => setPointsPenalty(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wallet-pen">{t("penalties.walletPenalty")}</Label>
              <Input id="wallet-pen" type="number" min="0" step="0.1" value={walletPenalty} onChange={(e) => setWalletPenalty(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={!label.trim() || loading} className="w-full">
            {loading ? t("common.creating") : t("penalties.createRule")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
