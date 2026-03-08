import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyChildren } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTaskDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: children = [] } = useFamilyChildren();

  const RECURRENCE_OPTIONS = [
    { value: "daily", label: t("createTask.daily") },
    { value: "weekdays", label: t("createTask.weekdays") },
    { value: "weekends", label: t("createTask.weekends") },
    { value: "weekly", label: t("createTask.weekly") },
  ] as const;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("1");
  const [dueTime, setDueTime] = useState("18:00");
  const [recurrence, setRecurrence] = useState("daily");
  const [assignedTo, setAssignedTo] = useState("");
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !assignedTo || !user || !profile?.family_id) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("task_templates").insert({
        title: title.trim(),
        description: description.trim() || null,
        points_reward: parseInt(points) || 1,
        due_time: dueTime,
        recurrence_type: recurrence as any,
        assigned_to_user_id: assignedTo,
        family_id: profile.family_id,
        created_by_user_id: user.id,
        requires_photo: requiresPhoto,
      });

      if (error) throw error;

      await supabase.rpc("generate_daily_task_instances", { _family_id: profile.family_id });

      toast({ title: t("createTask.taskCreated"), description: t("createTask.taskCreatedDesc", { title }) });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });

      setTitle(""); setDescription(""); setPoints("1"); setDueTime("18:00");
      setRecurrence("daily"); setAssignedTo(""); setRequiresPhoto(false);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createTask.title")}</DialogTitle>
          <DialogDescription>{t("createTask.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">{t("createTask.taskTitle")}</Label>
            <Input id="task-title" placeholder={t("createTask.taskTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">{t("createTask.description")}</Label>
            <Input id="task-desc" placeholder={t("createTask.descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("createTask.assignedTo")}</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder={t("createTask.selectChild")} /></SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.user_id} value={child.user_id}>{child.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("createTask.recurrence")}</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-points">{t("createTask.pointsLabel")}</Label>
              <Input id="task-points" type="number" min="1" max="100" value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-time">{t("createTask.deadline")}</Label>
              <Input id="task-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>{t("createTask.photoRequired")}</Label>
              <p className="text-xs text-muted-foreground">{t("createTask.photoRequiredHint")}</p>
            </div>
            <Switch checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleCreate} disabled={!title.trim() || !assignedTo || loading}>
            {loading ? t("createTask.creating") : t("createTask.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
