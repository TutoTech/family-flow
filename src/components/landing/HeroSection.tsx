import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-6">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground font-body font-semibold text-sm animate-fade-up">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-foreground leading-tight animate-fade-up" style={{ animationDelay: "100ms" }}>
              {t("hero.titleStart")}{" "}
              <span className="bg-clip-text text-transparent gradient-hero">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "200ms" }}>
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl" asChild>
                <Link to="/signup">
                  {t("hero.cta")}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="text-base px-8 py-6 rounded-xl" asChild>
                <a href="#comment-ca-marche">
                  {t("hero.demo")}
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-body animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                {t("hero.freeToStart")}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                {t("hero.noCard")}
              </div>
            </div>
          </div>
          <div className="relative animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img src={heroImage} alt={t("hero.heroAlt")} className="w-full h-auto" loading="eager" />
            </div>
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-card p-3 animate-float border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                  <span className="text-success text-lg">✓</span>
                </div>
                <div>
                  <p className="text-xs font-semibold font-display text-foreground">{t("hero.tasksCompleted", { count: 12 })}</p>
                  <p className="text-xs text-muted-foreground">{t("hero.completed")}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card p-3 animate-float border border-border/50" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/30 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <p className="text-xs font-semibold font-display text-foreground">{t("hero.streak", { count: 7 })}</p>
                  <p className="text-xs text-muted-foreground">{t("hero.recordBroken")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;