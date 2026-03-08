import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export default function CreateFamilyDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ name: name.trim() })
        .select("id")
        .single();

      if (familyError) throw familyError;

      // Link user to family
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ family_id: family.id })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({ title: "Foyer créé !", description: `"${name}" est prêt. Partagez le code d'invitation.` });
      setName("");
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un foyer</DialogTitle>
          <DialogDescription>
            Donnez un nom à votre foyer familial. Vous pourrez ensuite inviter des membres.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="family-name">Nom du foyer</Label>
            <Input
              id="family-name"
              placeholder="Ex: Famille Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleCreate} disabled={!name.trim() || loading}>
            {loading ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
