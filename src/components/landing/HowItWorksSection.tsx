import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Créez votre foyer",
      description: "Inscrivez-vous, ajoutez vos enfants et configurez les profils en quelques minutes.",
      emoji: "🏠",
    },
    {
      step: "02",
      title: "Définissez les tâches",
      description: "Créez les tâches récurrentes, fixez les horaires et les récompenses associées.",
      emoji: "📝",
    },
    {
      step: "03",
      title: "Laissez l'app travailler",
      description: "Les rappels, validations et récompenses sont automatisés. Vous n'avez plus rien à répéter.",
      emoji: "🚀",
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-24 px-6 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-body font-semibold text-sm mb-4">
            Simple comme bonjour
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Trois étapes pour en finir avec les rappels à répétition.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card shadow-card border border-border/50 text-4xl mb-6">
                {step.emoji}
              </div>
              <div className="text-xs font-bold font-display text-primary mb-2 tracking-widest uppercase">
                Étape {step.step}
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl">
            Créer mon foyer
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
