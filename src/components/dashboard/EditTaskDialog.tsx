/**
 * Dialog de modification d'un modèle de tâche.
 * Permet de modifier le titre, la description, les points,
 * l'heure limite, la récurrence, l'assignation et la photo requise.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFamilyChildren } from "@/hooks/useTasks";
import { useTaskTemplates, TaskTemplate } from "@/hooks/useTaskTemplates";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TaskTemplate | null;
}

export default function EditTaskDialog({ open, onOpenChange, template }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: children = [] } = useFamilyChildren();
  const { updateTemplate } = useTaskTemplates();

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

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || "");
      setPoints(String(template.points_reward));
      setDueTime(template.due_time);
      setRecurrence(template.recurrence_type);
      setAssignedTo(template.assigned_to_user_id);
      setRequiresPhoto(template.requires_photo);
    }
  }, [template]);

  const handleSave = async () => {
    if (!template || !title.trim() || !assignedTo) return;
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: {
          title: title.trim(),
          description: description.trim() || null,
          points_reward: parseInt(points) || 1,
          due_time: dueTime,
          recurrence_type: recurrence as any,
          assigned_to_user_id: assignedTo,
          requires_photo: requiresPhoto,
        },
      });
      toast({ title: t("editTask.taskUpdated"), description: t("editTask.taskUpdatedDesc", { title }) });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editTask.title")}</DialogTitle>
          <DialogDescription>{t("editTask.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t("createTask.taskTitle")}</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">{t("createTask.description")}</Label>
            <Input id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
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
              <Label htmlFor="edit-points">{t("createTask.pointsLabel")}</Label>
              <Input id="edit-points" type="number" min="1" max="100" value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">{t("createTask.deadline")}</Label>
              <Input id="edit-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
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
          <Button onClick={handleSave} disabled={!title.trim() || !assignedTo || updateTemplate.isPending}>
            {updateTemplate.isPending ? t("common.saving") : t("editTask.saveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
