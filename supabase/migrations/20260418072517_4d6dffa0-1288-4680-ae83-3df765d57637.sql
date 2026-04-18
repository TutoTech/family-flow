-- Crée la fonction update_all_streaks qui manquait et était appelée par le edge function daily-task-reset.
-- Elle recalcule les streaks pour tous les enfants ayant des stats.
CREATE OR REPLACE FUNCTION public.update_all_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _child record;
BEGIN
  FOR _child IN SELECT child_id FROM public.child_stats LOOP
    UPDATE public.child_stats
    SET streak_days = public.calculate_child_streak(_child.child_id),
        updated_at = now()
    WHERE child_id = _child.child_id;
  END LOOP;
END;
$$;