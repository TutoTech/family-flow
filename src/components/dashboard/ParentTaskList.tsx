import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle2, XCircle, Camera, Eye, Settings2 } from "lucide-react";
import CreateTaskDialog from "./CreateTaskDialog";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  done: { label: "Fait", variant: "secondary" },
  awaiting_validation: { label: "À valider", variant: "default" },
  validated: { label: "Validé ✓", variant: "secondary" },
  rejected: { label: "Refusé", variant: "destructive" },
  late: { label: "En retard", variant: "destructive" },
};

export default function ParentTaskList() {
  const { tasks, isLoading, validateTask } = useTodayTasks();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleValidate = async (instanceId: string, approved: boolean) => {
    try {
      await validateTask.mutateAsync({ instanceId, approved });
      toast({ title: approved ? "Tâche validée !" : "Tâche refusée" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const viewPhoto = (storageKey: string) => {
    const { data } = supabase.storage.from("task-evidence").getPublicUrl(storageKey);
    setPreviewPhoto(data.publicUrl);
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Tâches du jour</CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune tâche pour aujourd'hui</p>
              <p className="text-xs">Créez des tâches récurrentes pour vos enfants</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const status = STATUS_MAP[task.status] ?? STATUS_MAP.pending;
                const tmpl = task.task_template as any;
                const evidence = (task.evidence as any[]) ?? [];

                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">{tmpl?.title}</span>
                        {tmpl?.requires_photo && <Camera className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      </div>
                      {tmpl?.description && (
                        <p className="text-xs text-muted-foreground truncate">{tmpl.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">{tmpl?.points_reward} pts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {evidence.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewPhoto(evidence[0].storage_key)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === "awaiting_validation" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:text-success"
                            onClick={() => handleValidate(task.id, true)}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleValidate(task.id, false)}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preuve photo</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <img src={previewPhoto} alt="Preuve" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
