
-- Add obligatory task mode to task templates.
-- When is_obligatory = true, the child does NOT earn points on completion,
-- but can still be penalised if the task is overdue.

ALTER TABLE public.task_templates
  ADD COLUMN is_obligatory BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.task_templates.is_obligatory
  IS 'When true, completing this task does not award points. Used for mandatory tasks (e.g. brushing teeth).';

-- Update the handle_task_validated trigger to skip points for obligatory tasks
CREATE OR REPLACE FUNCTION public.handle_task_validated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _points integer;
  _rate numeric;
  _family_id uuid;
  _is_obligatory boolean;
BEGIN
  IF NEW.status = 'validated' AND OLD.status != 'validated' THEN
    SELECT points_reward, is_obligatory INTO _points, _is_obligatory
    FROM public.task_templates
    WHERE id = NEW.task_template_id;

    -- Skip point attribution for obligatory tasks
    IF _is_obligatory = true THEN
      RETURN NEW;
    END IF;

    _family_id := NEW.family_id;

    -- Get conversion rate
    SELECT COALESCE(points_to_money_rate, 0.10) INTO _rate
    FROM public.family_settings
    WHERE family_id = _family_id;

    UPDATE public.child_stats
    SET current_points = current_points + COALESCE(_points, 0),
        total_points_earned = total_points_earned + COALESCE(_points, 0),
        wallet_balance = wallet_balance + (COALESCE(_points, 0) * COALESCE(_rate, 0.10)),
        updated_at = now()
    WHERE child_id = NEW.assigned_to_user_id;
  END IF;
  RETURN NEW;
END;
$$;
