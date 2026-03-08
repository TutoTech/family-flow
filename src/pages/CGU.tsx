import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CGU = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-3xl font-extrabold font-display text-foreground mb-2">{t("legal.cguTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : [JJ/MM/AAAA]</p>

        <div className="space-y-8 text-foreground font-body leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 1 – Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les conditions d'accès et d'utilisation de la plateforme Stop Repeat, accessible à l'adresse [URL], éditée par [Nom de la société].</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 2 – Définitions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Plateforme</strong> : le site web et l'application Stop Repeat.</li>
              <li><strong>Utilisateur</strong> : toute personne qui accède à la Plateforme.</li>
              <li><strong>Parent</strong> : utilisateur majeur créant ou gérant un foyer familial.</li>
              <li><strong>Enfant</strong> : utilisateur mineur rattaché à un foyer, sous la responsabilité d'un Parent.</li>
              <li><strong>Foyer</strong> : espace familial regroupant un ou plusieurs Parents et Enfants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 3 – Acceptation des CGU</h2>
            <p>L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la Plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 4 – Inscription et comptes</h2>
            <p>L'inscription est ouverte aux personnes majeures. Le Parent est responsable de la création des comptes Enfants rattachés à son foyer. Chaque utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 5 – Description du service</h2>
            <p>Stop Repeat propose les fonctionnalités suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Création et gestion de tâches récurrentes avec rappels automatiques</li>
              <li>Système de points et de récompenses échangeables</li>
              <li>Suivi de la progression par séries (streaks) et statistiques</li>
              <li>Règles de la maison avec pénalités configurables</li>
              <li>Validation de tâches par preuve photo</li>
              <li>Notifications push et rappels automatisés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 6 – Responsabilités de l'utilisateur</h2>
            <p>L'utilisateur s'engage à utiliser la Plateforme conformément à sa destination. Il est interdit de :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utiliser la Plateforme à des fins illicites</li>
              <li>Tenter de compromettre la sécurité ou l'intégrité de la Plateforme</li>
              <li>Publier du contenu inapproprié via les photos de preuve</li>
              <li>Créer de faux comptes ou usurper l'identité d'un tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 7 – Protection des mineurs</h2>
            <p>La Plateforme est conçue pour être utilisée dans un cadre familial sous la supervision d'un Parent. Le Parent est responsable de l'utilisation de la Plateforme par ses Enfants et garantit avoir l'autorité parentale nécessaire. Conformément au RGPD, le consentement du Parent est requis pour le traitement des données des Enfants de moins de 15 ans (16 ans au niveau européen sauf dérogation nationale).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 8 – Données personnelles</h2>
            <p>Les données personnelles sont traitées conformément à notre politique de confidentialité et au RGPD. Les données collectées incluent : nom, prénom, email, données d'usage, photos de preuve. Les photos de preuve sont conservées pendant la durée configurée par le Parent dans les paramètres du foyer, puis supprimées automatiquement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 9 – Propriété intellectuelle</h2>
            <p>L'ensemble des éléments de la Plateforme (code, design, contenus, marques) sont la propriété exclusive de [Nom de la société]. Toute reproduction non autorisée constitue une contrefaçon.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 10 – Limitation de responsabilité</h2>
            <p>[Nom de la société] ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la Plateforme, notamment en cas d'interruption de service, de perte de données ou d'utilisation frauduleuse par un tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 11 – Modification des CGU</h2>
            <p>[Nom de la société] se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation vaut acceptation des CGU modifiées.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 12 – Résiliation</h2>
            <p>L'utilisateur peut supprimer son compte à tout moment. [Nom de la société] se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 13 – Droit applicable et juridiction</h2>
            <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de [Ville].</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">Article 14 – Contact</h2>
            <p>Pour toute question relative aux présentes CGU : [contact@stoprepeat.fr]</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGU;
