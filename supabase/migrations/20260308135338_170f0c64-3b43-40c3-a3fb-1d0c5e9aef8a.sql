
-- Create a function to seed example task templates for the first child in a family
CREATE OR REPLACE FUNCTION public.handle_seed_example_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _parent_id uuid;
  _family_id uuid;
BEGIN
  -- Only trigger when a child joins a family (family_id set for the first time)
  IF NEW.family_id IS NOT NULL AND (OLD.family_id IS NULL OR OLD.family_id != NEW.family_id) THEN
    -- Check if the user is a child
    IF NOT has_role(NEW.user_id, 'child') THEN
      RETURN NEW;
    END IF;

    _family_id := NEW.family_id;

    -- Only seed if NO task templates exist yet for this family
    IF EXISTS (SELECT 1 FROM public.task_templates WHERE family_id = _family_id LIMIT 1) THEN
      RETURN NEW;
    END IF;

    -- Find a parent in this family
    SELECT p.user_id INTO _parent_id
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.family_id = _family_id AND ur.role = 'parent'
    LIMIT 1;

    IF _parent_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Seed example task templates
    INSERT INTO public.task_templates (family_id, created_by_user_id, assigned_to_user_id, title, description, icon, due_time, points_reward, recurrence_type, requires_photo) VALUES
      (_family_id, _parent_id, NEW.user_id, 'Faire son lit', 'Bien tirer la couette et replacer les oreillers', '🛏️', '08:00', 3, 'weekdays', false),
      (_family_id, _parent_id, NEW.user_id, 'Ranger sa chambre', 'Ranger les jouets, les vêtements et organiser le bureau', '🧹', '19:00', 5, 'daily', true),
      (_family_id, _parent_id, NEW.user_id, 'Brosser les dents', 'Se brosser les dents après le petit-déjeuner', '🦷', '08:30', 2, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Mettre la table', 'Mettre les couverts et les assiettes pour le dîner', '🍽️', '19:00', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Faire ses devoirs', 'Terminer les devoirs du jour avant l''heure du dîner', '📚', '18:00', 5, 'weekdays', true),
      (_family_id, _parent_id, NEW.user_id, 'Préparer son cartable', 'Vérifier le cahier de texte et préparer les affaires pour le lendemain', '🎒', '20:00', 2, 'weekdays', false);
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger on profiles to seed tasks when a child joins a family
CREATE TRIGGER on_child_joins_family
  AFTER UPDATE OF family_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_seed_example_tasks();
