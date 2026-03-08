
-- Trigger: when task_instance status changes to 'validated', award points to child
CREATE OR REPLACE FUNCTION public.handle_task_validated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _points integer;
BEGIN
  IF NEW.status = 'validated' AND OLD.status != 'validated' THEN
    SELECT points_reward INTO _points
    FROM public.task_templates
    WHERE id = NEW.task_template_id;

    UPDATE public.child_stats
    SET current_points = current_points + COALESCE(_points, 0),
        updated_at = now()
    WHERE child_id = NEW.assigned_to_user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_validated
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_validated();

-- Trigger: when reward redemption is approved, deduct points
CREATE OR REPLACE FUNCTION public.handle_redemption_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cost integer;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'requested' THEN
    SELECT cost_points INTO _cost
    FROM public.rewards
    WHERE id = NEW.reward_id;

    UPDATE public.child_stats
    SET current_points = current_points - COALESCE(_cost, 0),
        updated_at = now()
    WHERE child_id = NEW.child_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_redemption_approved
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_redemption_approved();
