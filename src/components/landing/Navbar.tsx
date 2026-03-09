/**
 * Barre de navigation de la landing page.
 * Contient le logo, les liens d'ancrage vers les sections,
 * le sélecteur de langue, le thème et les boutons de connexion/inscription.
 * Menu hamburger sur mobile via Sheet.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Globe, Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/#fonctionnalites", label: t("nav.features") },
    { href: "/#comment-ca-marche", label: t("nav.howItWorks") },
    { href: "/#pricing", label: t("nav.pricing") },
    { href: "/#temoignages", label: t("nav.testimonials") },
    { href: "/#faq", label: t("nav.faq") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src={logo} alt="Stop Repeat" className="w-8 h-8" />
          <span className="text-lg sm:text-xl font-bold font-display text-foreground">Stop Repeat</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-body text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("settings.language")} className="h-9 w-9">
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

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <Link to="/dashboard" className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-2 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300 whitespace-nowrap">
                {t("nav.dashboard", "Mon tableau de bord")}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium font-body text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.login")}
                </Link>
                <Link to="/signup" className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-2 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300 whitespace-nowrap">
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={logo} alt="Stop Repeat" className="w-6 h-6" />
                  Stop Repeat
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium font-body text-foreground hover:text-primary transition-colors py-2 border-b border-border/30"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  {session ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-3 rounded-lg shadow-soft text-center"
                    >
                      {t("nav.dashboard", "Mon tableau de bord")}
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium font-body text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                      >
                        {t("nav.login")}
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setOpen(false)}
                        className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-3 rounded-lg shadow-soft text-center"
                      >
                        {t("nav.signup")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
