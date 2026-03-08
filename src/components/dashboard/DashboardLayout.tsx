/**
 * Layout principal du tableau de bord.
 * Contient la barre de navigation avec logo, sélecteur de compte,
 * thème, notifications, paramètres et déconnexion.
 */

import { ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import NotificationBell from "@/components/dashboard/NotificationBell";
import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Props {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: Props) {
  const { signOut, role } = useAuth();
  const navigate = useNavigate();

  /** Déconnexion et redirection vers la page d'accueil */
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Barre de navigation supérieure */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Stop Repeat" className="h-8 w-8" />
            <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-1">
            {/* Sélecteur de profil (impersonation parent → enfant) */}
            <AccountSwitcher />
            <ThemeToggle />
            <NotificationBell />
            {/* Bouton paramètres (parent uniquement) */}
            {role === "parent" && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {/* Contenu principal de la page */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
