
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
  IF NEW.family_id IS NOT NULL AND (OLD.family_id IS NULL OR OLD.family_id != NEW.family_id) THEN
    IF NOT has_role(NEW.user_id, 'child') THEN
      RETURN NEW;
    END IF;

    _family_id := NEW.family_id;

    IF EXISTS (SELECT 1 FROM public.task_templates WHERE family_id = _family_id LIMIT 1) THEN
      -- Templates already exist, just generate today's instances
      PERFORM public.generate_daily_task_instances(_family_id);
      RETURN NEW;
    END IF;

    SELECT p.user_id INTO _parent_id
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.family_id = _family_id AND ur.role = 'parent'
    LIMIT 1;

    IF _parent_id IS NULL THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.task_templates (family_id, created_by_user_id, assigned_to_user_id, title, description, icon, due_time, points_reward, recurrence_type, requires_photo) VALUES
      (_family_id, _parent_id, NEW.user_id, 'Faire son lit', 'Bien tirer la couette et replacer les oreillers', '🛏️', '08:00', 3, 'weekdays', false),
      (_family_id, _parent_id, NEW.user_id, 'Ranger sa chambre', 'Ranger les jouets, les vêtements et organiser le bureau', '🧹', '19:00', 5, 'daily', true),
      (_family_id, _parent_id, NEW.user_id, 'Brosser les dents', 'Se brosser les dents après le petit-déjeuner', '🦷', '08:30', 2, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Mettre la table', 'Mettre les couverts et les assiettes pour le dîner', '🍽️', '19:00', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Faire ses devoirs', 'Terminer les devoirs du jour avant l''heure du dîner', '📚', '18:00', 5, 'weekdays', true),
      (_family_id, _parent_id, NEW.user_id, 'Préparer son cartable', 'Vérifier le cahier de texte et préparer les affaires pour le lendemain', '🎒', '20:00', 2, 'weekdays', false),
      (_family_id, _parent_id, NEW.user_id, 'Débarrasser la table', 'Débarrasser son assiette et aider à ranger après le repas', '🍽️', '20:00', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Sortir les poubelles', 'Sortir le sac poubelle et mettre un nouveau sac', '🗑️', '19:30', 4, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Nourrir l''animal', 'Donner à manger et à boire à l''animal de compagnie', '🐾', '07:30', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Lire 20 minutes', 'Lire un livre ou une BD pendant au moins 20 minutes', '📖', '20:30', 4, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Plier son linge', 'Plier et ranger ses vêtements propres', '👕', '18:30', 4, 'weekends', true),
      (_family_id, _parent_id, NEW.user_id, 'Passer l''aspirateur', 'Aspirer sa chambre ou une pièce de la maison', '🧹', '17:00', 5, 'weekends', true);

    -- Generate today's task instances immediately after seeding
    PERFORM public.generate_daily_task_instances(_family_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_profile_family_set ON public.profiles;
CREATE TRIGGER on_profile_family_set
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_seed_example_tasks();
