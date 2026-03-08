import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Stop Repeat" className="w-8 h-8" />
          <span className="text-xl font-bold font-display text-foreground">
            Stop Repeat
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-body text-sm font-medium text-muted-foreground">
          <a href="#fonctionnalites" className="hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="#comment-ca-marche" className="hover:text-foreground transition-colors">
            Comment ça marche
          </a>
          <a href="#tarifs" className="hover:text-foreground transition-colors">
            Tarifs
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm font-medium font-body text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Se connecter
          </button>
          <button className="gradient-hero text-primary-foreground text-sm font-bold px-5 py-2 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300">
            S'inscrire
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
