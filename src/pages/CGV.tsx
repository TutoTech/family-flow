import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CGV = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-3xl font-extrabold font-display text-foreground mb-2">{t("legal.cgvTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : [JJ/MM/AAAA]</p>

        <div className="space-y-8 text-foreground font-body leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 1 – Objet</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre [Nom de la société], éditeur de la plateforme Stop Repeat, et tout utilisateur souscrivant à une offre payante.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 2 – Offres et tarifs</h2>
            <p>Stop Repeat propose les offres suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Offre Gratuite</strong> : accès aux fonctionnalités de base (création de foyer, tâches, récompenses) avec des limites sur le nombre de tâches récurrentes et d'enfants.</li>
              <li><strong>Offre Premium</strong> : [Prix] € / mois ou [Prix] € / an — tâches illimitées, enfants illimités, preuves photo, statistiques avancées, notifications push, support prioritaire.</li>
              <li><strong>Offre Famille</strong> : [Prix] € / mois ou [Prix] € / an — toutes les fonctionnalités Premium + [fonctionnalités supplémentaires à définir].</li>
            </ul>
            <p className="mt-2">Les prix sont indiqués en euros TTC. [Nom de la société] se réserve le droit de modifier ses tarifs à tout moment. Les modifications tarifaires prendront effet à la prochaine période de renouvellement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 3 – Souscription</h2>
            <p>La souscription à une offre payante s'effectue en ligne via la Plateforme. L'utilisateur choisit son offre, renseigne ses informations de paiement et valide sa commande. La souscription est effective dès confirmation du paiement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 4 – Paiement</h2>
            <p>Le paiement s'effectue par carte bancaire via un prestataire de paiement sécurisé [Stripe / autre]. Les données bancaires ne sont pas stockées par [Nom de la société]. L'abonnement est reconduit tacitement à chaque échéance sauf résiliation préalable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 5 – Droit de rétractation</h2>
            <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de contenu numérique non fourni sur support matériel dont l'exécution a commencé avec l'accord du consommateur. Toutefois, [Nom de la société] offre une garantie « satisfait ou remboursé » de [14] jours à compter de la souscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 6 – Résiliation</h2>
            <p>L'utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. La résiliation prend effet à la fin de la période en cours. Aucun remboursement prorata temporis n'est effectué sauf dans le cadre de la garantie mentionnée à l'article 5.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 7 – Accès au service</h2>
            <p>[Nom de la société] s'engage à fournir un accès au service 24h/24 et 7j/7, sous réserve des opérations de maintenance. En cas d'interruption prolongée non planifiée, [Nom de la société] s'engage à informer les utilisateurs et à prolonger la durée d'abonnement d'une période équivalente.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 8 – Responsabilité</h2>
            <p>La responsabilité de [Nom de la société] est limitée au montant des sommes effectivement versées par l'utilisateur au cours des 12 derniers mois. [Nom de la société] ne saurait être tenue responsable des dommages indirects.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 9 – Protection des données</h2>
            <p>Les données personnelles collectées dans le cadre de la souscription sont traitées conformément au RGPD et à notre politique de confidentialité. Les données de paiement sont traitées par notre prestataire de paiement et ne sont pas accessibles à [Nom de la société].</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 10 – Médiation</h2>
            <p>En cas de litige, l'utilisateur peut recourir gratuitement au service de médiation proposé par [Nom de la société]. Le médiateur de la consommation compétent est : [Nom et coordonnées du médiateur]. L'utilisateur peut également utiliser la plateforme de résolution des litiges en ligne de la Commission européenne : https://ec.europa.eu/consumers/odr.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 11 – Droit applicable</h2>
            <p>Les présentes CGV sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de [Ville], sous réserve des dispositions impératives du Code de la consommation en faveur du consommateur.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 12 – Contact</h2>
            <p>Pour toute question relative aux présentes CGV : [contact@stoprepeat.fr]</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGV;
