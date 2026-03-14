-- Create function to update streaks for all children
-- This is meant to be called daily (e.g. via edge function) to evaluate yesterday's performance.

CREATE OR REPLACE FUNCTION public.update_all_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _child RECORD;
  _yesterday date := CURRENT_DATE - INTERVAL '1 day';
  _had_penalty boolean;
  _completed_tasks boolean;
BEGIN
  -- Loop through all children
  FOR _child IN
    SELECT p.user_id as id, cs.streak_days
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    LEFT JOIN public.child_stats cs ON cs.child_id = p.user_id
    WHERE ur.role = 'child'
  LOOP
    -- 1. Check if the child had any penalty logged yesterday or any task marked as not_done/late
    SELECT EXISTS (
      -- Check penalties log
      SELECT 1 FROM public.penalties_log
      WHERE child_id = _child.id
        AND DATE(created_at) = _yesterday
      UNION ALL
      -- Check uncompleted tasks (late or not_done)
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = _child.id
        AND scheduled_for_date = _yesterday
        AND status IN ('late', 'not_done')
    ) INTO _had_penalty;

    IF _had_penalty THEN
      -- Reset streak if there was a penalty
      UPDATE public.child_stats
      SET streak_days = 0
      WHERE child_id = _child.id AND streak_days > 0;
      CONTINUE; -- Move to next child
    END IF;

    -- 2. Check if the child completed at least one task yesterday
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = _child.id
        AND scheduled_for_date = _yesterday
        AND status IN ('done', 'validated', 'awaiting_validation')
    ) INTO _completed_tasks;

    IF _completed_tasks THEN
      -- Increment streak if at least one task was completed and no penalties
      UPDATE public.child_stats
      SET streak_days = pb.streak_days + 1
      FROM (SELECT streak_days FROM public.child_stats WHERE child_id = _child.id) pb
      WHERE child_id = _child.id;
    END IF;
    
    -- Note: If the child had no tasks and no penalties, the streak remains unchanged
  END LOOP;
END;
$$;
