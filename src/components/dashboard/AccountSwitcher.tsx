import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useFamilyMembers, FamilyMember } from "@/hooks/useFamilyMembers";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ChevronDown, Shield, User, Users, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import AvatarEditorDialog from "./AvatarEditorDialog";

function MemberAvatar({ avatarUrl, name, className = "h-8 w-8", textClass = "text-xs", roleClass = "" }: {
  avatarUrl: string | null;
  name: string;
  className?: string;
  textClass?: string;
  roleClass?: string;
}) {
  const isEmoji = avatarUrl && !avatarUrl.startsWith("http");
  const getInitials = (n: string) => n.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  return (
    <Avatar className={className}>
      {isEmoji ? (
        <AvatarFallback className={`${textClass} bg-primary/10`}>{avatarUrl}</AvatarFallback>
      ) : (
        <>
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className={`${textClass} ${roleClass || "bg-primary/10 text-primary"}`}>
            {getInitials(name)}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
}

export default function AccountSwitcher() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { activeProfile, isImpersonating, switchTo, switchBack } = useProfileSwitch();
  const { data: members = [] } = useFamilyMembers();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);

  if (!profile?.family_id || members.length <= 1) {
    // Still show "switch back" if impersonating
    if (isImpersonating) {
      return (
        <Button variant="ghost" size="sm" className="gap-2 px-2" onClick={switchBack}>
          <ArrowLeft className="h-3 w-3" />
          <span className="text-xs">{t("common.back")}</span>
        </Button>
      );
    }
    return null;
  }

  const handleMemberClick = (member: FamilyMember) => {
    if (member.user_id === activeProfile?.userId) return;

    // If switching back to self (the authenticated user)
    if (member.user_id === user?.id) {
      // If returning to parent, require PIN
      if (member.role === "parent" && isImpersonating) {
        if (!member.has_pin) {
          // No PIN = allow (shouldn't happen but fallback)
          switchBack();
          toast.success(t("accountSwitcher.switched", { name: member.name }));
          return;
        }
        setSelectedMember(member);
        setPin("");
        setPinDialogOpen(true);
        return;
      }
      switchBack();
      toast.success(t("accountSwitcher.switched", { name: member.name }));
      return;
    }

    // Switching to a parent account always requires PIN
    if (member.role === "parent") {
      if (!member.has_pin) {
        toast.error(t("accountSwitcher.noPinSet"));
        return;
      }
      setSelectedMember(member);
      setPin("");
      setPinDialogOpen(true);
    } else {
      // Switching to child — no PIN needed
      switchTo({
        userId: member.user_id,
        name: member.name,
        role: member.role,
        avatarUrl: member.avatar_url,
      });
      toast.success(t("accountSwitcher.switched", { name: member.name }));
    }
  };

  const verifyPin = async () => {
    if (!selectedMember || pin.length !== 4) return;

    setVerifying(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("pin_code_hash")
        .eq("user_id", selectedMember.user_id)
        .single();

      if (error) throw error;

      if (profileData.pin_code_hash === hashHex) {
        setPinDialogOpen(false);
        if (selectedMember.user_id === user?.id) {
          switchBack();
        } else {
          switchTo({
            userId: selectedMember.user_id,
            name: selectedMember.name,
            role: selectedMember.role,
            avatarUrl: selectedMember.avatar_url,
          });
        }
        toast.success(t("accountSwitcher.switched", { name: selectedMember.name }));
      } else {
        toast.error(t("accountSwitcher.wrongPin"));
        setPin("");
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setVerifying(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const displayProfile = activeProfile;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={displayProfile?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {displayProfile ? getInitials(displayProfile.name) : <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">
              {displayProfile?.name}
            </span>
            {isImpersonating && (
              <span className="text-[10px] text-muted-foreground">(👀)</span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("accountSwitcher.title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {members.map((member) => {
            const isActive = member.user_id === activeProfile?.userId;
            return (
              <DropdownMenuItem
                key={member.user_id}
                onClick={() => handleMemberClick(member)}
                className={`flex items-center gap-3 cursor-pointer ${isActive ? "bg-muted" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url ?? undefined} />
                  <AvatarFallback className={`text-xs ${
                    member.role === "parent" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                  }`}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{t(`common.${member.role}`)}</p>
                </div>
                {member.role === "parent" && !isActive && (
                  <Shield className="h-4 w-4 text-muted-foreground" />
                )}
                {isActive && (
                  <span className="text-xs text-primary font-medium">✓</span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("accountSwitcher.pinRequired")}
            </DialogTitle>
            <DialogDescription>
              {t("accountSwitcher.enterPin", { name: selectedMember?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedMember?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {selectedMember ? getInitials(selectedMember.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              onComplete={verifyPin}
              disabled={verifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              onClick={verifyPin}
              disabled={pin.length !== 4 || verifying}
              className="w-full"
            >
              {verifying ? t("common.loading") : t("accountSwitcher.unlock")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
