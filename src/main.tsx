/**
 * Point d'entrée de l'application React.
 * Monte le composant App dans le DOM et charge
 * les styles globaux et la configuration i18n.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Initialisation de l'internationalisation

createRoot(document.getElementById("root")!).render(<App />);
