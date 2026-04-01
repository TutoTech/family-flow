import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Camera, Clock, Star, Ban, Filter, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TASK_COLORS } from "@/utils/taskColors";

type StatusFilter = "all" | "pending" | "awaiting_validation" | "validated" | "rejected" | "not_done" | "skipped" | "late" | "done";

const STATUS_GROUPS: { key: StatusFilter; color: string }[] = [
  { key: "all", color: "" },
  { key: "awaiting_validation", color: "bg-amber-500" },
  { key: "pending", color: "bg-muted-foreground" },
  { key: "validated", color: "bg-emerald-500" },
  { key: "not_done", color: "bg-destructive" },
  { key: "rejected", color: "bg-destructive" },
  { key: "skipped", color: "bg-muted-foreground/50" },
  { key: "late", color: "bg-orange-500" },
  { key: "done", color: "bg-blue-500" },
];

export default function ChildTaskList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { tasks, isLoading, completeTask, skipTask, updateChildTaskColor } = useTodayTasks();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskIdRef = useRef<string | null>(null);

  const STATUS_CHILD: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: t("childTasks.toDo"), variant: "outline" },
    awaiting_validation: { label: t("childTasks.awaiting"), variant: "default" },
    validated: { label: t("taskList.validated"), variant: "secondary" },
    rejected: { label: t("taskList.rejected"), variant: "destructive" },
    late: { label: t("taskList.late"), variant: "destructive" },
    skipped: { label: t("childTasks.skipped"), variant: "outline" },
    not_done: { label: t("childTasks.notDone"), variant: "destructive" },
    done: { label: t("taskList.done"), variant: "secondary" },
  };

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const myTasks = tasks.filter((tk) => tk.assigned_to_user_id === viewUserId);

  // Count tasks per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: myTasks.length };
    for (const task of myTasks) {
      counts[task.status] = (counts[task.status] || 0) + 1;
    }
    return counts;
  }, [myTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return myTasks.filter((task) => {
      return statusFilter === "all" || task.status === statusFilter;
    });
  }, [myTasks, statusFilter]);

  const getStatusFilterLabel = (key: StatusFilter): string => {
    if (key === "all") return t("common.all");
    return STATUS_CHILD[key]?.label ?? key;
  };

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

  const handleSkip = async (taskId: string) => {
    try {
      await skipTask.mutateAsync(taskId);
      toast({ title: t("childTasks.skipped"), description: t("childTasks.taskSkipped") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleColorChange = async (taskId: string, templateId: string, color: string) => {
    try {
      await updateChildTaskColor.mutateAsync({ templateId, color });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
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
          {/* Filters bar */}
          {myTasks.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {STATUS_GROUPS.map(({ key }) => {
                const count = statusCounts[key] || 0;
                if (key !== "all" && count === 0) return null;
                const isActive = statusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {getStatusFilterLabel(key)}
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("taskList.noFilterResults")}</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const tmpl = task.task_template as any;
              const status = STATUS_CHILD[task.status] ?? STATUS_CHILD.pending;
              const isPending = task.status === "pending";
              const isRejected = task.status === "rejected";
              const canAct = isPending || isRejected;
              const bgColorClass = tmpl?.child_bg_color || tmpl?.bg_color || (canAct ? "bg-card border-primary/20" : "bg-muted/30");
              const hasCustomColor = !!(tmpl?.child_bg_color || tmpl?.bg_color);

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${bgColorClass} ${
                    !canAct && !hasCustomColor ? "bg-muted/30" : ""
                  } ${!canAct && hasCustomColor ? "opacity-60" : ""}`}
                >
                  <div className="flex-1 min-w-0 w-full text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${canAct ? "text-foreground" : "text-muted-foreground"}`}>
                        {tmpl?.title}
                      </span>
                      {tmpl?.requires_photo && <Camera className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    {tmpl?.description && (
                      <p className="text-xs text-muted-foreground break-words whitespace-normal leading-tight">{tmpl.description}</p>
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
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full sm:w-auto sm:justify-end mt-2 sm:mt-0">
                    {/* Color Picker for Child */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="end">
                        <p className="text-xs font-medium mb-2">{t("childTasks.myColor", "Ma couleur de fond")}</p>
                        <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                          {TASK_COLORS.map((color) => (
                            <button
                              key={color.id}
                              title={color.name}
                              onClick={() => handleColorChange(task.id, task.task_template_id, color.value)}
                              className={`w-6 h-6 rounded-full border transition-all ${
                                color.value
                                  ? color.value.split(" ")[0]
                                  : "bg-background border-dashed"
                              } ${
                                (tmpl.child_bg_color || "") === color.value 
                                  ? "border-primary scale-110 shadow-sm" 
                                  : "border-border hover:scale-105"
                              }`}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {canAct && (
                      <>
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 flex-shrink-0"
                            onClick={() => handleSkip(task.id)}
                            disabled={skipTask.isPending}
                          >
                            <Ban className="h-4 w-4" />
                            <span className="hidden sm:inline">{t("childTasks.notToDo")}</span>
                          </Button>
                        )}
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
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}
