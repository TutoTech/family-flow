/**
 * Page de gestion des modèles de tâches.
 * Permet aux parents de visualiser, créer, modifier, supprimer
 * et activer/désactiver les modèles de tâches récurrentes.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTaskTemplates, TaskTemplate } from "@/hooks/useTaskTemplates";
import { useFamilyChildren } from "@/hooks/useTasks";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EditTaskDialog from "@/components/dashboard/EditTaskDialog";
import CreateTaskDialog from "@/components/dashboard/CreateTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Clock, Star, Camera, RotateCcw, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TaskTemplatesPage() {
  const { t } = useTranslation();
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, isLoading, deleteTemplate, toggleActive, reorderTemplates } = useTaskTemplates();
  const { data: children = [] } = useFamilyChildren();

  const [editTemplate, setEditTemplate] = useState<TaskTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<TaskTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const childNameMap = new Map(children.map((c) => [c.user_id, c.name]));

  const RECURRENCE_LABELS: Record<string, string> = {
    daily: t("createTask.daily"),
    weekdays: t("createTask.weekdays"),
    weekends: t("createTask.weekends"),
    weekly: t("createTask.weekly"),
    custom: t("taskTemplates.custom"),
  };

  useEffect(() => {
    if (!loading && role !== "parent") {
      navigate("/dashboard");
    }
  }, [loading, role, navigate]);

  if (loading || role !== "parent") return null;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate.mutateAsync(deleteTarget.id);
      toast({ title: t("taskTemplates.taskDeleted"), description: t("taskTemplates.taskDeletedDesc", { title: deleteTarget.title }) });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const handleToggle = async (template: TaskTemplate) => {
    try {
      await toggleActive.mutateAsync({ id: template.id, is_active: !template.is_active });
      toast({
        title: template.is_active ? t("taskTemplates.taskDisabled") : t("taskTemplates.taskEnabled"),
        description: t("taskTemplates.toggleDesc", { title: template.title, status: template.is_active ? t("taskTemplates.inactiveStatus") : t("taskTemplates.active") }),
      });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === templates.length - 1) return;

    const currentTemplate = templates[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const targetTemplate = templates[targetIndex];

    try {
      // Échange les valeurs de display_order entre les deux éléments
      await reorderTemplates.mutateAsync([
        { id: currentTemplate.id, display_order: targetTemplate.display_order },
        { id: targetTemplate.id, display_order: currentTemplate.display_order }
      ]);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title={t("taskTemplates.pageTitle")}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {t("taskTemplates.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("taskTemplates.templateCount", { count: templates.length })}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            {t("taskList.newTask")}
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="py-12 text-center">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{t("taskTemplates.noTemplates")}</h3>
              <p className="text-muted-foreground text-sm mb-4">{t("taskTemplates.noTemplatesHint")}</p>
              <Button onClick={() => setCreateOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                {t("taskTemplates.createTask")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((template, index) => (
              <Card key={template.id} className={`transition-opacity ${!template.is_active ? "opacity-50" : ""}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
                      <div className="flex flex-col items-center gap-0 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0 || reorderTemplates.isPending} onClick={() => handleMove(index, 'up')}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === templates.length - 1 || reorderTemplates.isPending} onClick={() => handleMove(index, 'down')}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground break-words whitespace-normal leading-tight">{template.title}</span>
                        {template.requires_photo && <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                        {!template.is_active && <Badge variant="secondary" className="text-xs">{t("taskTemplates.inactive")}</Badge>}
                      </div>
                      {template.description && <p className="text-sm text-muted-foreground break-words whitespace-normal mb-2 leading-tight">{template.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {template.is_obligatory ? (
                          <Badge variant="outline" className="text-xs">{t("createTask.obligatoryBadge")}</Badge>
                        ) : (
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary" />{template.points_reward} {t("common.pts")}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{template.due_time.slice(0, 5)}</span>
                        <Badge variant="outline" className="text-xs">{RECURRENCE_LABELS[template.recurrence_type] || template.recurrence_type}</Badge>
                        <span>→ {childNameMap.get(template.assigned_to_user_id) || "?"}</span>
                      </div>
                    </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 flex-shrink-0 w-full sm:w-auto sm:justify-end mt-2 sm:mt-0">
                      <Switch checked={template.is_active} onCheckedChange={() => handleToggle(template)} />
                      <Button variant="ghost" size="icon" onClick={() => { setCloneTemplate(template); setCreateOpen(true); }} title={t("common.duplicate")}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditTemplate(template)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(template)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditTaskDialog open={!!editTemplate} onOpenChange={(open) => !open && setEditTemplate(null)} template={editTemplate} />
      <CreateTaskDialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if(!open) setCloneTemplate(null); }} initialData={cloneTemplate} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("taskTemplates.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("taskTemplates.deleteDesc", { title: deleteTarget?.title })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
