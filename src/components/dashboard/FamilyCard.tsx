import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy, Check, UserPlus, Home } from "lucide-react";
import CreateFamilyDialog from "./CreateFamilyDialog";
import JoinFamilyDialog from "./JoinFamilyDialog";

interface FamilyMember {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

export default function FamilyCard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { activeProfile } = useProfileSwitch();
  const { toast } = useToast();
  const [family, setFamily] = useState<{ id: string; name: string; invite_code: string } | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFamily = async () => {
    if (!profile?.family_id) {
      setFamily(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const [familyRes, membersRes] = await Promise.all([
      supabase.from("families").select("id, name, invite_code").eq("id", profile.family_id).single(),
      supabase.from("profiles").select("user_id, name, avatar_url").eq("family_id", profile.family_id),
    ]);

    if (familyRes.data) setFamily(familyRes.data);

    if (membersRes.data) {
      const memberIds = membersRes.data.map((m) => m.user_id);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", memberIds);
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) ?? []);

      setMembers(
        membersRes.data.map((m) => ({
          ...m,
          role: roleMap.get(m.user_id) ?? "parent",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFamily();
  }, [profile?.family_id]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const copyCode = async () => {
    if (!family) return;
    await navigator.clipboard.writeText(family.invite_code);
    setCopied(true);
    toast({ title: t("common.copied"), description: t("family.inviteCodeCopied") });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!profile?.family_id) {
    return (
      <>
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="py-8 text-center space-y-4">
            <Home className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {t("family.createOrJoinTitle")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t("family.createOrJoinDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Users className="h-4 w-4" />
                {t("family.createFamily")}
              </Button>
              <Button variant="outline" onClick={() => setJoinOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {t("family.joinWithCode")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <CreateFamilyDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleRefresh} />
        <JoinFamilyDialog open={joinOpen} onOpenChange={setJoinOpen} onJoined={handleRefresh} />
      </>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {family?.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <code className="bg-muted px-3 py-1 rounded-md text-sm font-mono tracking-wider">
            {family?.invite_code}
          </code>
          <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("family.memberCount", { count: members.length })}
          </p>
          <div className="grid gap-2">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground flex-1">{member.name}</span>
                <Badge variant={member.role === "parent" ? "default" : "secondary"} className="text-xs">
                  {member.role === "parent" ? t("common.parent") : t("common.child")}
                </Badge>
                {member.user_id === user?.id && (
                  <Badge variant="outline" className="text-xs">{t("common.you")}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
