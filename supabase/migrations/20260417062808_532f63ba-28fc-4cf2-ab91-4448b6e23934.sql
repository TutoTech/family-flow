-- La fonction calculate_child_streak bouclait sur 1000 jours en arrière même
-- pour les enfants sans historique, ce qui causait des timeouts en cascade
-- lors de la génération d'instances de tâches (chaque INSERT déclenche un trigger
-- qui appelle cette fonction).
--
-- Solution : sortir de la boucle dès qu'on dépasse la plus ancienne tâche connue
-- de l'enfant.

CREATE OR REPLACE FUNCTION public.calculate_child_streak(child_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _streak integer := 0;
  _current_date date := CURRENT_DATE;
  _earliest_date date;
  _tasks_exist boolean;
  _uncompleted_tasks boolean;
  _failed_tasks boolean;
  _had_penalty boolean;
BEGIN
  -- Détermine la borne inférieure : la plus ancienne tâche ou pénalité de l'enfant.
  -- Si aucune n'existe, le streak est forcément 0.
  SELECT LEAST(
    (SELECT MIN(scheduled_for_date) FROM public.task_instances WHERE assigned_to_user_id = child_uuid),
    (SELECT MIN((created_at at time zone 'utc')::date) FROM public.penalties_log WHERE child_id = child_uuid)
  ) INTO _earliest_date;

  IF _earliest_date IS NULL THEN
    RETURN 0;
  END IF;

  LOOP
    -- Sortir si on a dépassé la plus ancienne donnée connue
    IF _current_date < _earliest_date THEN
      EXIT;
    END IF;

    -- 1. Vérifier les pénalités sur ce jour
    SELECT EXISTS (
      SELECT 1 FROM public.penalties_log
      WHERE child_id = child_uuid AND (created_at at time zone 'utc')::date = _current_date
    ) INTO _had_penalty;

    -- 2. Vérifier les tâches échouées sur ce jour
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
        AND status IN ('late', 'not_done')
    ) INTO _failed_tasks;

    IF _had_penalty OR _failed_tasks THEN
      EXIT;
    END IF;

    -- 3. Vérifier si des tâches existent ce jour
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
    ) INTO _tasks_exist;

    -- 4. Vérifier les tâches non terminées
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
        AND status = 'pending'
    ) INTO _uncompleted_tasks;

    IF _tasks_exist THEN
      IF _uncompleted_tasks THEN
        IF _current_date = CURRENT_DATE THEN
          -- Aujourd'hui : on continue (pas encore terminé)
          NULL;
        ELSE
          EXIT;
        END IF;
      ELSE
        _streak := _streak + 1;
      END IF;
    END IF;

    _current_date := _current_date - 1;

    -- Garde-fou
    IF _streak > 1000 THEN
       EXIT;
    END IF;
  END LOOP;

  RETURN _streak;
END;
$function$;

-- Maintenant, on régénère les instances manquantes pour la famille concernée.
SELECT public.generate_daily_task_instances('cb53aba9-89a7-4c24-9219-5f4835bb0861');