-- Update trigger function to handle custom penalties (where rule_id is null) directly in the database
-- to bypass any potential RLS restrictions on frontend inserts and ensure atomicity.

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
  -- If no rule is attached, it's a custom penalty (e.g. overdue task marked by parent)
  IF NEW.rule_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, metadata)
    VALUES (
      NEW.child_id,
      '⚠️ Pénalité automatique',
      'Tu as perdu ' || COALESCE(NEW.points_amount, 0) || ' points car "' || COALESCE(NEW.custom_title, 'Tâche non faite') || '" a été marquée comme non faite.',
      'overdue_penalty',
      jsonb_build_object(
        'penalty_id', NEW.id,
        'penalty_points', NEW.points_amount,
        'wallet_amount', NEW.wallet_amount
      )
    );
    RETURN NEW;
  END IF;

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
