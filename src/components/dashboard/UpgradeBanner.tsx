import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFamilyPlan } from "@/hooks/useFamilyPlan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function UpgradeBanner() {
  const { t } = useTranslation();
  const { plan, loading, startPayment, refetch } = useFamilyPlan();
  const [upgrading, setUpgrading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [activating, setActivating] = useState(false);
  const { toast } = useToast();

  if (loading || plan === "family") return null;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await startPayment();
    } catch {
      // silent
    } finally {
      setUpgrading(false);
    }
  };

  const handleActivate = async () => {
    if (!code.trim()) return;
    setActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-activation-code", {
        body: { code: code.trim() },
      });

      if (error) throw error;

      if (data?.error) {
        const errorKey: Record<string, string> = {
          code_not_found: "payment.activationCodeNotFound",
          code_already_used: "payment.activationCodeUsed",
          no_family: "payment.activationNoFamily",
        };
        toast({
          title: t("common.error"),
          description: t(errorKey[data.error] || data.error),
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({ title: t("payment.activationSuccess") });
        setCode("");
        setShowCodeInput(false);
        await refetch();
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{t("payment.currentPlan")}: {t("payment.freePlan")}</p>
            <p className="text-xs text-muted-foreground">{t("payment.limitReachedDesc")}</p>
          </div>
        </div>
        <Button size="sm" onClick={handleUpgrade} disabled={upgrading}>
          {upgrading ? t("payment.upgrading") : t("payment.upgradeNow")}
        </Button>
      </div>

      <div className="border-t border-primary/20 pt-3">
        {!showCodeInput ? (
          <button
            onClick={() => setShowCodeInput(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="h-3 w-3" />
            {t("payment.orActivationCode")}
          </button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("payment.activationCodePlaceholder")}
              className="font-mono tracking-widest text-sm h-9"
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            />
            <Button size="sm" onClick={handleActivate} disabled={!code.trim() || activating}>
              {activating ? t("payment.activating") : t("payment.activateButton")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
