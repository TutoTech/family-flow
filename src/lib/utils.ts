import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrait un message lisible d'une valeur capturée dans un bloc `catch`.
 * Permet de typer l'erreur en `unknown` (plus sûr que `any`) tout en
 * gérant les rejets qui ne sont pas des instances d'`Error`.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  // Erreurs non-Error porteuses d'un message (ex. PostgrestError de Supabase)
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  // Valeur inexploitable : chaîne vide pour laisser les appelants
  // appliquer leur message de repli (`getErrorMessage(err) || t(...)`)
  // plutôt que d'afficher "[object Object]" ou "undefined".
  return "";
}
