import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
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
import { ChevronDown, Shield, User, Users } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSwitch?: () => void;
}

export default function AccountSwitcher({ onSwitch }: Props) {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const { data: members = [] } = useFamilyMembers();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);

  const currentMember = members.find((m) => m.user_id === user?.id);
  const otherMembers = members.filter((m) => m.user_id !== user?.id);

  if (!profile?.family_id || members.length <= 1) {
    return null;
  }

  const handleMemberClick = (member: FamilyMember) => {
    if (member.user_id === user?.id) return;

    // If switching to a parent account, require PIN
    if (member.role === "parent") {
      if (!member.has_pin) {
        toast.error(t("accountSwitcher.noPinSet"));
        return;
      }
      setSelectedMember(member);
      setPin("");
      setPinDialogOpen(true);
    } else {
      // Switching to child - no PIN needed (parents can always access)
      performSwitch(member);
    }
  };

  const verifyPin = async () => {
    if (!selectedMember || pin.length !== 4) return;

    setVerifying(true);
    try {
      // Hash the entered PIN and compare with stored hash
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Get the stored hash
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("pin_code_hash")
        .eq("user_id", selectedMember.user_id)
        .single();

      if (error) throw error;

      if (profileData.pin_code_hash === hashHex) {
        setPinDialogOpen(false);
        performSwitch(selectedMember);
      } else {
        toast.error(t("accountSwitcher.wrongPin"));
        setPin("");
      }
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setVerifying(false);
    }
  };

  const performSwitch = async (member: FamilyMember) => {
    // Store the impersonated profile in sessionStorage
    sessionStorage.setItem("activeProfileId", member.user_id);
    toast.success(t("accountSwitcher.switched", { name: member.name }));
    onSwitch?.();
    // Reload to apply the switch
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentMember?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {currentMember ? getInitials(currentMember.name) : <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">
              {currentMember?.name ?? profile?.name}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("accountSwitcher.title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {members.map((member) => (
            <DropdownMenuItem
              key={member.user_id}
              onClick={() => handleMemberClick(member)}
              className={`flex items-center gap-3 cursor-pointer ${
                member.user_id === user?.id ? "bg-muted" : ""
              }`}
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
                <p className="text-xs text-muted-foreground">
                  {t(`common.${member.role}`)}
                </p>
              </div>
              {member.role === "parent" && member.user_id !== user?.id && (
                <Shield className="h-4 w-4 text-muted-foreground" />
              )}
              {member.user_id === user?.id && (
                <span className="text-xs text-primary font-medium">✓</span>
              )}
            </DropdownMenuItem>
          ))}
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
