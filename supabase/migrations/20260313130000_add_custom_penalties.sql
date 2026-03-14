-- Remplace rule_id par une colonne optionnelle dans penalties_log
ALTER TABLE public.penalties_log ALTER COLUMN rule_id DROP NOT NULL;

-- Ajoute les colonnes nécessaires au stockage des pénalités personnalisées ou générées par les tâches
ALTER TABLE public.penalties_log ADD COLUMN points_amount INTEGER;
ALTER TABLE public.penalties_log ADD COLUMN wallet_amount NUMERIC;
ALTER TABLE public.penalties_log ADD COLUMN custom_title TEXT;
