import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRules, useRecentPenalties, useFamilyChildren } from "@/hooks/usePenalties";
import { Plus, ShieldAlert, AlertTriangle, Star } from "lucide-react";
import CreateRuleDialog from "./CreateRuleDialog";
import ApplyPenaltyDialog from "./ApplyPenaltyDialog";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

export default function ParentPenaltyList() {
  const { t } = useTranslation();
  const { isImpersonating } = useProfileSwitch();
  const { data: rules = [], isLoading } = useFamilyRules();
  const { data: penalties = [] } = useRecentPenalties();
  const { data: children = [] } = useFamilyChildren();
  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const childNameMap = Object.fromEntries(children.map((c) => [c.user_id, c.name]));
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  return (
    <>
      <Card className="shadow-card overflow-hidden">
        <CardHeader className="flex flex-col gap-3 pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0" />
            <span className="truncate">{t("penalties.rulesAndPenalties")}</span>
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1 text-xs px-2" disabled={isImpersonating}>
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("penalties.rule")}</span>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setApplyOpen(true)} className="gap-1 text-xs px-2" disabled={rules.length === 0 || isImpersonating}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("penalties.penalty")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("penalties.noRules")}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg shrink-0">{rule.icon ?? "🚫"}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">{rule.label}</span>
                      {rule.description && <p className="text-xs text-muted-foreground truncate">{rule.description}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit shrink-0 text-destructive border-destructive/30">
                    <Star className="h-3 w-3 mr-1" />
                    -{rule.points_penalty}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {penalties.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-foreground">{t("penalties.recentPenalties")}</p>
              {penalties.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span>{p.rule?.icon ?? "🚫"}</span>
                  <span className="flex-1 truncate text-foreground">
                    {childNameMap[p.child_id] ?? t("common.child")} — {p.rule?.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: dateFnsLocale })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRuleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ApplyPenaltyDialog open={applyOpen} onOpenChange={setApplyOpen} />
    </>
  );
}
