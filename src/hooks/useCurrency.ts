/**
 * Hook de gestion de la devise familiale.
 * Récupère la devise configurée dans les paramètres de la famille
 * et fournit le symbole correspondant.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Liste des devises supportées par l'application */
export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "USD", symbol: "$", label: "Dollar US ($)" },
  { code: "GBP", symbol: "£", label: "Livre sterling (£)" },
  { code: "MAD", symbol: "MAD", label: "Dirham marocain (MAD)" },
  { code: "CAD", symbol: "CA$", label: "Dollar canadien (CA$)" },
  { code: "CHF", symbol: "CHF", label: "Franc suisse (CHF)" },
  { code: "TND", symbol: "TND", label: "Dinar tunisien (TND)" },
  { code: "XOF", symbol: "CFA", label: "Franc CFA (CFA)" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function useCurrency() {
  const { profile } = useAuth();
  const familyId = profile?.family_id;

  /** Récupère le code devise depuis family_settings (cache 5 min) */
  const { data: currencyCode = "EUR" } = useQuery({
    queryKey: ["family-currency", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_settings")
        .select("currency")
        .eq("family_id", familyId!)
        .single();
      if (error) throw error;
      return (data?.currency as CurrencyCode) ?? "EUR";
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
  });

  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  return { currencyCode: currency.code, symbol: currency.symbol, currencies: CURRENCIES };
}
