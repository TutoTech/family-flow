import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyRules, useFamilyChildren } from "@/hooks/usePenalties";
import { Star, Wallet } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplyPenaltyDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { data: rules = [] } = useFamilyRules();
  const { data: children = [] } = useFamilyChildren();
  const { symbol: currencySymbol } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [childId, setChildId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRule = rules.find((r) => r.id === ruleId);

  const handleSubmit = async () => {
    if (!childId || !ruleId || !profile?.family_id || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("penalties_log").insert({
        child_id: childId,
        rule_id: ruleId,
        family_id: profile.family_id,
        logged_by_parent_id: user.id,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      toast({ title: t("penalties.penaltyApplied") });
      queryClient.invalidateQueries({ queryKey: ["recent-penalties"] });
      queryClient.invalidateQueries({ queryKey: ["child-stats"] });
      queryClient.invalidateQueries({ queryKey: ["child-penalties"] });
      onOpenChange(false);
      setChildId(""); setRuleId(""); setComment("");
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
          <DialogTitle>{t("penalties.applyTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("common.child")}</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger><SelectValue placeholder={t("createTask.selectChild")} /></SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("penalties.brokenRule")}</Label>
            <Select value={ruleId} onValueChange={setRuleId}>
              <SelectTrigger><SelectValue placeholder={t("penalties.selectRule")} /></SelectTrigger>
              <SelectContent>
                {rules.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.icon ?? "🚫"} {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRule && (
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" />-{selectedRule.points_penalty} {t("common.pts")}</span>
                {selectedRule.wallet_penalty > 0 && (
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" />-{selectedRule.wallet_penalty}{currencySymbol}</span>
                )}
              </div>
            )}
          </div>
          <div>
            <Label>{t("penalties.commentOptional")}</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("penalties.commentPlaceholder")} rows={2} />
          </div>
          <Button onClick={handleSubmit} disabled={!childId || !ruleId || loading} variant="destructive" className="w-full">
            {loading ? t("penalties.applying") : t("penalties.applyButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
