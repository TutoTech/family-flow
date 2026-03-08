/**
 * Composant de célébration de badge.
 * Détecte les nouveaux badges obtenus par l'enfant en comparant
 * avec le localStorage, et affiche une animation de célébration.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
import CelebrationOverlay from "./CelebrationOverlay";

export default function BadgeCelebration() {
  const { profile } = useAuth();
  const { data: badges } = useBadges();
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile || !badges) return;

    const localStorageKey = `badges-${profile.userId}`;
    const storedBadges = localStorage.getItem(localStorageKey);
    const awardedBadges = profile.badges || [];

    // Détermine les nouveaux badges non présents dans le localStorage
    if (storedBadges) {
      const parsedStoredBadges = JSON.parse(storedBadges) as string[];
      const newlyAwardedBadges = awardedBadges.filter((badgeId) => !parsedStoredBadges.includes(badgeId));

      if (newlyAwardedBadges.length > 0) {
        setNewBadge(newlyAwardedBadges[0]); // Prend le premier nouveau badge
        setOpen(true);
        localStorage.setItem(localStorageKey, JSON.stringify(awardedBadges));
      }
    } else {
      // Si aucun badge stocké, considère tous les badges actuels comme nouveaux
      if (awardedBadges.length > 0) {
        setNewBadge(awardedBadges[0]); // Prend le premier badge
        setOpen(true);
        localStorage.setItem(localStorageKey, JSON.stringify(awardedBadges));
      }
    }
  }, [profile, badges]);

  // Réinitialise l'état et ferme l'overlay
  const handleClose = () => {
    setOpen(false);
    setNewBadge(null);
  };

  if (!newBadge || !badges) return null;

  const badge = badges.find((b) => b.id === newBadge);

  if (!badge) return null;

  return (
    <CelebrationOverlay
      open={open}
      onClose={handleClose}
      imageUrl={badge.image_url}
      title={`Nouveau badge !`}
      description={`Tu as débloqué le badge "${badge.name}" !`}
    />
  );
}
