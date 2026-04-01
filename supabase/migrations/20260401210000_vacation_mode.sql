-- Mode Vacances : colonnes + fonctions RPC

-- 1. Ajout du flag vacation_mode dans family_settings
ALTER TABLE public.family_settings
  ADD COLUMN IF NOT EXISTS vacation_mode boolean NOT NULL DEFAULT false;

-- 2. Ajout du flag disabled_during_vacation dans task_templates
ALTER TABLE public.task_templates
  ADD COLUMN IF NOT EXISTS disabled_during_vacation boolean NOT NULL DEFAULT false;

-- 3. Fonction pour activer le mode vacances
CREATE OR REPLACE FUNCTION public.activate_vacation_mode(_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mettre le flag vacation_mode à true
  UPDATE public.family_settings
  SET vacation_mode = true
  WHERE family_id = _family_id;

  -- Désactiver toutes les tâches marquées disabled_during_vacation
  UPDATE public.task_templates
  SET is_active = false
  WHERE family_id = _family_id
    AND disabled_during_vacation = true
    AND is_active = true;
END;
$$;

-- 4. Fonction pour désactiver le mode vacances
CREATE OR REPLACE FUNCTION public.deactivate_vacation_mode(_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mettre le flag vacation_mode à false
  UPDATE public.family_settings
  SET vacation_mode = false
  WHERE family_id = _family_id;

  -- Réactiver toutes les tâches marquées disabled_during_vacation
  UPDATE public.task_templates
  SET is_active = true
  WHERE family_id = _family_id
    AND disabled_during_vacation = true
    AND is_active = false;
END;
$$;
