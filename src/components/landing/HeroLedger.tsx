/**
 * Visuel héro du thème Maison : un livret d'enfant reconstitué avec les
 * tokens du design system (couleurs, polices, ombres suivent le skin et le
 * mode). Contenu de démonstration i18n. Le thème Classique conserve son
 * illustration d'origine (voir HeroSection).
 */

import { useTranslation } from "react-i18next";
import { Flame } from "lucide-react";

const HeroLedger = () => {
  const { t } = useTranslation();

  const entries = [
    { id: "entry1", icon: "🛏️", title: t("hero.ledger.entry1"), date: t("hero.ledger.today"), amount: "+10", positive: true },
    { id: "entry2", icon: "🍽️", title: t("hero.ledger.entry2"), date: t("hero.ledger.today"), amount: "+5", positive: true },
    { id: "entry3", icon: "🔥", title: t("hero.ledger.entry3"), date: t("hero.ledger.yesterday"), amount: "+5", positive: true },
    { id: "entry4", icon: "🚲", title: t("hero.ledger.entry4"), date: t("hero.ledger.yesterday"), amount: "−20", positive: false },
  ];

  return (
    /* Purement décoratif (données de démonstration, à l'image de l'illustration
       qu'il remplace en Classique) : masqué aux technologies d'assistance pour
       éviter qu'un contenu chiffré fictif soit annoncé comme réel. */
    <div className="relative" aria-hidden="true">
      {/* Feuillet décoratif derrière le livret */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-primary/10 border border-primary/15" aria-hidden="true" />

      <div className="relative rounded-xl bg-card border border-border shadow-elevated p-6 sm:p-7">
        {/* En-tête du livret */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-spark/15 text-spark flex items-center justify-center font-bold font-display shrink-0">
              L
            </div>
            <div className="min-w-0">
              <p className="font-semibold font-display text-foreground truncate">{t("hero.ledger.name")}</p>
              <p className="text-xs text-muted-foreground">Stop Repeat</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-spark text-sm font-semibold shrink-0">
            <Flame className="h-4 w-4" />
            <span className="font-data tabular-nums">7</span>
          </div>
        </div>

        {/* Solde */}
        <div className="py-4 flex items-baseline justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("hero.ledger.balanceLabel")}</p>
          <p className="text-3xl font-bold font-data tabular-nums text-brass">24,50€</p>
        </div>

        {/* Écritures */}
        <div className="divide-y divide-border/60 border-t border-border">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2.5 py-2.5">
              <span className="text-base shrink-0" aria-hidden="true">{entry.icon}</span>
              <span className="text-sm text-foreground truncate flex-1">{entry.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{entry.date}</span>
              <span
                className={`text-sm font-semibold font-data tabular-nums shrink-0 whitespace-nowrap text-right ${
                  entry.positive ? "text-success" : "text-destructive"
                }`}
              >
                {entry.amount} {t("common.pts")}
              </span>
            </div>
          ))}
        </div>

        {/* Objectif d'épargne */}
        <div className="pt-4 mt-1 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{t("hero.ledger.goal")}</span>
            <span className="font-data tabular-nums text-muted-foreground">75%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroLedger;
