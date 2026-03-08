import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLevelBadges, BADGES, BadgeKey } from "@/hooks/useLevelBadges";
import { useAuth } from "@/hooks/useAuth";

const SEEN_BADGES_KEY = "seen_badges";

function getSeenBadges(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${SEEN_BADGES_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markBadgeSeen(userId: string, key: string) {
  const seen = getSeenBadges(userId);
  if (!seen.includes(key)) {
    seen.push(key);
    localStorage.setItem(`${SEEN_BADGES_KEY}_${userId}`, JSON.stringify(seen));
  }
}

// Simple confetti particle
function Particle({ delay, left }: { delay: number; left: number }) {
  const colors = [
    "hsl(16 85% 60%)",
    "hsl(45 95% 62%)",
    "hsl(172 45% 46%)",
    "hsl(280 70% 60%)",
    "hsl(340 70% 50%)",
    "hsl(200 80% 55%)",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute rounded-sm animate-confetti-fall"
      style={{
        left: `${left}%`,
        top: "-10px",
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
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

    // On first load, just mark all current badges as seen
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      const seen = getSeenBadges(user.id);
      const allCurrentKeys = badges.map((b) => b.key);
      const newOnes = allCurrentKeys.filter((k) => !seen.includes(k));

      if (newOnes.length > 0) {
        // Show celebration for the most recent unseen badge
        const badgeKey = newOnes[newOnes.length - 1];
        const badgeInfo = BADGES[badgeKey];
        setCelebrating({
          key: badgeKey,
          icon: badgeInfo.icon,
          name: t(`badges.names.${badgeKey}`),
        });
        // Mark all as seen
        newOnes.forEach((k) => markBadgeSeen(user.id, k));
      }
      return;
    }

    // Subsequent updates: check for new badges
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

  // Auto-dismiss after 4s
  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(null), 4000);
    return () => clearTimeout(timer);
  }, [celebrating]);

  if (!celebrating) return null;

  const particles = Array.from({ length: 40 }, (_, i) => ({
    delay: Math.random() * 1500,
    left: Math.random() * 100,
  }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto"
      onClick={() => setCelebrating(null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-fade-in" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <Particle key={i} delay={p.delay} left={p.left} />
        ))}
      </div>

      {/* Badge card */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-elevated animate-badge-pop">
        {/* Glow ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow" />
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
            <span className="text-5xl animate-bounce-gentle">{celebrating.icon}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("badges.celebration.unlocked")}
          </p>
          <h3
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {celebrating.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`badges.descriptions.${celebrating.key}`)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {t("badges.celebration.tapToDismiss")}
        </p>
      </div>
    </div>
  );
}
