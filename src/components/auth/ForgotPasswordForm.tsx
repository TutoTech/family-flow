/**
 * Formulaire "Mot de passe oublié".
 * Envoie un email de réinitialisation via l'API d'authentification.
 * Affiche un message de confirmation une fois l'email envoyé.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  /** Envoie l'email de réinitialisation */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast({ title: t("auth.emailSent"), description: t("auth.checkEmail") });
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Écran de confirmation après envoi
  if (sent) {
    return (
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">{t("auth.emailSentTitle")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth.emailSentDesc")} <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link to="/login" className="text-primary font-semibold hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("auth.backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-elevated border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">{t("auth.forgotTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("auth.forgotSubtitle")}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("auth.sending") : t("auth.sendLink")}
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("auth.backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
