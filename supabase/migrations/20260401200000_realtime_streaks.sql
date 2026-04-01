-- Real-time accurate streak computation

-- Drop the old flawed function
DROP FUNCTION IF EXISTS public.update_all_streaks();

-- Function to dynamically calculate child streak
CREATE OR REPLACE FUNCTION public.calculate_child_streak(child_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _streak integer := 0;
  _current_date date := CURRENT_DATE;
  _tasks_exist boolean;
  _uncompleted_tasks boolean;
  _failed_tasks boolean;
  _had_penalty boolean;
BEGIN
  -- We loop backward from TODAY
  LOOP
    -- 1. Check for penalties on this day
    SELECT EXISTS (
      SELECT 1 FROM public.penalties_log
      WHERE child_id = child_uuid AND DATE(created_at) = _current_date
    ) INTO _had_penalty;

    -- 2. Check for failed tasks on this day
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
        AND status IN ('late', 'not_done')
    ) INTO _failed_tasks;

    -- If penalty or failed tasks, the streak is absolutely broken here.
    IF _had_penalty OR _failed_tasks THEN
      EXIT; -- Break loop, streak ends
    END IF;

    -- 3. Check if tasks exist on this day
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
    ) INTO _tasks_exist;

    -- 4. Check for uncompleted (pending) tasks on this day
    SELECT EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE assigned_to_user_id = child_uuid AND scheduled_for_date = _current_date
        AND status = 'pending'
    ) INTO _uncompleted_tasks;

    IF _tasks_exist THEN
      IF _uncompleted_tasks THEN
        -- If today, it just means they haven't finished yet. It doesn't break the streak from yesterday.
        -- But it doesn't add to the streak.
        -- If it's in the past, a 'pending' task means they never finished it, so the streak breaks.
        IF _current_date = CURRENT_DATE THEN
          -- Do nothing, just move to yesterday
        ELSE
          EXIT;
        END IF;
      ELSE
        -- All tasks completed nicely
        _streak := _streak + 1;
      END IF;
    END IF;

    -- Move backward
    _current_date := _current_date - INTERVAL '1 day';
    
    -- Safety limit to avoid infinite loops in case of extreme data or weird dates
    IF _streak > 1000 THEN 
       EXIT;
    END IF;
  END LOOP;

  RETURN _streak;
END;
$$;

-- Trigger function to update the child_stats automatically
CREATE OR REPLACE FUNCTION public.trigger_update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _child_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'task_instances' THEN
    IF TG_OP = 'DELETE' THEN
      _child_id := OLD.assigned_to_user_id;
    ELSE
      _child_id := NEW.assigned_to_user_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'penalties_log' THEN
    IF TG_OP = 'DELETE' THEN
      _child_id := OLD.child_id;
    ELSE
      _child_id := NEW.child_id;
    END IF;
  END IF;

  IF _child_id IS NOT NULL THEN
    UPDATE public.child_stats
    SET streak_days = public.calculate_child_streak(_child_id)
    WHERE child_id = _child_id;
  END IF;

  RETURN NULL; -- AFTER trigger
END;
$$;

-- Attach triggers
DROP TRIGGER IF EXISTS tr_task_instances_streak_insert ON public.task_instances;
CREATE TRIGGER tr_task_instances_streak_insert
AFTER INSERT OR DELETE ON public.task_instances
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_streak();

DROP TRIGGER IF EXISTS tr_task_instances_streak_update ON public.task_instances;
CREATE TRIGGER tr_task_instances_streak_update
AFTER UPDATE ON public.task_instances
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.scheduled_for_date IS DISTINCT FROM NEW.scheduled_for_date)
EXECUTE FUNCTION public.trigger_update_streak();

DROP TRIGGER IF EXISTS tr_penalties_log_streak ON public.penalties_log;
CREATE TRIGGER tr_penalties_log_streak
AFTER INSERT OR DELETE ON public.penalties_log
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_streak();

-- Retroactively fix all streaks for existing children
DO $$
DECLARE
  _child RECORD;
BEGIN
  FOR _child IN 
    SELECT child_id FROM public.child_stats
  LOOP
    UPDATE public.child_stats
    SET streak_days = public.calculate_child_streak(_child.child_id)
    WHERE child_id = _child.child_id;
  END LOOP;
END;
$$;
