/**
 * Section "Comment ça marche" de la landing page.
 * Présente les 3 étapes pour démarrer avec l'application
 * sous forme de timeline visuelle.
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const { t } = useTranslation();
  const steps = [
    { step: "01", titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc", emoji: "🏠" },
    { step: "02", titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc", emoji: "📝" },
    { step: "03", titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc", emoji: "🚀" },
  ];

  return (
    <section id="comment-ca-marche" className="py-24 px-6 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-body font-semibold text-sm mb-4">{t("howItWorks.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">{t("howItWorks.title")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">{t("howItWorks.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < steps.length - 1 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card shadow-card border border-border/50 text-4xl mb-6">{step.emoji}</div>
              <div className="text-xs font-bold font-display text-primary mb-2 tracking-widest uppercase">{t("howItWorks.step", { number: step.step })}</div>
              <h3 className="text-xl font-bold font-display text-foreground mb-3">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl" asChild>
            <Link to="/signup">
              {t("howItWorks.cta")}
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
