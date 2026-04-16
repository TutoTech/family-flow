-- Add global setting on family_settings
ALTER TABLE public.family_settings
ADD COLUMN IF NOT EXISTS auto_validate_after_midnight boolean NOT NULL DEFAULT false;

-- Add per-template override (NULL = use family default, true/false = force value)
ALTER TABLE public.task_templates
ADD COLUMN IF NOT EXISTS auto_validate_after_midnight boolean DEFAULT NULL;

-- Function: auto-validate awaiting_validation tasks from previous days
CREATE OR REPLACE FUNCTION public.auto_validate_pending_tasks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _count integer := 0;
BEGIN
  -- Update task instances that:
  -- - are awaiting_validation
  -- - scheduled for a date strictly before today (so they're "overdue" past midnight)
  -- - their template (or family default) has auto-validation enabled
  WITH to_validate AS (
    SELECT ti.id
    FROM public.task_instances ti
    JOIN public.task_templates tt ON tt.id = ti.task_template_id
    JOIN public.family_settings fs ON fs.family_id = ti.family_id
    WHERE ti.status = 'awaiting_validation'
      AND ti.scheduled_for_date < CURRENT_DATE
      AND COALESCE(tt.auto_validate_after_midnight, fs.auto_validate_after_midnight) = true
  )
  UPDATE public.task_instances ti
  SET status = 'validated',
      validated_at = now(),
      updated_at = now()
  FROM to_validate
  WHERE ti.id = to_validate.id;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$function$;