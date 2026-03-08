
CREATE OR REPLACE FUNCTION public.handle_redemption_requested_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _child_name text;
  _reward_title text;
  _cost integer;
  _family_id uuid;
  _parent record;
BEGIN
  IF NEW.status = 'requested' THEN
    SELECT name INTO _child_name FROM public.profiles WHERE user_id = NEW.child_id;
    SELECT title, cost_points, family_id INTO _reward_title, _cost, _family_id
    FROM public.rewards WHERE id = NEW.reward_id;

    FOR _parent IN
      SELECT p.user_id FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.user_id
      WHERE p.family_id = _family_id AND ur.role = 'parent'
    LOOP
      INSERT INTO public.notifications (user_id, title, body, type, metadata)
      VALUES (
        _parent.user_id,
        'Demande de récompense',
        COALESCE(_child_name, 'Un enfant') || ' souhaite échanger ' || COALESCE(_cost, 0) || ' pts contre "' || COALESCE(_reward_title, '?') || '"',
        'redemption_requested',
        jsonb_build_object('redemption_id', NEW.id, 'child_id', NEW.child_id, 'reward_id', NEW.reward_id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_redemption_requested_notify
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION handle_redemption_requested_notification();
