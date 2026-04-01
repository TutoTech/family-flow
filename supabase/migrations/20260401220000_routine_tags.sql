-- Routine tags for task templates

-- 1. Ajout de la colonne routine_tag dans task_templates
ALTER TABLE public.task_templates
  ADD COLUMN IF NOT EXISTS routine_tag text DEFAULT NULL
  CHECK (routine_tag IS NULL OR routine_tag IN ('morning', 'evening'));
