/**
 * Composant de célébration de badge.
 * Détecte les nouveaux badges obtenus par l'enfant en comparant
 * avec le localStorage, et affiche une animation de célébration.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLevelBadges, BADGES, BadgeKey } from "@/hooks/useLevelBadges";
import { useAuth } from "@/hooks/useAuth";
import CelebrationOverlay from "./CelebrationOverlay";

const SEEN_BADGES_KEY = "seen_badges";

/** Récupère la liste des badges déjà vus depuis le localStorage */
function getSeenBadges(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${SEEN_BADGES_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Marque un badge comme vu dans le localStorage */
function markBadgeSeen(userId: string, key: string) {
  const seen = getSeenBadges(userId);
  if (!seen.includes(key)) {
    seen.push(key);
    localStorage.setItem(`${SEEN_BADGES_KEY}_${userId}`, JSON.stringify(seen));
  }
}

export default function BadgeCelebration() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { badges } = useLevelBadges();
  const [celebrating, setCelebrating] = useState<{
    key: BadgeKey;
    icon: string;
    name: string;
  } | null>(null);
  const initialLoadRef = useRef(true);
  const processedRef = useRef<Set<string>>(new Set());

  const checkNewBadges = useCallback(() => {
    if (!user?.id || badges.length === 0) return;

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      const seen = getSeenBadges(user.id);
      const allCurrentKeys = badges.map((b) => b.key);
      const newOnes = allCurrentKeys.filter((k) => !seen.includes(k));

      if (newOnes.length > 0) {
        const badgeKey = newOnes[newOnes.length - 1];
        const badgeInfo = BADGES[badgeKey];
        setCelebrating({
          key: badgeKey,
          icon: badgeInfo.icon,
          name: t(`badges.names.${badgeKey}`),
        });
        newOnes.forEach((k) => markBadgeSeen(user.id, k));
      }
      return;
    }

    const seen = getSeenBadges(user.id);
    for (const badge of badges) {
      if (!seen.includes(badge.key) && !processedRef.current.has(badge.key)) {
        processedRef.current.add(badge.key);
        markBadgeSeen(user.id, badge.key);
        setCelebrating({
          key: badge.key,
          icon: BADGES[badge.key].icon,
          name: t(`badges.names.${badge.key}`),
        });
        break;
      }
    }
  }, [user?.id, badges, t]);

  useEffect(() => {
    checkNewBadges();
  }, [checkNewBadges]);

  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(null), 4000);
    return () => clearTimeout(timer);
  }, [celebrating]);

  if (!celebrating) return null;

  return (
    <CelebrationOverlay
      icon={celebrating.icon}
      subtitle={t("badges.celebration.unlocked")}
      title={celebrating.name}
      description={t(`badges.descriptions.${celebrating.key}`)}
      onDismiss={() => setCelebrating(null)}
    />
  );
}
