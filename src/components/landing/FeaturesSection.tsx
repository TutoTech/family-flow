import { CheckCircle, Bell, Camera, Trophy, Shield, Star } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Tâches intelligentes",
    description: "Créez des tâches récurrentes avec horaires, points et preuves photo. Tout est automatisé.",
  },
  {
    icon: Bell,
    title: "Rappels automatiques",
    description: "Notifications push et lecture vocale des consignes. Plus besoin de répéter.",
  },
  {
    icon: Camera,
    title: "Preuves photo",
    description: "L'enfant envoie une photo, le parent valide. Simple et efficace.",
  },
  {
    icon: Trophy,
    title: "Récompenses motivantes",
    description: "Points, boutique de récompenses et bonus de série pour encourager l'autonomie.",
  },
  {
    icon: Shield,
    title: "Règles & conséquences",
    description: "Catalogue de règles avec pénalités automatiques et seuils configurables.",
  },
  {
    icon: Star,
    title: "Suivi des séries",
    description: "Streaks, statistiques et progression visible pour motiver au quotidien.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-body font-semibold text-sm mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Tout ce qu'il faut pour une famille organisée
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Des outils pensés pour réduire votre charge mentale et favoriser l'autonomie de vos enfants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group gradient-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
