/**
 * Formulaire de réinitialisation du mot de passe.
 * Accessible via le lien envoyé par email (contient un token de type "recovery").
 * Vérifie la présence du token dans l'URL avant d'afficher le formulaire.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  // Vérifie que l'URL contient un hash de type "recovery"
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  /** Met à jour le mot de passe via l'API d'authentification */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("common.error"), description: t("auth.passwordMismatch"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: t("auth.success"), description: t("auth.passwordUpdated") });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Message d'erreur si le lien est invalide ou expiré
  if (!isRecovery) {
    return (
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground">{t("auth.invalidLink")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("auth.invalidLinkDesc")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-elevated border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">{t("auth.resetTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("auth.resetSubtitle")}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required minLength={6} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
            {isLoading ? t("auth.updating") : t("auth.updatePassword")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
