import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Camera, Clock, Star } from "lucide-react";

export default function ChildTaskList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { tasks, isLoading, completeTask } = useTodayTasks();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskIdRef = useRef<string | null>(null);

  const STATUS_CHILD: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: t("childTasks.toDo"), variant: "outline" },
    awaiting_validation: { label: t("childTasks.awaiting"), variant: "default" },
    validated: { label: t("taskList.validated"), variant: "secondary" },
    rejected: { label: t("taskList.rejected"), variant: "destructive" },
    late: { label: t("taskList.late"), variant: "destructive" },
  };

  const myTasks = tasks.filter((tk) => tk.assigned_to_user_id === viewUserId);

  const handleComplete = (taskId: string, requiresPhoto: boolean) => {
    if (requiresPhoto) {
      pendingTaskIdRef.current = taskId;
      fileInputRef.current?.click();
    } else {
      submitTask(taskId);
    }
  };

  const submitTask = async (taskId: string, photo?: File) => {
    try {
      await completeTask.mutateAsync({ instanceId: taskId, photoFile: photo });
      toast({ title: t("childTasks.wellDone"), description: t("childTasks.taskSent") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingTaskIdRef.current) {
      submitTask(pendingTaskIdRef.current, file);
      pendingTaskIdRef.current = null;
    }
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <Card id="section-tasks" className="shadow-card">
        <CardContent className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (myTasks.length === 0) {
    return (
      <Card id="section-tasks" className="border-dashed border-2 border-secondary/30 bg-secondary/5">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-secondary mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">{t("childTasks.noTasks")}</h3>
          <p className="text-muted-foreground text-sm">{t("childTasks.noTasksHint")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      <Card id="section-tasks" className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t("childTasks.myTasks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTasks.map((task) => {
            const tmpl = task.task_template as any;
            const status = STATUS_CHILD[task.status] ?? STATUS_CHILD.pending;
            const isPending = task.status === "pending";
            const isRejected = task.status === "rejected";
            const canAct = isPending || isRejected;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  canAct ? "bg-card border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${canAct ? "text-foreground" : "text-muted-foreground"}`}>
                      {tmpl?.title}
                    </span>
                    {tmpl?.requires_photo && <Camera className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  {tmpl?.description && (
                    <p className="text-xs text-muted-foreground truncate">{tmpl.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                    <span className="text-xs text-primary flex items-center gap-0.5">
                      {tmpl?.is_obligatory ? (
                        <Badge variant="outline" className="text-xs">{t("createTask.obligatoryBadge")}</Badge>
                      ) : (
                        <><Star className="h-3 w-3" />{tmpl?.points_reward}</>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(task.due_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {canAct && (
                  <Button
                    size="sm"
                    variant={isRejected ? "outline" : "default"}
                    className="gap-1 flex-shrink-0"
                    onClick={() => handleComplete(task.id, tmpl?.requires_photo)}
                    disabled={completeTask.isPending}
                  >
                    {tmpl?.requires_photo ? <Camera className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {isRejected ? t("childTasks.retry") : t("childTasks.done")}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
