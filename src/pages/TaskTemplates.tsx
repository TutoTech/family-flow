import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTaskTemplates, TaskTemplate } from "@/hooks/useTaskTemplates";
import { useFamilyChildren } from "@/hooks/useTasks";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EditTaskDialog from "@/components/dashboard/EditTaskDialog";
import CreateTaskDialog from "@/components/dashboard/CreateTaskDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Clock, Star, Camera, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Tous les jours",
  weekdays: "Jours de semaine",
  weekends: "Week-ends",
  weekly: "Hebdomadaire",
  custom: "Personnalisé",
};

export default function TaskTemplatesPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, isLoading, deleteTemplate, toggleActive } = useTaskTemplates();
  const { data: children = [] } = useFamilyChildren();

  const [editTemplate, setEditTemplate] = useState<TaskTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const childNameMap = new Map(children.map((c) => [c.user_id, c.name]));

  if (role !== "parent") {
    navigate("/dashboard");
    return null;
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate.mutateAsync(deleteTarget.id);
      toast({ title: "Tâche supprimée", description: `"${deleteTarget.title}" a été supprimée.` });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const handleToggle = async (template: TaskTemplate) => {
    try {
      await toggleActive.mutateAsync({ id: template.id, is_active: !template.is_active });
      toast({
        title: template.is_active ? "Tâche désactivée" : "Tâche réactivée",
        description: `"${template.title}" est maintenant ${template.is_active ? "inactive" : "active"}.`,
      });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Gestion des tâches">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Tâches récurrentes
              </h2>
              <p className="text-sm text-muted-foreground">
                {templates.length} modèle{templates.length !== 1 ? "s" : ""} de tâches
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
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
              <h3 className="text-lg font-bold text-foreground mb-2">Aucune tâche récurrente</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Créez votre première tâche récurrente pour commencer.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Créer une tâche
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`transition-opacity ${!template.is_active ? "opacity-50" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{template.title}</h3>
                        {template.requires_photo && (
                          <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        {!template.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground truncate mb-2">{template.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-primary" />
                          {template.points_reward} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.due_time.slice(0, 5)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {RECURRENCE_LABELS[template.recurrence_type] || template.recurrence_type}
                        </Badge>
                        <span>→ {childNameMap.get(template.assigned_to_user_id) || "?"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => handleToggle(template)}
                        aria-label="Activer/désactiver"
                      />
                      <Button variant="ghost" size="icon" onClick={() => setEditTemplate(template)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditTaskDialog
        open={!!editTemplate}
        onOpenChange={(open) => !open && setEditTemplate(null)}
        template={editTemplate}
      />

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription>
              La tâche "{deleteTarget?.title}" sera définitivement supprimée. Les instances existantes ne seront pas affectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
