import { useState } from "react";
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

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Tous les jours" },
  { value: "weekdays", label: "Jours de semaine" },
  { value: "weekends", label: "Week-ends" },
  { value: "weekly", label: "Hebdomadaire" },
] as const;

export default function CreateTaskDialog({ open, onOpenChange }: Props) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: children = [] } = useFamilyChildren();

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

      // Generate today's instances immediately
      await supabase.rpc("generate_daily_task_instances", { _family_id: profile.family_id });

      toast({ title: "Tâche créée !", description: `"${title}" a été ajoutée.` });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });

      // Reset form
      setTitle("");
      setDescription("");
      setPoints("1");
      setDueTime("18:00");
      setRecurrence("daily");
      setAssignedTo("");
      setRequiresPhoto(false);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
          <DialogDescription>Créez une tâche récurrente pour un enfant.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre</Label>
            <Input id="task-title" placeholder="Ex: Ranger sa chambre" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description (optionnelle)</Label>
            <Input id="task-desc" placeholder="Détails de la tâche" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigné à</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.user_id} value={child.user_id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Récurrence</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-points">Points</Label>
              <Input id="task-points" type="number" min="1" max="100" value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-time">Heure limite</Label>
              <Input id="task-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Preuve photo requise</Label>
              <p className="text-xs text-muted-foreground">L'enfant devra joindre une photo</p>
            </div>
            <Switch checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleCreate} disabled={!title.trim() || !assignedTo || loading}>
            {loading ? "Création…" : "Créer la tâche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
