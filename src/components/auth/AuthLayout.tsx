/**
 * Layout commun aux pages d'authentification (login, signup, reset).
 * Centre le contenu verticalement avec le logo de l'application.
 */

import { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo cliquable qui redirige vers la page d'accueil */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img src={logo} alt="Stop Repeat" className="h-10 w-10" />
        <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Stop Repeat
        </span>
      </Link>
      {children}
    </div>
  );
}
