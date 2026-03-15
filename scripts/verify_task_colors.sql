-- Script de verification et correction pour la fonctionnalite de couleurs de taches
-- Executez ce script dans le SQL Editor de Lovable si la fonctionnalite ne marche pas

-- 1. Verifier si les colonnes bg_color et child_bg_color existent
-- Si elles n'existent pas, les ajouter
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'task_templates' AND column_name = 'bg_color'
  ) THEN
    ALTER TABLE task_templates ADD COLUMN bg_color text DEFAULT NULL;
    RAISE NOTICE 'Colonne bg_color ajoutee';
  ELSE
    RAISE NOTICE 'Colonne bg_color existe deja';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'task_templates' AND column_name = 'child_bg_color'
  ) THEN
    ALTER TABLE task_templates ADD COLUMN child_bg_color text DEFAULT NULL;
    RAISE NOTICE 'Colonne child_bg_color ajoutee';
  ELSE
    RAISE NOTICE 'Colonne child_bg_color existe deja';
  END IF;
END $$;

-- 2. Creer ou remplacer la fonction RPC pour permettre aux enfants de changer leur couleur
-- Cette fonction permet a un enfant de modifier UNIQUEMENT la colonne child_bg_color
-- de ses propres taches (celles qui lui sont assignees)
CREATE OR REPLACE FUNCTION update_child_task_color(
  p_task_template_id uuid,
  p_color text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_assigned_to uuid;
BEGIN
  -- Recuperer l'assignation de la tache
  SELECT assigned_to_user_id INTO v_assigned_to
  FROM task_templates
  WHERE id = p_task_template_id;
  
  -- Verifier que l'utilisateur est bien l'enfant assigne a cette tache
  IF v_assigned_to IS NULL OR v_assigned_to != v_user_id THEN
    RAISE EXCEPTION 'Vous ne pouvez modifier que vos propres taches';
  END IF;
  
  -- Mettre a jour la couleur personnalisee de l'enfant
  UPDATE task_templates
  SET child_bg_color = NULLIF(p_color, '')
  WHERE id = p_task_template_id;
END;
$$;

-- 3. Accorder les permissions d'execution a tous les utilisateurs authentifies
GRANT EXECUTE ON FUNCTION update_child_task_color(uuid, text) TO authenticated;

-- 4. Verification finale - Afficher les colonnes de la table task_templates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_templates'
AND column_name IN ('bg_color', 'child_bg_color')
ORDER BY column_name;
