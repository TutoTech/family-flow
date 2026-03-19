/**
 * Formulaire de connexion.
 * - Mode parent : email + mot de passe (inchangé) + Google OAuth
 * - Mode enfant : prénom + code famille + mot de passe
 *   → résolution de l'email synthétique via RPC get_child_login_email
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, User, Hash, Users, Baby } from "lucide-react";

type LoginMode = "parent" | "child";

export default function LoginForm() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<LoginMode>("parent");

  // Champs mode parent
  const [email, setEmail] = useState("");

  // Champs mode enfant
  const [childName, setChildName] = useState("");
  const [familyCode, setFamilyCode] = useState("");

  // Commun
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  /** Connexion parent (email + mot de passe) */
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t("auth.loginError"),
        description: error.message === "Invalid login credentials" ? t("auth.invalidCredentials") : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** Connexion enfant (prénom + code famille + mot de passe) */
  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Résolution de l'email synthétique via la fonction SQL SECURITY DEFINER
      const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
        "get_child_login_email",
        { _child_name: childName.trim(), _invite_code: familyCode.trim() }
      );

      if (rpcError) throw rpcError;

      if (!resolvedEmail) {
        toast({
          title: t("auth.loginError"),
          description: t("auth.childNotFound"),
          variant: "destructive",
        });
        return;
      }

      await signIn(resolvedEmail, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t("auth.loginError"),
        description: error.message === "Invalid login credentials" ? t("auth.invalidCredentials") : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elevated border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">{t("auth.loginTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("auth.loginSubtitle")}</CardDescription>
      </CardHeader>

      <form onSubmit={mode === "parent" ? handleParentSubmit : handleChildSubmit}>
        <CardContent className="space-y-4">
          {/* Toggle parent / enfant */}
          <div className="space-y-2">
            <Label>{t("auth.iAm")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("parent")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${mode === "parent" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                <Users className="h-5 w-5" /><span className="font-semibold">{t("common.parent")}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("child")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${mode === "child" ? "border-secondary bg-secondary/10 text-secondary" : "border-border text-muted-foreground hover:border-secondary/40"}`}
              >
                <Baby className="h-5 w-5" /><span className="font-semibold">{t("common.child")}</span>
              </button>
            </div>
          </div>

          {mode === "parent" ? (
            /* ── Champ email (parent) ── */
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          ) : (
            /* ── Champs prénom + code famille (enfant) ── */
            <>
              <div className="space-y-2">
                <Label htmlFor="child-name">{t("auth.firstName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="child-name"
                    type="text"
                    placeholder={t("auth.childNamePlaceholder")}
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-code">{t("auth.childFamilyCode")}</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="family-code"
                    type="text"
                    placeholder={t("auth.childFamilyCodePlaceholder")}
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                    className="pl-10 font-mono tracking-wider"
                    required
                    maxLength={20}
                  />
                </div>
              </div>
            </>
          )}

          {/* Champ mot de passe (commun) */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Lien mot de passe oublié (parent uniquement) */}
          {mode === "parent" && (
            <Link to="/forgot-password" className="text-sm text-primary hover:underline inline-block">
              {t("auth.forgotPassword")}
            </Link>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
          </Button>

          {/* Google OAuth uniquement pour les parents */}
          {mode === "parent" && (
            <>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{t("common.or")}</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                if (error) toast({ title: t("common.error"), description: String(error), variant: "destructive" });
              }}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t("auth.continueGoogle")}
              </Button>
            </>
          )}

          <p className="text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}<Link to="/signup" className="text-primary font-semibold hover:underline">{t("nav.signup")}</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
