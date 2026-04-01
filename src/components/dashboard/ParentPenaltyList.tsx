import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRules, useRecentPenalties, useFamilyChildren } from "@/hooks/usePenalties";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, HeartHandshake, ShieldAlert } from "lucide-react";
import ApplyPenaltyDialog from "./ApplyPenaltyDialog";
import { ManualAdjustmentDialog } from "./ManualAdjustmentDialog";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

export default function ParentPenaltyList() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { isImpersonating } = useProfileSwitch();
  const { data: penalties = [], isLoading } = useRecentPenalties();
  const { data: children = [] } = useFamilyChildren();
  const [applyOpen, setApplyOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);

  const childNameMap = Object.fromEntries(children.map((c) => [c.user_id, c.name]));
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;


  return (
    <>
      <Card id="section-penalties" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="break-words whitespace-normal leading-tight">{t("penalties.penaltiesContext")}</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => setBonusOpen(true)} className="gap-1 hidden sm:flex" disabled={isImpersonating}>
              <HeartHandshake className="h-4 w-4" />{t("adjustments.removeBonusButton")}
            </Button>
            <Button size="icon" variant="outline" onClick={() => setBonusOpen(true)} className="flex sm:hidden" disabled={isImpersonating} title={t("adjustments.removeBonusButton")}>
              <HeartHandshake className="h-4 w-4" />
            </Button>

            <Button size="sm" onClick={() => setApplyOpen(true)} className="gap-1" disabled={isImpersonating}>
              <AlertTriangle className="h-4 w-4" />{t("penalties.penalty")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : penalties.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("penalties.noRecentPenalties")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {penalties.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card text-sm">
                  <span className="flex-shrink-0">{p.rule?.icon ?? "⚠️"}</span>
                  <span className="flex-1 break-words whitespace-normal text-foreground leading-tight">
                    {childNameMap[p.child_id] ?? t("common.child")} — {p.rule?.label ?? p.custom_title ?? t("penalties.penalty")}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: dateFnsLocale })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ApplyPenaltyDialog open={applyOpen} onOpenChange={setApplyOpen} />

      <ManualAdjustmentDialog
        open={bonusOpen}
        onOpenChange={setBonusOpen}
        childrenList={children}
        mode="remove"
        familyId={profile?.family_id || ""}
        parentId={user?.id || ""}
      />
    </>
  );
}
