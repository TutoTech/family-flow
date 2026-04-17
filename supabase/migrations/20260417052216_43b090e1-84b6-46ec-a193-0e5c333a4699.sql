-- Fonction RPC pour attacher un enfant à une famille avec un timeout local étendu.
-- Le trigger handle_seed_example_tasks insère 20 task_templates + génère toutes les
-- instances quotidiennes, ce qui peut dépasser le statement_timeout par défaut (8s).
CREATE OR REPLACE FUNCTION public.attach_child_to_family(_user_id uuid, _family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout TO '60s'
AS $$
BEGIN
  UPDATE public.profiles
  SET family_id = _family_id
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.attach_child_to_family(uuid, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_child_to_family(uuid, uuid) TO service_role;