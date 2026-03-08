
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications (via security definer functions)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function: notify parents when a task is completed by a child
CREATE OR REPLACE FUNCTION public.handle_task_completed_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _child_name text;
  _task_title text;
  _parent record;
  _family_id uuid;
BEGIN
  -- Only fire when status changes to 'done' or 'awaiting_validation'
  IF (NEW.status IN ('done', 'awaiting_validation')) AND (OLD.status = 'pending' OR OLD.status = 'late') THEN
    -- Get child name
    SELECT name INTO _child_name FROM public.profiles WHERE user_id = NEW.assigned_to_user_id;
    
    -- Get task title
    SELECT title INTO _task_title FROM public.task_templates WHERE id = NEW.task_template_id;
    
    -- Get family_id
    _family_id := NEW.family_id;
    
    -- Notify all parents in the family
    FOR _parent IN
      SELECT p.user_id FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.user_id
      WHERE p.family_id = _family_id AND ur.role = 'parent'
    LOOP
      INSERT INTO public.notifications (user_id, title, body, type, metadata)
      VALUES (
        _parent.user_id,
        'Tâche complétée',
        COALESCE(_child_name, 'Un enfant') || ' a terminé la tâche "' || COALESCE(_task_title, '?') || '"',
        'task_completed',
        jsonb_build_object('task_instance_id', NEW.id, 'child_id', NEW.assigned_to_user_id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Function: notify child when a reward redemption is approved
CREATE OR REPLACE FUNCTION public.handle_reward_approved_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _reward_title text;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'requested' THEN
    SELECT title INTO _reward_title FROM public.rewards WHERE id = NEW.reward_id;
    
    INSERT INTO public.notifications (user_id, title, body, type, metadata)
    VALUES (
      NEW.child_id,
      'Récompense approuvée !',
      'Ta récompense "' || COALESCE(_reward_title, '?') || '" a été approuvée !',
      'reward_approved',
      jsonb_build_object('reward_id', NEW.reward_id, 'redemption_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_task_completed_notify
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_completed_notification();

CREATE TRIGGER on_reward_approved_notify
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reward_approved_notification();
