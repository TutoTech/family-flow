
-- Badges earned by children
CREATE TABLE public.child_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  badge_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, badge_key)
);

ALTER TABLE public.child_badges ENABLE ROW LEVEL SECURITY;

-- Children and family members can view badges
CREATE POLICY "Family can view badges"
  ON public.child_badges FOR SELECT
  TO authenticated
  USING (
    child_id = auth.uid()
    OR get_user_family_id(child_id) = get_user_family_id(auth.uid())
  );

-- System inserts badges (via trigger), but children can also earn them
CREATE POLICY "System can insert badges"
  ON public.child_badges FOR INSERT
  TO authenticated
  WITH CHECK (child_id = auth.uid() OR has_role(auth.uid(), 'parent'));

-- Add total_points_earned to child_stats for lifetime tracking
ALTER TABLE public.child_stats ADD COLUMN total_points_earned integer NOT NULL DEFAULT 0;

-- Update task validated trigger to also track total_points_earned
CREATE OR REPLACE FUNCTION public.handle_task_validated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _points integer;
BEGIN
  IF NEW.status = 'validated' AND OLD.status != 'validated' THEN
    SELECT points_reward INTO _points
    FROM public.task_templates
    WHERE id = NEW.task_template_id;

    UPDATE public.child_stats
    SET current_points = current_points + COALESCE(_points, 0),
        total_points_earned = total_points_earned + COALESCE(_points, 0),
        updated_at = now()
    WHERE child_id = NEW.assigned_to_user_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _total_points integer;
  _streak integer;
  _tasks_done bigint;
BEGIN
  SELECT total_points_earned, streak_days INTO _total_points, _streak
  FROM public.child_stats WHERE child_id = NEW.child_id;

  SELECT count(*) INTO _tasks_done
  FROM public.task_instances
  WHERE assigned_to_user_id = NEW.child_id AND status = 'validated';

  -- Streak badges
  IF _streak >= 7 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'streak_7') ON CONFLICT DO NOTHING;
  END IF;
  IF _streak >= 30 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'streak_30') ON CONFLICT DO NOTHING;
  END IF;

  -- Task count badges
  IF _tasks_done >= 10 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'tasks_10') ON CONFLICT DO NOTHING;
  END IF;
  IF _tasks_done >= 50 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'tasks_50') ON CONFLICT DO NOTHING;
  END IF;
  IF _tasks_done >= 100 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'tasks_100') ON CONFLICT DO NOTHING;
  END IF;
  IF _tasks_done >= 500 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'tasks_500') ON CONFLICT DO NOTHING;
  END IF;

  -- Points badges
  IF _total_points >= 100 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'points_100') ON CONFLICT DO NOTHING;
  END IF;
  IF _total_points >= 500 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'points_500') ON CONFLICT DO NOTHING;
  END IF;
  IF _total_points >= 1000 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'points_1000') ON CONFLICT DO NOTHING;
  END IF;

  -- Zero penalty day badge (awarded if daily_penalties = 0 and at least 1 task done today)
  IF NEW.daily_penalties = 0 AND _tasks_done >= 1 THEN
    INSERT INTO public.child_badges (child_id, badge_key) VALUES (NEW.child_id, 'zero_penalty_day') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_child_stats_updated
  AFTER UPDATE ON public.child_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_badges();
