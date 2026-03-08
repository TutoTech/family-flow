import { useTranslation } from "react-i18next";
import { CheckCircle, Bell, Camera, Trophy, Shield, Star } from "lucide-react";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: CheckCircle, titleKey: "features.smartTasks", descKey: "features.smartTasksDesc" },
    { icon: Bell, titleKey: "features.autoReminders", descKey: "features.autoRemindersDesc" },
    { icon: Camera, titleKey: "features.photoProof", descKey: "features.photoProofDesc" },
    { icon: Trophy, titleKey: "features.rewards", descKey: "features.rewardsDesc" },
    { icon: Shield, titleKey: "features.rulesTitle", descKey: "features.rulesDesc" },
    { icon: Star, titleKey: "features.streaks", descKey: "features.streaksDesc" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-body font-semibold text-sm mb-4">{t("features.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">{t("features.title")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">{t("features.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={feature.titleKey} className="group gradient-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-2">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;