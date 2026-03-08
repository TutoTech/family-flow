import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    try {
      const { data: family, error: findError } = await supabase
        .from("families")
        .select("*")
        .eq("invite_code", code.trim().toLowerCase())
        .single();

      if (findError || !family) {
        toast({ title: t("family.invalidCode"), description: t("family.invalidCodeDesc"), variant: "destructive" });
        return;
      }

      // Check member limits based on plan
      const familyPlan = (family as any).plan || "free";
      const maxParents = familyPlan === "family" ? 2 : 1;
      const maxChildren = familyPlan === "family" ? 99 : 1;

      // Count existing members by role
      const { data: members } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("family_id", family.id);

      if (members) {
        // Get roles for all members
        const userIds = members.map((m) => m.user_id);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        const parentCount = roles?.filter((r) => r.role === "parent").length || 0;
        const childCount = roles?.filter((r) => r.role === "child").length || 0;

        if (role === "parent" && parentCount >= maxParents) {
          toast({ title: t("payment.limitReached"), description: t("payment.limitReachedDesc"), variant: "destructive" });
          return;
        }
        if (role === "child" && childCount >= maxChildren) {
          toast({ title: t("payment.limitReached"), description: t("payment.limitReachedDesc"), variant: "destructive" });
          return;
        }
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ family_id: family.id })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({ title: t("family.welcomeJoined"), description: t("family.joinedDesc", { name: family.name }) });
      setCode("");
      onOpenChange(false);
      onJoined();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("family.joinTitle")}</DialogTitle>
          <DialogDescription>{t("family.joinDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">{t("family.inviteCode")}</Label>
            <Input
              id="invite-code"
              placeholder={t("family.inviteCodePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="font-mono tracking-widest text-center text-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleJoin} disabled={!code.trim() || loading}>
            {loading ? t("family.searching") : t("family.join")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
