-- Fonction RPC pour créer une famille et y rattacher le créateur en une seule transaction.
-- Évite le problème RLS où SELECT après INSERT échoue car la politique SELECT exige
-- que le user soit déjà membre de la famille.
CREATE OR REPLACE FUNCTION public.create_family_and_join(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _family_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  -- Vérifier que l'utilisateur est authentifié et est un parent
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT public.has_role(_user_id, 'parent') THEN
    RAISE EXCEPTION 'only_parents_can_create_family';
  END IF;

  -- Vérifier que le user n'a pas déjà une famille
  IF (SELECT family_id FROM public.profiles WHERE user_id = _user_id) IS NOT NULL THEN
    RAISE EXCEPTION 'already_in_family';
  END IF;

  -- Créer la famille
  INSERT INTO public.families (name) VALUES (trim(_name)) RETURNING id INTO _family_id;

  -- Rattacher le user à la famille
  UPDATE public.profiles SET family_id = _family_id WHERE user_id = _user_id;

  RETURN _family_id;
END;
$$;