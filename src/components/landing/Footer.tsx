import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-muted/20 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Stop Repeat" className="w-6 h-6" />
            <span className="font-bold font-display text-foreground">Stop Repeat</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            © {new Date().getFullYear()} Stop Repeat. Conçu pour les familles.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
