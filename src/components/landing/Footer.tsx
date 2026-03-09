/**
 * Pied de page de la landing page.
 * Contient le logo, les liens vers les pages légales
 * (mentions légales, CGU, CGV, politique de confidentialité)
 * et le copyright.
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/50 bg-muted/20 py-8 sm:py-12 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Stop Repeat" className="w-6 h-6" />
            <span className="font-bold font-display text-foreground">Stop Repeat</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6 text-sm font-body">
            <Link to="/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.legalNotice")}
            </Link>
            <Link to="/cgu" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.cgu")}
            </Link>
            <Link to="/cgv" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.cgv")}
            </Link>
            <Link to="/confidentialite" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.privacy")}
            </Link>
            <a
              href="https://github.com/TutoTech/family-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              {t("footer.sourceCode")}
            </a>
          </nav>
          <p className="text-sm text-muted-foreground font-body">
            © {new Date().getFullYear()} Stop Repeat. {t("footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
