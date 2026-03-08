
-- Create storage bucket for task evidence photos
INSERT INTO storage.buckets (id, name, public) VALUES ('task-evidence', 'task-evidence', true);

-- Allow authenticated users to upload to task-evidence bucket
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'task-evidence');

-- Allow authenticated users to view evidence from their family
CREATE POLICY "Authenticated users can view evidence"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'task-evidence');

-- Create function to generate today's task instances from active templates
CREATE OR REPLACE FUNCTION public.generate_daily_task_instances(_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _template RECORD;
  _today date := CURRENT_DATE;
  _day_of_week int := EXTRACT(DOW FROM _today)::int; -- 0=Sun, 6=Sat
  _is_weekday boolean := _day_of_week BETWEEN 1 AND 5;
  _is_weekend boolean := _day_of_week IN (0, 6);
  _should_create boolean;
BEGIN
  FOR _template IN
    SELECT * FROM public.task_templates
    WHERE family_id = _family_id AND is_active = true
  LOOP
    -- Check if instance already exists for today
    IF EXISTS (
      SELECT 1 FROM public.task_instances
      WHERE task_template_id = _template.id
        AND scheduled_for_date = _today
    ) THEN
      CONTINUE;
    END IF;

    -- Determine if we should create based on recurrence
    _should_create := false;
    CASE _template.recurrence_type
      WHEN 'daily' THEN _should_create := true;
      WHEN 'weekdays' THEN _should_create := _is_weekday;
      WHEN 'weekends' THEN _should_create := _is_weekend;
      WHEN 'weekly' THEN
        -- Check if today matches the configured day
        IF _template.recurrence_config IS NOT NULL AND _template.recurrence_config ? 'day_of_week' THEN
          _should_create := (_template.recurrence_config->>'day_of_week')::int = _day_of_week;
        ELSE
          _should_create := _day_of_week = 1; -- default Monday
        END IF;
      WHEN 'custom' THEN
        IF _template.recurrence_config IS NOT NULL AND _template.recurrence_config ? 'days' THEN
          _should_create := _day_of_week::text = ANY(
            SELECT jsonb_array_elements_text(_template.recurrence_config->'days')
          );
        END IF;
    END CASE;

    IF _should_create THEN
      INSERT INTO public.task_instances (
        task_template_id, family_id, assigned_to_user_id,
        scheduled_for_date, due_at, status
      ) VALUES (
        _template.id, _family_id, _template.assigned_to_user_id,
        _today, (_today || ' ' || _template.due_time)::timestamptz, 'pending'
      );
    END IF;
  END LOOP;
END;
$$;
