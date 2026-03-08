import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MentionsLegales = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-3xl font-extrabold font-display text-foreground mb-8">{t("legal.mentionsTitle")}</h1>

        <div className="space-y-8 text-foreground font-body leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.editor")}</h2>
            <p>[Nom de la société ou de l'éditeur]</p>
            <p>Forme juridique : [SAS / SARL / Auto-entrepreneur / …]</p>
            <p>Capital social : [Montant] €</p>
            <p>Siège social : [Adresse complète]</p>
            <p>RCS : [Ville] [Numéro]</p>
            <p>SIRET : [Numéro SIRET]</p>
            <p>TVA intracommunautaire : [Numéro]</p>
            <p>Directeur de la publication : [Nom du responsable]</p>
            <p>Email : [contact@stoprepeat.fr]</p>
            <p>Téléphone : [+33 X XX XX XX XX]</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.hosting")}</h2>
            <p>Hébergeur : [Nom de l'hébergeur]</p>
            <p>Adresse : [Adresse de l'hébergeur]</p>
            <p>Téléphone : [Téléphone de l'hébergeur]</p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.intellectualProperty")}</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de [Nom de la société].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.personalData")}</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
            </p>
            <p>
              Les données personnelles collectées sur ce site sont traitées par [Nom de la société] en qualité de responsable de traitement. Elles sont nécessaires au fonctionnement du service et ne sont pas transmises à des tiers sans votre consentement, sauf obligation légale.
            </p>
            <p>
              Pour exercer vos droits, contactez-nous à : [dpo@stoprepeat.fr]
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.cookies")}</h2>
            <p>
              Ce site utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de langue). Aucun cookie publicitaire ou de suivi n'est utilisé. Conformément à la directive ePrivacy, ces cookies ne nécessitent pas de consentement préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.liability")}</h2>
            <p>
              [Nom de la société] s'efforce de fournir des informations aussi exactes que possible. Toutefois, elle ne pourra être tenue responsable des omissions, inexactitudes ou carences dans la mise à jour. L'utilisateur est seul responsable de l'utilisation qu'il fait des informations et contenus du site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-3">{t("legal.applicableLaw")}</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
