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
  return String(error);
}
