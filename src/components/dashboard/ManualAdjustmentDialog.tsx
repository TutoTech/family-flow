import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ManualAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childrenList: any[];
  mode: "add" | "remove";
  familyId: string;
  parentId: string;
}

export function ManualAdjustmentDialog({
  open,
  onOpenChange,
  childrenList,
  mode,
  familyId,
  parentId,
}: ManualAdjustmentDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [childId, setChildId] = useState<string>("");
  const [currencyType, setCurrencyType] = useState<"points" | "money">("points");
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!childId || amount <= 0 || !reason) throw new Error("Missing fields");

      const dbType = `${mode}_${currencyType}` as "add_points" | "add_money" | "remove_points" | "remove_money";

      const { error } = await supabase.from("manual_adjustments").insert({
        family_id: familyId,
        child_id: childId,
        parent_id: parentId,
        type: dbType,
        points_amount: currencyType === "points" ? amount : 0,
        wallet_amount: currencyType === "money" ? amount : 0,
        reason: reason,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t(`adjustments.success_${mode}`),
      });
      queryClient.invalidateQueries({ queryKey: ["family-stats"] });
      queryClient.invalidateQueries({ queryKey: ["activity-history"] });
      onOpenChange(false);
      
      // Reset form
      setChildId("");
      setAmount(0);
      setReason("");
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("common.error"),
        description: t("adjustments.error"),
        variant: "destructive",
      });
    },
  });

  const isFormValid = childId !== "" && amount > 0 && reason.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? t("adjustments.addTitle") : t("adjustments.removeTitle")}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? t("adjustments.addDescription") : t("adjustments.removeDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t("common.child")}</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder={t("rewards.selectChildPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {childrenList.map((child) => (
                  <SelectItem key={child.user_id} value={child.user_id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("adjustments.currencyType")}</Label>
            <Select value={currencyType} onValueChange={(val: "points" | "money") => setCurrencyType(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">{t("adjustments.typePoints")}</SelectItem>
                <SelectItem value="money">{t("adjustments.typeMoney")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("adjustments.amount")}</Label>
            <Input
              type="number"
              min={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={currencyType === "points" ? "Ex: 10" : "Ex: 5"}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("adjustments.reason")}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("adjustments.reasonPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => submitMutation.mutate()} disabled={!isFormValid || submitMutation.isPending}>
            {submitMutation.isPending ? "..." : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
