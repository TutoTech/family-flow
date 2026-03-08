import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-display">
            {t("pricing.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-1">{t("pricing.free.name")}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-foreground">0€</span>
              <span className="text-muted-foreground text-sm">{t("pricing.free.period")}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">{t("pricing.free.description")}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {(t("pricing.free.features", { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/signup">{t("pricing.free.cta")}</Link>
            </Button>
          </div>

          {/* Family Plan */}
          <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative overflow-hidden shadow-lg">
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" />
              {t("pricing.family.badge")}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{t("pricing.family.name")}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-primary">10€</span>
              <span className="text-muted-foreground text-sm">{t("pricing.family.period")}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">{t("pricing.family.description")}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {(t("pricing.family.features", { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="w-full" asChild>
              <Link to="/signup">{t("pricing.family.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
