/**
 * Livret de l'enfant : solde du portefeuille et dernières écritures.
 *
 * Élément signature du thème Maison (« écriture comptable ») : le portefeuille
 * est présenté comme un livret d'épargne — solde en laiton, écritures empilées
 * en chiffres tabulaires, filets fins entre les lignes.
 */

import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useActivityHistory } from "@/hooks/useActivityHistory";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  /** Solde du portefeuille en argent réel */
  balance: number;
}

/** Nombre d'écritures affichées dans le livret (l'historique complet a son onglet) */
const LEDGER_ENTRIES = 4;

export default function ChildLedgerCard({ balance }: Props) {
  const { t, i18n } = useTranslation();
  const { symbol } = useCurrency();
  const locale = i18n.language === "fr" ? fr : enUS;
  const { data: activities } = useActivityHistory(20);

  // Seules les écritures en points alimentent le livret ; les ajustements
  // purement monétaires (points = 0) sont visibles dans l'historique complet.
  const entries = (activities ?? []).filter((a) => a.points !== 0).slice(0, LEDGER_ENTRIES);

  return (
    <Card className="shadow-card maison:border-t-2 maison:border-t-brass/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-success maison:text-brass" />
            {t("childDashboard.ledgerTitle")}
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold font-data tabular-nums text-success maison:text-brass">
              {balance.toFixed(2)}{symbol}
            </div>
            <p className="text-[11px] text-muted-foreground -mt-0.5">{t("childDashboard.ledgerBalance")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">{t("childDashboard.ledgerEmpty")}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 py-2">
                <span className="text-base shrink-0" aria-hidden="true">{entry.icon}</span>
                <span className="text-sm text-foreground truncate flex-1">{entry.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(entry.timestamp), "d MMM", { locale })}
                </span>
                <span
                  className={`text-sm font-semibold font-data tabular-nums shrink-0 whitespace-nowrap text-right ${
                    entry.points > 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {entry.points > 0 ? "+" : "−"}{Math.abs(entry.points)} {t("common.pts")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
