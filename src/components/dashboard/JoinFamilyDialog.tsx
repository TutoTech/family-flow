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
  onJoined: () => void;
}

export default function JoinFamilyDialog({ open, onOpenChange, onJoined }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    try {
      // Find family by invite code
      const { data: family, error: findError } = await supabase
        .from("families")
        .select("id, name")
        .eq("invite_code", code.trim().toLowerCase())
        .single();

      if (findError || !family) {
        toast({ title: "Code invalide", description: "Aucun foyer trouvé avec ce code.", variant: "destructive" });
        return;
      }

      // Link user to family
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ family_id: family.id })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({ title: "Bienvenue !", description: `Vous avez rejoint "${family.name}".` });
      setCode("");
      onOpenChange(false);
      onJoined();
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
          <DialogTitle>Rejoindre un foyer</DialogTitle>
          <DialogDescription>
            Entrez le code d'invitation partagé par un parent du foyer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Code d'invitation</Label>
            <Input
              id="invite-code"
              placeholder="Ex: a1b2c3d4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="font-mono tracking-widest text-center text-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleJoin} disabled={!code.trim() || loading}>
            {loading ? "Recherche…" : "Rejoindre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
