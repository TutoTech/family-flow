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
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <img src={logo} alt="Stop Repeat" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Sélecteur de profil (impersonation parent → enfant) */}
            <AccountSwitcher />
            <ThemeToggle />
            <NotificationBell />
            {/* Bouton paramètres (parent uniquement) */}
            {role === "parent" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate("/dashboard")}>
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {/* Contenu principal de la page */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
