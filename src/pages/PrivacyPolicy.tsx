import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-3xl font-extrabold font-display text-foreground mb-2">{t("legal.privacyTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : [JJ/MM/AAAA]</p>

        <div className="space-y-8 text-foreground font-body leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-display mb-3">1. Responsable du traitement</h2>
            <p>[Nom de la société], [forme juridique], au capital de [montant] €, immatriculée au RCS de [Ville] sous le numéro [numéro], dont le siège social est situé [adresse complète].</p>
            <p className="mt-2">Délégué à la protection des données (DPO) : [Nom du DPO]</p>
            <p>Contact : [dpo@stoprepeat.fr]</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de Stop Repeat, nous collectons les catégories de données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Données d'identification</strong> : nom, prénom, adresse email, mot de passe (chiffré).</li>
              <li><strong>Données de profil</strong> : rôle (parent/enfant), avatar, appartenance à un foyer familial.</li>
              <li><strong>Données d'usage</strong> : tâches créées, tâches complétées, points gagnés, récompenses échangées, pénalités appliquées, séries (streaks), statistiques de progression.</li>
              <li><strong>Photos de preuve</strong> : images téléchargées par les enfants pour valider l'accomplissement d'une tâche.</li>
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur, système d'exploitation, jetons de notification push.</li>
              <li><strong>Données de paiement</strong> : traitées exclusivement par notre prestataire de paiement [Stripe / autre] — nous ne stockons aucune donnée bancaire.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Fonctionnement du service : gestion des tâches, récompenses, pénalités et statistiques</li>
              <li>Envoi de notifications push et rappels automatisés</li>
              <li>Amélioration du service et analyse d'usage anonymisée</li>
              <li>Gestion de la relation client et support</li>
              <li>Respect de nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">4. Bases légales</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Exécution du contrat</strong> (art. 6.1.b RGPD) : pour la fourniture du service Stop Repeat.</li>
              <li><strong>Consentement</strong> (art. 6.1.a RGPD) : pour l'envoi de notifications push et le traitement des données des mineurs de moins de 15 ans.</li>
              <li><strong>Intérêt légitime</strong> (art. 6.1.f RGPD) : pour l'amélioration du service et la prévention de la fraude.</li>
              <li><strong>Obligation légale</strong> (art. 6.1.c RGPD) : pour la conservation des données de facturation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">5. Protection des données des mineurs</h2>
            <p>Stop Repeat est conçu pour être utilisé dans un cadre familial. Les comptes enfants sont créés et supervisés par un parent titulaire d'un compte.</p>
            <p className="mt-2">Conformément à l'article 8 du RGPD et à l'article 45 de la loi Informatique et Libertés, le consentement du titulaire de l'autorité parentale est requis pour le traitement des données personnelles des mineurs de moins de 15 ans.</p>
            <p className="mt-2">Les données des enfants sont traitées uniquement dans le cadre du fonctionnement du service et ne sont jamais utilisées à des fins publicitaires ou de profilage commercial.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">6. Destinataires des données</h2>
            <p>Vos données peuvent être communiquées aux destinataires suivants :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Membres du foyer</strong> : les parents ont accès aux données de progression de leurs enfants (tâches, points, photos de preuve).</li>
              <li><strong>Sous-traitants techniques</strong> : hébergement (Supabase / [hébergeur]), prestataire de paiement ([Stripe / autre]), service de notifications push.</li>
              <li><strong>Autorités compétentes</strong> : en cas d'obligation légale.</li>
            </ul>
            <p className="mt-2">Aucune donnée n'est vendue à des tiers. Aucune donnée n'est transférée à des fins publicitaires.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">7. Transferts hors UE</h2>
            <p>Certains de nos sous-traitants peuvent être situés en dehors de l'Union européenne. Dans ce cas, des garanties appropriées sont mises en place conformément au chapitre V du RGPD (clauses contractuelles types de la Commission européenne, ou décision d'adéquation).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">8. Durée de conservation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données de compte</strong> : conservées pendant toute la durée d'utilisation du service, puis supprimées dans un délai de 30 jours après la suppression du compte.</li>
              <li><strong>Photos de preuve</strong> : conservées pendant la durée configurée par le parent dans les paramètres du foyer (par défaut : [30] jours), puis supprimées automatiquement.</li>
              <li><strong>Données de facturation</strong> : conservées pendant 10 ans conformément aux obligations comptables françaises.</li>
              <li><strong>Données techniques (logs)</strong> : conservées pendant 12 mois maximum.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">9. Vos droits</h2>
            <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes.</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données.</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible par machine.</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données pour des motifs légitimes.</li>
              <li><strong>Droit à la limitation</strong> : demander la limitation du traitement dans certains cas.</li>
              <li><strong>Droit de retirer votre consentement</strong> : à tout moment, sans affecter la licéité du traitement antérieur.</li>
            </ul>
            <p className="mt-3">Pour exercer ces droits, contactez-nous à : <strong>[dpo@stoprepeat.fr]</strong></p>
            <p className="mt-2">Nous nous engageons à répondre dans un délai d'un mois. En cas de demande complexe, ce délai peut être prolongé de deux mois.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">10. Cookies</h2>
            <p>Stop Repeat utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Cookie de session</strong> : maintien de votre connexion.</li>
              <li><strong>Préférences de langue</strong> : mémorisation de votre choix de langue (français/anglais).</li>
              <li><strong>Préférence de thème</strong> : mémorisation de votre choix de thème (clair/sombre).</li>
            </ul>
            <p className="mt-2">Aucun cookie publicitaire, de suivi ou analytique n'est utilisé. Conformément à la directive ePrivacy, ces cookies exemptés ne nécessitent pas de consentement préalable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">11. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Chiffrement des mots de passe (hachage bcrypt)</li>
              <li>Communications chiffrées (HTTPS/TLS)</li>
              <li>Contrôle d'accès par rôles (Row Level Security)</li>
              <li>Authentification sécurisée avec tokens JWT</li>
              <li>Suppression automatique des photos de preuve selon la politique de rétention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">12. Réclamation</h2>
            <p>Si vous estimez que le traitement de vos données ne respecte pas la réglementation en vigueur, vous pouvez introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :</p>
            <p className="mt-2">CNIL — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
            <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">13. Modifications</h2>
            <p>La présente politique de confidentialité peut être modifiée à tout moment. En cas de modification substantielle, nous en informerons les utilisateurs par email ou notification dans l'application. La date de dernière mise à jour est indiquée en haut de cette page.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">14. Contact</h2>
            <p>Pour toute question relative à cette politique de confidentialité : <strong>[dpo@stoprepeat.fr]</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
