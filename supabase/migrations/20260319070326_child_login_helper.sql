-- Fonction de résolution de l'email synthétique d'un enfant
-- à partir de son prénom et du code d'invitation de la famille.
-- Utilisée pour permettre la connexion enfant sans email visible.
-- Accessible aux utilisateurs non authentifiés (anon) pour le formulaire de login.

CREATE OR REPLACE FUNCTION public.get_child_login_email(
  _child_name TEXT,
  _invite_code TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _family_id UUID;
  _user_id   UUID;
  _email     TEXT;
BEGIN
  -- Recherche de la famille par code d'invitation
  SELECT id INTO _family_id
  FROM families
  WHERE invite_code = lower(trim(_invite_code));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Recherche de l'enfant par prénom dans cette famille
  SELECT p.user_id INTO _user_id
  FROM profiles p
  JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE p.family_id = _family_id
    AND ur.role = 'child'
    AND lower(trim(p.name)) = lower(trim(_child_name));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Récupération de l'email depuis auth.users (SECURITY DEFINER permet cet accès)
  SELECT email INTO _email
  FROM auth.users
  WHERE id = _user_id;

  RETURN _email;
END;
$$;

-- Accès accordé aux utilisateurs anonymes et authentifiés (connexion enfant)
GRANT EXECUTE ON FUNCTION public.get_child_login_email(TEXT, TEXT) TO anon, authenticated;
