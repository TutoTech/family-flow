/**
 * Configuration de l'internationalisation (i18n).
 * Charge les traductions françaises et anglaises,
 * détecte la langue du navigateur et la persiste dans le localStorage.
 * La langue par défaut est le français.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./fr.json";
import en from "./en.json";

i18n
  .use(LanguageDetector) // Détection automatique de la langue
  .use(initReactI18next) // Intégration avec React
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr", // Langue de repli si la langue détectée n'est pas disponible
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement XSS
    },
    detection: {
      order: ["localStorage", "navigator"], // Priorité : localStorage puis navigateur
      caches: ["localStorage"],             // Persiste le choix dans le localStorage
    },
  });

export default i18n;
