import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      q: "faq.q1",
      defaultQ: "À partir de quel âge mes enfants peuvent-ils utiliser Stop Repeat ?",
      a: "faq.a1",
      defaultA: "L'application est conçue pour être utilisable dès l'âge de 6 ans. L'interface enfant est très visuelle, avec des icônes et des couleurs qui ne nécessitent pas de savoir parfaitement lire."
    },
    {
      q: "faq.q2",
      defaultQ: "Est-ce que je peux personnaliser les règles et les récompenses ?",
      a: "faq.a2",
      defaultA: "Absolument ! Chaque famille est unique. Vous pouvez créer vos propres tâches, définir le nombre de points qu'elles rapportent, et imaginer les récompenses qui motiveront vos enfants."
    },
    {
      q: "faq.q3",
      defaultQ: "Comment fonctionne le système de points ?",
      a: "faq.a3",
      defaultA: "Les enfants gagnent des points en complétant leurs tâches quotidiennes. Ils peuvent ensuite dépenser ces points dans la boutique de récompenses de la famille pour obtenir ce que vous avez configuré (temps d'écran, argent de poche, sortie, etc.)."
    },
    {
      q: "faq.q4",
      defaultQ: "L'application est-elle sécurisée ?",
      a: "faq.a4",
      defaultA: "Oui, la sécurité et la confidentialité sont nos priorités. Les enfants se connectent via un code PIN sur un espace restreint qui leur est dédié, sans accès aux paramètres ou à internet. Seuls les parents ont le contrôle total du compte familial."
    }
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-body font-semibold text-sm mb-4">
            {t("faq.badge", "FAQ")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            {t("faq.title", "Questions fréquentes")}
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            {t("faq.subtitle", "Tout ce que vous devez savoir sur Stop Repeat.")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="mb-4 border border-border/50 rounded-lg px-4 bg-card shadow-sm data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="font-display font-semibold text-left hover:no-underline hover:text-primary">
                {t(faq.q, faq.defaultQ)}
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                {t(faq.a, faq.defaultA)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
