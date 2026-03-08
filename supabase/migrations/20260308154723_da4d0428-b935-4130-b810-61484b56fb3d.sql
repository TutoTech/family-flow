
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
BEGIN
  IF NEW.status = 'validated' AND OLD.status != 'validated' THEN
    SELECT points_reward INTO _points
    FROM public.task_templates
    WHERE id = NEW.task_template_id;

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
