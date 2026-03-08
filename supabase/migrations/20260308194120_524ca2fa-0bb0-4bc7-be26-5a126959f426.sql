-- Server-side enforcement: prevent joining a family if member limits are exceeded
CREATE OR REPLACE FUNCTION public.enforce_family_member_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _plan text;
  _max_parents int;
  _max_children int;
  _current_parents int;
  _current_children int;
  _user_role text;
BEGIN
  -- Only check when family_id is being set (not cleared)
  IF NEW.family_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Skip if family_id hasn't changed
  IF OLD.family_id IS NOT NULL AND OLD.family_id = NEW.family_id THEN
    RETURN NEW;
  END IF;

  -- Get family plan
  SELECT COALESCE(f.plan, 'free') INTO _plan
  FROM public.families f
  WHERE f.id = NEW.family_id;

  -- Set limits based on plan
  IF _plan = 'family' THEN
    _max_parents := 2;
    _max_children := 99;
  ELSE
    _max_parents := 1;
    _max_children := 1;
  END IF;

  -- Get user's role
  SELECT role INTO _user_role
  FROM public.user_roles
  WHERE user_id = NEW.user_id;

  -- Count current members by role in this family
  SELECT
    COALESCE(SUM(CASE WHEN ur.role = 'parent' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ur.role = 'child' THEN 1 ELSE 0 END), 0)
  INTO _current_parents, _current_children
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE p.family_id = NEW.family_id;

  -- Enforce limits
  IF _user_role = 'parent' AND _current_parents >= _max_parents THEN
    RAISE EXCEPTION 'Family member limit reached: maximum % parent(s) for % plan', _max_parents, _plan;
  END IF;

  IF _user_role = 'child' AND _current_children >= _max_children THEN
    RAISE EXCEPTION 'Family member limit reached: maximum % child(ren) for % plan', _max_children, _plan;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_family_limits_on_profile_update
  BEFORE UPDATE OF family_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_family_member_limits();