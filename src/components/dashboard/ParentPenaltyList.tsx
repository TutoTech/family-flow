import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyRules, useRecentPenalties, useFamilyChildren } from "@/hooks/usePenalties";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShieldAlert, AlertTriangle, Star, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CreateRuleDialog from "./CreateRuleDialog";
import ApplyPenaltyDialog from "./ApplyPenaltyDialog";
import EditRuleDialog from "./EditRuleDialog";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

export default function ParentPenaltyList() {
  const { t } = useTranslation();
  const { isImpersonating } = useProfileSwitch();
  const { data: rules = [], isLoading } = useFamilyRules();
  const { data: penalties = [] } = useRecentPenalties();
  const { data: children = [] } = useFamilyChildren();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);
  const [deleteRule, setDeleteRule] = useState<any>(null);

  const childNameMap = Object.fromEntries(children.map((c) => [c.user_id, c.name]));
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  const handleDelete = async () => {
    if (!deleteRule) return;
    try {
      const { error } = await supabase
        .from("house_rules")
        .update({ is_active: false })
        .eq("id", deleteRule.id);
      if (error) throw error;

      toast({ title: t("penalties.ruleDeleted") });
      queryClient.invalidateQueries({ queryKey: ["house-rules"] });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setDeleteRule(null);
    }
  };

  return (
    <>
      <Card id="section-penalties" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="truncate">{t("penalties.rulesAndPenalties")}</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1" disabled={isImpersonating}>
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">{t("penalties.rule")}</span>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setApplyOpen(true)} className="gap-1" disabled={rules.length === 0 || isImpersonating}>
              <AlertTriangle className="h-4 w-4" /><span className="hidden sm:inline">{t("penalties.penalty")}</span>
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
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{rule.icon ?? "🚫"}</span>
                      <span className="text-sm font-medium text-foreground truncate">{rule.label}</span>
                    </div>
                    {rule.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{rule.description}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0 text-destructive border-destructive/30">
                    <Star className="h-3 w-3 mr-1" />
                    -{rule.points_penalty}
                  </Badge>
                  {!isImpersonating && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditRule(rule)}>
                          <Pencil className="h-4 w-4 mr-2" />{t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteRule(rule)}>
                          <Trash2 className="h-4 w-4 mr-2" />{t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}

          {penalties.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-foreground">{t("penalties.recentPenalties")}</p>
              {penalties.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card text-sm">
                  <span className="flex-shrink-0">{p.rule?.icon ?? "⚠️"}</span>
                  <span className="flex-1 truncate text-foreground">
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

      <CreateRuleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ApplyPenaltyDialog open={applyOpen} onOpenChange={setApplyOpen} />
      <EditRuleDialog open={!!editRule} onOpenChange={(o) => !o && setEditRule(null)} rule={editRule} />

      <AlertDialog open={!!deleteRule} onOpenChange={(o) => !o && setDeleteRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("penalties.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("penalties.deleteConfirmDesc", { label: deleteRule?.label })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
