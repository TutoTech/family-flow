/**
 * Overlay de célébration réutilisable.
 * Affiche une animation plein écran avec confettis, icône,
 * titre et description. Se ferme au clic ou automatiquement.
 */

import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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

interface Props {
  icon: ReactNode;
  subtitle: string;
  title: string;
  description?: string;
  onDismiss: () => void;
  glowColor?: string;
}

export default function CelebrationOverlay({
  icon,
  subtitle,
  title,
  description,
  onDismiss,
  glowColor = "bg-primary/20",
}: Props) {
  const { t } = useTranslation();

  const particles = Array.from({ length: 40 }, (_, i) => ({
    delay: Math.random() * 1500,
    left: Math.random() * 100,
  }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-fade-in" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <Particle key={i} delay={p.delay} left={p.left} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-elevated animate-badge-pop">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full ${glowColor} animate-ping-slow`} />
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
            <span className="text-5xl animate-bounce-gentle">{icon}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {subtitle}
          </p>
          <h3
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {t("badges.celebration.tapToDismiss")}
        </p>
      </div>
    </div>
  );
}
