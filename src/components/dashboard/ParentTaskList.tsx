import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayTasks, useFamilyChildren } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { Plus, Clock, CheckCircle2, XCircle, Camera, Eye, Settings2, RotateCcw, Filter, Users } from "lucide-react";
import CreateTaskDialog from "./CreateTaskDialog";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function ParentTaskList() {
  const { t } = useTranslation();
  const { tasks, isLoading, validateTask, resetTask, markNotDone } = useTodayTasks();
  const { data: children = [] } = useFamilyChildren();
  const childNameMap = Object.fromEntries(children.map((c) => [c.user_id, c.name]));
  const { toast } = useToast();
  const { role: realRole } = useAuth();
  const { isImpersonating } = useProfileSwitch();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [childFilter, setChildFilter] = useState<string>("all");

  const isReadOnly = isImpersonating && realRole === "child";

  const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: t("taskList.pending"), variant: "outline" },
    done: { label: t("taskList.done"), variant: "secondary" },
    awaiting_validation: { label: t("taskList.awaitingValidation"), variant: "default" },
    validated: { label: t("taskList.validated"), variant: "secondary" },
    rejected: { label: t("taskList.rejected"), variant: "destructive" },
    late: { label: t("taskList.late"), variant: "destructive" },
    skipped: { label: t("taskList.skipped"), variant: "outline" },
    not_done: { label: t("taskList.notDone"), variant: "destructive" },
  };

  // Count tasks per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    for (const task of tasks) {
      const childMatch = childFilter === "all" || task.assigned_to_user_id === childFilter;
      if (childMatch) {
        counts[task.status] = (counts[task.status] || 0) + 1;
      }
    }
    if (childFilter !== "all") {
      counts.all = tasks.filter((t) => t.assigned_to_user_id === childFilter).length;
    }
    return counts;
  }, [tasks, childFilter]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const childMatch = childFilter === "all" || task.assigned_to_user_id === childFilter;
      return statusMatch && childMatch;
    });
  }, [tasks, statusFilter, childFilter]);

  const handleValidate = async (instanceId: string, approved: boolean) => {
    try {
      await validateTask.mutateAsync({ instanceId, approved });
      toast({ title: approved ? t("taskList.taskValidated") : t("taskList.taskRejected") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleReset = async (instanceId: string) => {
    try {
      await resetTask.mutateAsync(instanceId);
      toast({ title: t("taskList.taskReset") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleMarkNotDone = async (instanceId: string) => {
    try {
      await markNotDone.mutateAsync(instanceId);
      toast({ title: t("penalties.penaltyApplied") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const viewPhoto = async (storageKey: string) => {
    const { data, error } = await supabase.storage.from("task-evidence").createSignedUrl(storageKey, 300);
    if (data?.signedUrl) setPreviewPhoto(data.signedUrl);
  };

  const getStatusFilterLabel = (key: StatusFilter): string => {
    if (key === "all") return t("common.all");
    return STATUS_MAP[key]?.label ?? key;
  };

  return (
    <>
      <Card id="section-tasks" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("taskList.todayTasks")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/tasks")} className="gap-1" disabled={isReadOnly}>
              <Settings2 className="h-4 w-4" />{t("common.manage")}
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1" disabled={isReadOnly}>
              <Plus className="h-4 w-4" />{t("taskList.newTask")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters bar */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              {/* Child filter */}
              {children.length > 1 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select value={childFilter} onValueChange={setChildFilter}>
                    <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("taskList.allChildren")}</SelectItem>
                      {children.map((child) => (
                        <SelectItem key={child.user_id} value={child.user_id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
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
            </div>
          )}

          {/* Task list */}
          {isLoading ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("taskList.noTasks")}</p>
              <p className="text-xs">{t("taskList.noTasksHint")}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("taskList.noFilterResults")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
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
                      {childNameMap[task.assigned_to_user_id] && (
                        <p className="text-xs text-primary/70 font-medium">{childNameMap[task.assigned_to_user_id]}</p>
                      )}
                      {tmpl?.description && <p className="text-xs text-muted-foreground truncate">{tmpl.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">{tmpl?.is_obligatory ? t("createTask.obligatoryBadge") : `${tmpl?.points_reward} ${t("common.pts")}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {evidence.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewPhoto(evidence[0].storage_key)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === "awaiting_validation" && !isReadOnly && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" onClick={() => handleValidate(task.id, true)}>
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleValidate(task.id, false)}>
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      {task.status === "pending" && !isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleMarkNotDone(task.id)}
                          title={t("taskList.notDone")}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      )}
                      {["validated", "rejected", "awaiting_validation", "done", "late", "skipped", "not_done"].includes(task.status) && !isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleReset(task.id)}
                          title={t("taskList.resetTask")}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
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
          <DialogHeader><DialogTitle>{t("taskList.photoProof")}</DialogTitle></DialogHeader>
          {previewPhoto && <img src={previewPhoto} alt={t("taskList.photoProof")} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
