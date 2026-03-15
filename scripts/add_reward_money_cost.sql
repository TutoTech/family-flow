-- Migration: Ajouter le cout en argent aux recompenses
-- Cette migration ajoute la possibilite de definir un cout en argent (en plus ou a la place des points)

-- 1. Ajouter la colonne cost_money a la table rewards
-- La colonne est nullable car une recompense peut n'avoir qu'un cout en points
ALTER TABLE rewards
ADD COLUMN IF NOT EXISTS cost_money DECIMAL(10, 2) DEFAULT NULL;

-- 2. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN rewards.cost_money IS 'Cout en argent de la recompense (optionnel). Peut etre utilise seul ou en combinaison avec cost_points.';

-- 3. Verification - Afficher la structure de la table rewards
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'rewards'
ORDER BY ordinal_position;

-- 4. Notifier PostgREST de recharger le schema cache
NOTIFY pgrst, 'reload schema';
