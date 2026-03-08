import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLevelBadges } from "@/hooks/useLevelBadges";
import { useAuth } from "@/hooks/useAuth";
import CelebrationOverlay from "./CelebrationOverlay";

const SEEN_LEVEL_KEY = "seen_level";

function getSeenLevel(userId: string): number {
  try {
    const raw = localStorage.getItem(`${SEEN_LEVEL_KEY}_${userId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function setSeenLevel(userId: string, level: number) {
  localStorage.setItem(`${SEEN_LEVEL_KEY}_${userId}`, String(level));
}

export default function LevelCelebration() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { levelInfo } = useLevelBadges();
  const [celebrating, setCelebrating] = useState<{
    icon: string;
    name: string;
    level: number;
  } | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!user?.id || !levelInfo?.currentLevel) return;

    const currentLevel = levelInfo.currentLevel.level;
    const seenLevel = getSeenLevel(user.id);

    // First load: just store current level without celebrating
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      if (seenLevel === 0) {
        setSeenLevel(user.id, currentLevel);
        return;
      }
    }

    if (currentLevel > seenLevel && seenLevel > 0) {
      setCelebrating({
        icon: levelInfo.currentLevel.icon,
        name: t(`levels.names.${levelInfo.currentLevel.level}`),
        level: currentLevel,
      });
      setSeenLevel(user.id, currentLevel);
    } else if (seenLevel === 0) {
      setSeenLevel(user.id, currentLevel);
    }
  }, [user?.id, levelInfo?.currentLevel?.level, t]);

  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(null), 4500);
    return () => clearTimeout(timer);
  }, [celebrating]);

  if (!celebrating) return null;

  return (
    <CelebrationOverlay
      icon={celebrating.icon}
      subtitle={t("levels.celebration.levelUp")}
      title={celebrating.name}
      description={t("levels.celebration.reached", { level: celebrating.level })}
      onDismiss={() => setCelebrating(null)}
      glowColor="bg-accent/30"
    />
  );
}
