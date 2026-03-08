
-- Function: notify child when a penalty is logged against them
CREATE OR REPLACE FUNCTION public.handle_penalty_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _rule_label text;
  _points_penalty integer;
BEGIN
  -- Get rule details
  SELECT label, points_penalty INTO _rule_label, _points_penalty
  FROM public.house_rules WHERE id = NEW.rule_id;

  -- Notify the child
  INSERT INTO public.notifications (user_id, title, body, type, metadata)
  VALUES (
    NEW.child_id,
    'Pénalité reçue',
    'Tu as reçu une pénalité "' || COALESCE(_rule_label, '?') || '" (-' || COALESCE(_points_penalty, 0) || ' pts)',
    'penalty',
    jsonb_build_object('penalty_id', NEW.id, 'rule_id', NEW.rule_id)
  );

  RETURN NEW;
END;
$$;

-- Create trigger on penalties_log insert
CREATE TRIGGER on_penalty_logged_notify
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_penalty_notification();
