
-- Trigger: when a penalty is logged, deduct points and wallet from child_stats
CREATE OR REPLACE FUNCTION public.handle_penalty_logged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _points_penalty integer;
  _wallet_penalty numeric;
BEGIN
  SELECT points_penalty, wallet_penalty INTO _points_penalty, _wallet_penalty
  FROM public.house_rules
  WHERE id = NEW.rule_id;

  UPDATE public.child_stats
  SET current_points = GREATEST(current_points - COALESCE(_points_penalty, 0), 0),
      wallet_balance = GREATEST(wallet_balance - COALESCE(_wallet_penalty, 0), 0),
      daily_penalties = daily_penalties + 1,
      updated_at = now()
  WHERE child_id = NEW.child_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_penalty_logged
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_penalty_logged();
