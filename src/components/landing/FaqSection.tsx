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
    },
    {
      q: "faq.q5",
      defaultQ: "Puis-je gérer plusieurs enfants avec un seul compte ?",
      a: "faq.a5",
      defaultA: "Bien sûr ! Un compte famille peut inclure autant d'enfants que nécessaire. Chaque enfant aura son propre profil, ses propres tâches, et son propre suivi de points. C'est idéal pour coordonner toute la famille."
    },
    {
      q: "faq.q6",
      defaultQ: "L'application fonctionne-t-elle hors ligne ?",
      a: "faq.a6",
      defaultA: "Les tâches peuvent être marquées comme terminées même sans connexion internet. Les données seront automatiquement synchronisées dès que l'appareil se reconnecte. Cependant, certaines fonctionnalités comme la boutique de récompenses nécessitent une connexion."
    },
    {
      q: "faq.q7",
      defaultQ: "Avez-vous des conseils pour motiver mon enfant ?",
      a: "faq.a7",
      defaultA: "Commencez avec des tâches simples et des récompenses attrayantes. Célébrez les progrès même minimes. L'aspect visuel et ludique de l'application (badges, niveaux, statistiques) est conçu pour encourager l'engagement. Impliquez votre enfant dans le choix des récompenses pour plus de motivation."
    },
    {
      q: "faq.q8",
      defaultQ: "Les données de ma famille sont-elles sécurisées ?",
      a: "faq.a8",
      defaultA: "Absolument. Toutes les données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers. Vous pouvez également exporter ou supprimer vos données à tout moment depuis les paramètres du compte."
    },
    {
      q: "faq.q9",
      defaultQ: "Sur quels appareils puis-je utiliser Stop Repeat ?",
      a: "faq.a9",
      defaultA: "Stop Repeat fonctionne sur tous les appareils modernes : smartphones iOS et Android, tablettes, et ordinateurs via navigateur web. Vos données sont synchronisées automatiquement entre tous vos appareils."
    },
    {
      q: "faq.q10",
      defaultQ: "Que faire si mon enfant oublie son code PIN ?",
      a: "faq.a10",
      defaultA: "En tant que parent, vous pouvez réinitialiser le code PIN de n'importe quel enfant depuis l'interface parentale. Votre compte parent reste toujours le compte maître avec tous les droits d'administration."
    },
    {
      q: "faq.q11",
      defaultQ: "Quelle est la différence entre la version gratuite et Famille ?",
      a: "faq.a11",
      defaultA: "La version gratuite permet de gérer 1 enfant avec 1 parent et donne accès aux fonctionnalités de base (tâches, points, récompenses). La version Famille (10€ en achat unique) déverrouille la gestion d'enfants illimités et jusqu'à 2 parents, les objectifs d'épargne, le calendrier familial, les statistiques avancées, et les futures fonctionnalités."
    },
    {
      q: "faq.q12",
      defaultQ: "Comment fonctionnent les notifications ?",
      a: "faq.a12",
      defaultA: "Vous recevez des notifications pour les événements importants : tâches complétées, demandes de récompenses, rappels de tâches en retard, etc. Vous pouvez personnaliser vos préférences de notification dans les paramètres de l'application."
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
