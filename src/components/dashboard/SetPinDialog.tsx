import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  hasExistingPin?: boolean;
  onPinSet?: () => void;
}

export default function SetPinDialog({ hasExistingPin, onPinSet }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);

  const resetState = () => {
    setStep("enter");
    setPin("");
    setConfirmPin("");
  };

  const handlePinEntered = () => {
    if (pin.length === 4) {
      setStep("confirm");
    }
  };

  const handleConfirmPin = async () => {
    if (confirmPin !== pin) {
      toast.error(t("accountSwitcher.pinMismatch"));
      setConfirmPin("");
      return;
    }

    setSaving(true);
    try {
      // Hash the PIN
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const { error } = await supabase
        .from("profiles")
        .update({ pin_code_hash: hashHex })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success(t("accountSwitcher.pinSet"));
      setOpen(false);
      resetState();
      onPinSet?.();
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lock className="h-4 w-4" />
          {hasExistingPin ? t("accountSwitcher.changePin") : t("accountSwitcher.setPin")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {hasExistingPin ? t("accountSwitcher.changePin") : t("accountSwitcher.setPin")}
          </DialogTitle>
          <DialogDescription>
            {step === "enter"
              ? t("accountSwitcher.enterNewPin")
              : t("accountSwitcher.confirmNewPin")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {step === "enter" ? (
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              onComplete={handlePinEntered}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          ) : (
            <InputOTP
              maxLength={4}
              value={confirmPin}
              onChange={setConfirmPin}
              onComplete={handleConfirmPin}
              disabled={saving}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          )}
          {step === "enter" ? (
            <Button
              onClick={handlePinEntered}
              disabled={pin.length !== 4}
              className="w-full"
            >
              {t("common.next")}
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => { setStep("enter"); setConfirmPin(""); }}
                className="flex-1"
              >
                {t("common.back")}
              </Button>
              <Button
                onClick={handleConfirmPin}
                disabled={confirmPin.length !== 4 || saving}
                className="flex-1"
              >
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
