import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Stop Repeat" className="w-8 h-8" />
          <span className="text-xl font-bold font-display text-foreground">Stop Repeat</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-body text-sm font-medium text-muted-foreground">
          <a href="#fonctionnalites" className="hover:text-foreground transition-colors">{t("nav.features")}</a>
          <a href="#comment-ca-marche" className="hover:text-foreground transition-colors">{t("nav.howItWorks")}</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">{t("nav.pricing")}</a>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("settings.language")}>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => i18n.changeLanguage("fr")} className={i18n.language === "fr" ? "font-bold" : ""}>
                🇫🇷 Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage("en")} className={i18n.language === "en" ? "font-bold" : ""}>
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          {session ? (
            <Link to="/dashboard" className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-2 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300">
              {t("nav.dashboard", "Mon tableau de bord")}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium font-body text-muted-foreground hover:text-foreground transition-colors hidden sm:block">{t("nav.login")}</Link>
              <Link to="/signup" className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-2 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300">{t("nav.signup")}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
