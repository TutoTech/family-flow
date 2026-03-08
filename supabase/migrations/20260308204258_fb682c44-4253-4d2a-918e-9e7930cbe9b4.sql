
CREATE OR REPLACE FUNCTION public.handle_task_created_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _parent_name text;
  _task_title text;
BEGIN
  -- Only notify if the assigned user is a child
  IF has_role(NEW.assigned_to_user_id, 'child') THEN
    -- Get parent name
    SELECT name INTO _parent_name FROM public.profiles WHERE user_id = NEW.created_by_user_id;

    INSERT INTO public.notifications (user_id, title, body, type, metadata)
    VALUES (
      NEW.assigned_to_user_id,
      'Nouvelle tâche assignée',
      COALESCE(_parent_name, 'Un parent') || ' t''a assigné la tâche "' || COALESCE(NEW.title, '?') || '"',
      'task_assigned',
      jsonb_build_object('task_template_id', NEW.id, 'parent_id', NEW.created_by_user_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_template_created
  AFTER INSERT ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_created_notification();
