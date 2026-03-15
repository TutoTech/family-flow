/**
 * Dialog permettant à un parent de réinitialiser le mot de passe d'un enfant.
 * Appelle l'Edge Function Supabase `reset-child-password` qui utilise
 * la clé Service Role pour effectuer la modification en toute sécurité.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childUserId: string;
  childName: string;
}

export default function ResetChildPasswordDialog({
  open,
  onOpenChange,
  childUserId,
  childName,
}: Props) {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = (v: boolean) => {
    if (!loading) {
      onOpenChange(v);
      if (!v) resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error(t("resetChildPassword.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("resetChildPassword.mismatch"));
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-child-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            child_user_id: childUserId,
            new_password: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("common.error"));
      }

      toast.success(t("resetChildPassword.success", { name: childName }));
      handleClose(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      toast.error(t("resetChildPassword.error"), { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {t("resetChildPassword.title")}
          </DialogTitle>
          <DialogDescription>
            {t("resetChildPassword.description", { name: childName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nouveau mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="new-child-password">
              {t("resetChildPassword.newPassword")}
            </Label>
            <div className="relative">
              <Input
                id="new-child-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                disabled={loading}
                data-testid="input-new-child-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("resetChildPassword.minLength")}
            </p>
          </div>

          {/* Confirmer le mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="confirm-child-password">
              {t("resetChildPassword.confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirm-child-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                disabled={loading}
                data-testid="input-confirm-child-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
              data-testid="button-cancel-reset"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || newPassword.length < 6 || confirmPassword.length < 6}
              data-testid="button-submit-reset"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t("resetChildPassword.submit")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
