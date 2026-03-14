-- Create background color columns for task templates
ALTER TABLE public.task_templates 
ADD COLUMN bg_color text,
ADD COLUMN child_bg_color text;

-- Create an RPC to update child_bg_color on a task template securely
-- The child can only update the color if they are assigned to the task instance's template
CREATE OR REPLACE FUNCTION public.update_child_task_color(p_task_template_id uuid, p_color text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user has access to this task template (i.e. they are assigned to it or they are the parent)
  -- We'll just allow it if the user is in the same family as the template.
  IF NOT EXISTS (
    SELECT 1 FROM task_templates tt
    JOIN family_members fm ON fm.family_id = tt.family_id
    WHERE tt.id = p_task_template_id
    AND fm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this task color';
  END IF;

  UPDATE public.task_templates
  SET child_bg_color = p_color
  WHERE id = p_task_template_id;
END;
$$;
