/**
 * Layout principal du tableau de bord.
 * Contient la barre de navigation avec logo, sélecteur de compte,
 * thème, notifications, paramètres et déconnexion.
 */

import { ReactNode, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Settings, Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import NotificationBell from "@/components/dashboard/NotificationBell";
import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: Props) {
  const { signOut, role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /** Déconnexion et redirection vers la page d'accueil */
  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Barre de navigation supérieure */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <img src={logo} alt="Stop Repeat" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate max-w-[120px] sm:max-w-none" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h1>
          </Link>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-1">
            <AccountSwitcher />
            <ThemeToggle />
            <NotificationBell />
            {role === "parent" && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/dashboard")}>
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex sm:hidden items-center gap-1">
            <AccountSwitcher />
            <NotificationBell />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[260px] p-4">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start gap-2" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                    <Home className="h-4 w-4" />
                    Accueil
                  </Button>
                  {role === "parent" && (
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => { setOpen(false); navigate("/settings"); }}>
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Button>
                  )}
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-muted-foreground">Thème</span>
                    <ThemeToggle />
                  </div>
                  <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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